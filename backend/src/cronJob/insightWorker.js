const cron = require('node-cron');
const db = require('../config/db');
const axios = require('axios');

// Jalan tiap tanggal 1 jam 00:00 (Waktu Jakarta)
cron.schedule('0 0 1 * *', async () => {
    console.log('⏳ [CRON JOB] AI Insight mulai berjalan...');
    
    try {
        // 1. Setup Tanggal Dinamis (Ambil "Bulan Lalu")
        // Jika cron jalan 1 Juni 2026, maka lastMonth = "2026-05"
        const date = new Date();
        date.setMonth(date.getMonth() - 1);
        const lastMonth = date.toISOString().slice(0, 7); 

        // 2. Ambil semua wallet_id (beserta user_id untuk narik budget nanti)
        const wallets = await db.query('SELECT id, user_id FROM wallets');

        for (const wallet of wallets.rows) {
            // 3. Tarik transaksi bulan lalu untuk dompet ini
            // Tambahkan subcategory agar AI bisa menganalisis secara presisi
            const transactions = await db.query(`
                SELECT type, total_amount, category, subcategory 
                FROM transactions 
                WHERE wallet_id = $1 AND to_char(transaction_date, 'YYYY-MM') = $2
            `, [wallet.id, lastMonth]);

            // 4. COLD START BYPASS (Kalau user baru / 0 transaksi)
            if (transactions.rows.length === 0) {
                // Gunakan UPSERT agar tidak error jika dijalankan ulang
                await db.query(`
                    INSERT INTO financial_insights 
                    (wallet_id, period, health_score, ai_insight, total_spent, total_budget) 
                    VALUES ($1, $2, 0, 'Yuk catat transaksi pertamamu bulan ini!', 0, 0)
                    ON CONFLICT (wallet_id, period) 
                    DO UPDATE SET 
                        ai_insight = EXCLUDED.ai_insight,
                        updated_at = CURRENT_TIMESTAMP
                `, [wallet.id, lastMonth]);
                
                console.log(`   -> [SKIP] Wallet ${wallet.id} belum ada transaksi (Cold Start).`);
                continue; // Lanjut ke dompet user berikutnya
            }

            // 5. Tarik data limit budget user di bulan tersebut
            const budgets = await db.query(`
                SELECT category, limit_amount 
                FROM budgets 
                WHERE user_id = $1 AND month_period = $2
            `, [wallet.user_id, lastMonth]);

            // 6. Nembak ke AI Service (Python FastAPI)
            const payload = { 
                transactions: transactions.rows,
                budgets: budgets.rows
            };
            
            // Gunakan endpoint yang sesuai di Swagger
            const aiResponse = await axios.post('http://localhost:8000/api/v1/ai/generate-monthly-report', payload);
            
            // 7. INSERT HASIL KE DATABASE 
            const { 
                health_score, 
                predicted_cashflow, 
                overbudget_risk, 
                money_leak, 
                ai_insight,
                total_spent,
                total_budget,
                categories // Raw data untuk pie chart
            } = aiResponse.data;
            
            // Gunakan UPSERT (ON CONFLICT DO UPDATE) 
            // Agar kalau Cron error di tengah jalan, bisa di-run ulang tanpa bikin data duplikat.
            await db.query(`
                INSERT INTO financial_insights 
                (wallet_id, period, health_score, predicted_cashflow, overbudget_risk, money_leak, ai_insight, total_spent, total_budget, raw_analysis_data) 
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
                ON CONFLICT (wallet_id, period) 
                DO UPDATE SET 
                    health_score = EXCLUDED.health_score,
                    predicted_cashflow = EXCLUDED.predicted_cashflow,
                    overbudget_risk = EXCLUDED.overbudget_risk,
                    money_leak = EXCLUDED.money_leak,
                    ai_insight = EXCLUDED.ai_insight,
                    total_spent = EXCLUDED.total_spent,
                    total_budget = EXCLUDED.total_budget,
                    raw_analysis_data = EXCLUDED.raw_analysis_data,
                    updated_at = CURRENT_TIMESTAMP
            `, [
                wallet.id, 
                lastMonth, 
                health_score, 
                predicted_cashflow, 
                overbudget_risk, 
                money_leak, 
                ai_insight,
                total_spent,
                total_budget,
                JSON.stringify(categories) // Simpan JSON array ke database
            ]);

            console.log(`   -> [SUCCESS] Insight digenerate untuk Wallet ${wallet.id}.`);
        }
        
        console.log(`✅ [CRON JOB] Selesai generate semua laporan bulan ${lastMonth}!`);
    } catch (error) {
        console.error('❌ [CRON JOB ERROR]:', error.message);
    }
}, {
    scheduled: true,
    timezone: "Asia/Jakarta" // Penting banget buat server cloud
});