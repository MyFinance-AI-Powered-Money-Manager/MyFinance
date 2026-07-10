const fs = require('fs');
const crypto = require('crypto'); // buat generate UUID asli
const db = require('./src/config/db'); // Pastikan path ini benar!

// 1. Array file JSON dari DS
const mockupData = ['2026-04.json', '2026-05.json'];

// KAMUS ID: Mengingat perubahan ID palsu (DS) menjadi UUID asli
const idMap = new Map();

function getRealUUID(filename, fakeId) {
    const key = `${filename}_${fakeId}`;
    if (!idMap.has(key)) {
        idMap.set(key, crypto.randomUUID());
    }
    return idMap.get(key);
}

async function runSeeder() {
    console.log('🚀 Memulai proses seeding data mockup...');
    const client = await db.connect();

    try {
        await client.query('BEGIN'); // Kunci database sementara

        const targetUserId = 'cc3fd629-6e03-4b21-b6db-6e20f3d9dc39';
        console.log(`  🧹 Membersihkan data seeder lama untuk user: ${targetUserId}...`);
        await client.query(`DELETE FROM transaction_items WHERE transaction_id IN (SELECT id FROM transactions WHERE user_id = $1)`, [targetUserId]);
        await client.query(`DELETE FROM transactions WHERE user_id = $1`, [targetUserId]);
        await client.query(`DELETE FROM budgets WHERE user_id = $1`, [targetUserId]);

        // Looping setiap file di dalam array mockupData
        for (const filename of mockupData) {
            console.log(`\n📂 Membaca dan memproses file: ${filename}...`);
            
            // BACA DAN PARSE FILE JSON-NYA DI SINI!
            const rawData = fs.readFileSync(filename);
            const data = JSON.parse(rawData);

            // --- STEP 1: INSERT BUDGETS ---
            console.log(`  ⏳ Memasukkan budgets dari ${filename}...`);
            for (const b of data.budgets) {
                const query = `
                    INSERT INTO budgets (id, category, limit_amount, month_period, user_id) 
                    VALUES ($1, $2, $3, $4, $5)
                    ON CONFLICT (id) DO NOTHING;
                `;
                const realId = getRealUUID(filename, b.id); // Ubah 'bdgt-001' jadi UUID
                await client.query(query, [realId, b.category, b.limit_amount, b.month_period, data.user_id]);
            }

            // --- STEP 2: INSERT TRANSACTIONS ---
            console.log(`  ⏳ Memasukkan transactions dari ${filename}...`);
            for (const t of data.transactions) {
                const query = `
                    INSERT INTO transactions (id, user_id, wallet_id, type, total_amount, category, subcategory, description, transaction_date) 
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                    ON CONFLICT (id) DO NOTHING;
                `;
                const description = t.description || t.deskripsi;
                const trxDate = t.transaction_date || t.created_at;
                
                const realId = getRealUUID(filename, t.id); // Ubah 'trx-0001' jadi UUID
                await client.query(query, [realId, data.user_id, t.wallet_id, t.type, t.total_amount, t.category, t.subcategory, description, trxDate]);
            }

            // --- STEP 3: INSERT TRANSACTION ITEMS ---
            console.log(`  ⏳ Memasukkan transaction_items dari ${filename}...`);
            for (const i of data.transaction_items) {
                const query = `
                    INSERT INTO transaction_items (id, transaction_id, item_name, price, category, subcategory) 
                    VALUES ($1, $2, $3, $4, $5, $6)
                    ON CONFLICT (id) DO NOTHING;
                `;
                const realItemId = crypto.randomUUID(); // Item selalu dapat UUID baru
                const mappedTrxId = getRealUUID(filename, i.transaction_id); // Ambil UUID bapaknya (transaksi) dari Kamus

                await client.query(query, [realItemId, mappedTrxId, i.item_name, i.price, i.category, i.subcategory]);
            }
            
            console.log(`  ✅ File ${filename} beres!`);
        }

        // JIKA SEMUA MULUS, SIMPAN PERMANEN!
        await client.query('COMMIT');
        console.log('\n SEEDING SELESAI TOTAL! Data berhasil masuk ke Postgres.');

    } catch (err) {
        // JIKA ADA 1 SAJA YANG ERROR, BATALKAN SEMUA!
        await client.query('ROLLBACK');
        console.error('\n PROSES BERHENTI KARENA ERROR! Semua insert dibatalkan (Rollback).');
        console.error('Pesan Error:', err.message);
    } finally {
        client.release();
        process.exit();
    }
}

runSeeder();