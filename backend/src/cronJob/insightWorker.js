const cron = require('node-cron');
const db = require('../config/db');
const axios = require('axios');

// Jalan tiap tanggal 1 jam 00:00 (Waktu Jakarta)
const runMonthlyInsight = async () => {
    console.log('⏳ [CRON JOB] AI Insight mulai berjalan...');

    try {
        // 1. Setup Tanggal Dinamis (Ambil "Bulan Lalu")
        const date = new Date();
        date.setMonth(date.getMonth() - 1);
        const lastMonth = date.toISOString().slice(0, 7);

        // 2. FIXED: Ambil semua user_id (Bukan wallet_id)
        const users = await db.query('SELECT id FROM users');

        for (const user of users.rows) {
            const userId = user.id;

            // 3. Tarik transaksi bulan lalu untuk USER ini (Gabungan dari semua dompetnya)
            const transactions = await db.query(`
                SELECT type, total_amount, category, subcategory 
                FROM transactions 
                WHERE user_id = $1 AND to_char(transaction_date, 'YYYY-MM') = $2
            `, [userId, lastMonth]);

            // 4. COLD START BYPASS (Kalau user baru / 0 transaksi)
            if (transactions.rows.length === 0) {
                const check = await db.query('SELECT id FROM financial_insights WHERE user_id = $1 AND period = $2', [userId, lastMonth]);

                if (check.rows.length === 0) {
                    await db.query(`
                        INSERT INTO financial_insights 
                        (user_id, period, health_score, ai_insight, total_spent, total_budget) 
                        VALUES ($1, $2, 0, 'Yuk catat transaksi pertamamu bulan ini!', 0, 0)
                    `, [userId, lastMonth]);
                }

                console.log(`   -> [SKIP] User ${userId} belum ada transaksi (Cold Start).`);
                continue;
            }

            // 5. Tarik data limit budget user di bulan tersebut
            const budgets = await db.query(`
                SELECT category, limit_amount 
                FROM budgets 
                WHERE user_id = $1 AND month_period = $2
            `, [userId, lastMonth]);

            // 6. Tarik transaction_item (OCR)
            const transactionItems = await db.query(`
                SELECT ti.id, ti.transaction_id, ti.item_name, ti.price, ti.category, ti.subcategory
                FROM transaction_items ti
                JOIN transactions t ON ti.transaction_id = t.id
                WHERE t.user_id = $1 AND to_char(t.transaction_date, 'YYYY-MM') = $2
            `, [userId, lastMonth]);

            // 6. Susun payload JSON Nembak ke AI Service (Python FastAPI)
            const payload = {
                user_id: userId,
                month_period: lastMonth,
                transactions: transactions.rows,
                transaction_items: transactionItems.rows,
                budgets: budgets.rows
            };

            // FIXED: URL Disesuaikan dengan Swagger API Docs 
            const pythonUrl = process.env.PYTHON_API_URL || 'http://localhost:8000';
            const aiResponse = await axios.post(`${pythonUrl}/api/v1/ai/insight/generate`, payload);

            // 7. INSERT HASIL KE DATABASE 
            const {
                health_score, predicted_cashflow, overbudget_risk, money_leak,
                ai_insight, total_spent, total_budget, categories
            } = aiResponse.data;

            // Cek apakah data bulan ini sudah ada (untuk antisipasi Cron run ulang)
            const checkInsight = await db.query('SELECT id FROM financial_insights WHERE user_id = $1 AND period = $2', [userId, lastMonth]);

            if (checkInsight.rows.length === 0) {
                // Jika belum ada, INSERT
                await db.query(`
                    INSERT INTO financial_insights 
                    (user_id, period, health_score, predicted_cashflow, overbudget_risk, money_leak, ai_insight, total_spent, total_budget, raw_analysis_data) 
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
                `, [userId, lastMonth, health_score, predicted_cashflow, overbudget_risk, money_leak, ai_insight, total_spent, total_budget, JSON.stringify(categories)]);
            } else {
                // Jika sudah ada, UPDATE
                await db.query(`
                    UPDATE financial_insights SET 
                        health_score = $1, predicted_cashflow = $2, overbudget_risk = $3, money_leak = $4,
                        ai_insight = $5, total_spent = $6, total_budget = $7, raw_analysis_data = $8, updated_at = CURRENT_TIMESTAMP
                    WHERE user_id = $9 AND period = $10
                `, [health_score, predicted_cashflow, overbudget_risk, money_leak, ai_insight, total_spent, total_budget, JSON.stringify(categories), userId, lastMonth]);
            }

            console.log(`   -> [SUCCESS] Insight digenerate untuk User ${userId}.`);
        }

        console.log(`✅ [CRON JOB] Selesai generate semua laporan bulan ${lastMonth}!`);
    } catch (error) {
        console.error('❌ [CRON JOB ERROR]:', error.message);
        throw error;
    }
};

// Jalan tiap tanggal 1 jam 00:00 (Waktu Jakarta)
cron.schedule('0 0 1 * *', runMonthlyInsight, {
    scheduled: true,
    timezone: "Asia/Jakarta"
});

module.exports = { runMonthlyInsight };