const db = require('../config/db');


const createTransaction = async (req, res) => {
    // Backend (Node.js) - Ambil User ID dari JWT
    const userId = req.user.id;

    // 1. TAMBAHAN BARU: Tangkap image_url
    const {
        wallet_id, type, total_amount, category, subcategory,
        description, transaction_date, items,
        image_url
    } = req.body;

    const client = await db.connect();
    // Normalisasi Tipe Transaksi ke UPPERCASE agar seragam (INCOME/EXPENSE)
    const txType = type.toUpperCase();

    try {
        await client.query('BEGIN');

        // 2. Cek Saldo Dompet
        const walletResult = await client.query('SELECT balance FROM wallets WHERE id = $1 FOR UPDATE', [wallet_id]);
        if (walletResult.rows.length === 0) throw new Error('Dompet tidak ditemukan.');

        let currentBalance = parseFloat(walletResult.rows[0].balance);

        if (txType === 'EXPENSE' && currentBalance < total_amount) {
            throw new Error('Saldo dompet tidak mencukupi.');
        }

        // 3. Simpan Transaksi Utama jika tidak ada data struk/scan
        const newTransaction = await client.query(
            `INSERT INTO transactions (user_id, wallet_id, type, total_amount, category, subcategory, description, transaction_date) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
            [userId, wallet_id, type, total_amount, category, subcategory, description, transaction_date]
        );

        const transactionId = newTransaction.rows[0].id;

        // 4. Simpan Detail Item OCR/Struk ke tabel transaction_items
        if (items && Array.isArray(items) && items.length > 0) {
            for (const item of items) {
                await client.query(
                    `INSERT INTO transaction_items (transaction_id, item_name, price, category, subcategory) 
                     VALUES ($1, $2, $3, $4, $5)`,
                    [transactionId, item.item_name, item.price, item.category, item.subcategory]
                );
            }
        }

        // 5. Simpan Bukti Scan ke tabel receipt_scans
        console.log(`   -> [Backend Debug] image_url: "${image_url}"`);
        if (image_url && String(image_url).trim() !== '') {
            await client.query(
                `INSERT INTO receipt_scans (user_id, transaction_id, image_url) 
                 VALUES ($1, $2, $3)`,
                [userId, transactionId, image_url]
            );
            console.log('   -> [Backend Debug] Success: receipt_scans disimpan di Supabase bucket.');
        } else {
            console.log('   -> [Backend Debug] Skip: image_url kosong.');
        }

        // 6. Update Saldo Dompet
        const newBalance = txType === 'INCOME' ? currentBalance + total_amount : currentBalance - total_amount;
        await client.query('UPDATE wallets SET balance = $1 WHERE id = $2', [newBalance, wallet_id]);

        // 7. LOGIC BARU: CEK OVERBUDGET (REAL-TIME PROTECTION)
        let isOverbudget = false;

        if (txType === 'EXPENSE') {
            // Ambil format YYYY-MM dari transaction_date
            const currentMonth = new Date(transaction_date).toISOString().slice(0, 7);

            // Cek apakah user punya set limit budget untuk kategori ini di bulan ini
            const budgetCheck = await client.query(
                `SELECT limit_amount FROM budgets 
                 WHERE user_id = $1 AND category = $2 AND month_period = $3`,
                [userId, category, currentMonth]
            );

            if (budgetCheck.rows.length > 0) {
                const limitAmount = parseFloat(budgetCheck.rows[0].limit_amount);

                // Hitung total pengeluaran untuk kategori ini di bulan ini
                // (Termasuk transaksi yang baru saja di-insert di atas)
                const expenseCheck = await client.query(
                    `SELECT SUM(total_amount) as total_spent 
                     FROM transactions 
                     WHERE user_id = $1 AND type = 'EXPENSE' AND category = $2 AND to_char(transaction_date, 'YYYY-MM') = $3`,
                    [userId, category, currentMonth]
                );

                const totalSpent = parseFloat(expenseCheck.rows[0].total_spent || 0);

                // Jika total pengeluaran >= limit, nyalakan flag overbudget!
                if (totalSpent >= limitAmount) {
                    isOverbudget = true;
                }
            }
        }

        await client.query('COMMIT');

        res.status(201).json({
            status: 'success',
            message: 'Transaksi, item, dan bukti scan AI berhasil dicatat.',
            is_overbudget: isOverbudget, // Flag yang ditunggu frontend untuk munculin pop-up Warning
            data: { transaction_id: transactionId }
        });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error transaction:', error);
        res.status(400).json({ status: 'error', message: error.message });
    } finally {
        client.release();
    }
};

const getTransactions = async (req, res) => {
    try {
        // Mengambil riwayat transaksi sekaligus melakukan JOIN untuk mendapatkan nama dompet
        const tx = await db.query(
            `SELECT t.*, w.name as wallet_name 
             FROM transactions t 
             JOIN wallets w ON t.wallet_id = w.id 
             WHERE t.user_id = $1 
             ORDER BY t.transaction_date DESC, t.created_at DESC`,
            [req.user.id]
        );
        res.status(200).json({ status: 'success', data: tx.rows });
    } catch (error) {
        console.error('Error getTransactions:', error);
        res.status(500).json({ status: 'error', message: 'Terjadi kesalahan server saat mengambil data transaksi.' });
    }
};

const deleteTransaction = async (req, res) => {
    const userId = req.user.id;
    const txId = req.params.id;
    const client = await db.connect();

    try {
        await client.query('BEGIN');

        // 1. Cek validitas transaksi
        const txCheck = await client.query('SELECT * FROM transactions WHERE id = $1 AND user_id = $2 FOR UPDATE', [txId, userId]);
        if (txCheck.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ status: 'error', message: 'Transaksi tidak ditemukan.' });
        }

        const tx = txCheck.rows[0];

        // 2. Hapus baris transaksi dari buku besar
        await client.query('DELETE FROM transactions WHERE id = $1', [txId]);

        // 3. Kembalikan saldo dompet (Reverse Logic)
        if (tx.type === 'EXPENSE') {
            await client.query('UPDATE wallets SET balance = balance + $1 WHERE id = $2', [tx.total_amount, tx.wallet_id]);
        } else if (tx.type === 'INCOME') {
            await client.query('UPDATE wallets SET balance = balance - $1 WHERE id = $2', [tx.total_amount, tx.wallet_id]);
        }

        await client.query('COMMIT');

        res.status(200).json({ status: 'success', message: 'Transaksi berhasil dihapus dan saldo telah dikembalikan.' });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error deleteTransaction:', error);
        res.status(500).json({ status: 'error', message: 'Terjadi kesalahan server saat menghapus transaksi.' });
    } finally {
        client.release();
    }
};




module.exports = { createTransaction, getTransactions, deleteTransaction };