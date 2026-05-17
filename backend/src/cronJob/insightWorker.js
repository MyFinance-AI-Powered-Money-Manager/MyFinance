// backend/src/cronJob/insightWorker.js
const cron = require('node-cron');
const db = require('../config/db');
const axios = require('axios');

const runMonthlyInsight = async () => {
    console.log('⏳ [CRON JOB] Memulai proses sinkronisasi Rapor Bulanan (DS & AI)...');

    try {
        const date = new Date();
        date.setMonth(date.getMonth() - 1);
        const lastMonth = date.toISOString().slice(0, 7);

        const users = await db.query('SELECT id FROM users');
        const pythonUrl = process.env.PYTHON_API_URL || 'http://96.9.210.207:8000/api/v1';

        for (const user of users.rows) {
            const userId = user.id;

            // 1. Tarik semua data mentah (Transactions, Items, Budgets)
            const [transactions, budgets, transactionItems] = await Promise.all([
                db.query(`SELECT type, total_amount, category, subcategory FROM transactions WHERE user_id = $1 AND to_char(transaction_date, 'YYYY-MM') = $2`, [userId, lastMonth]),
                db.query(`SELECT category, limit_amount, month_period FROM budgets WHERE user_id = $1 AND month_period = $2`, [userId, lastMonth]),
                db.query(`SELECT ti.item_name, ti.price, ti.category FROM transaction_items ti JOIN transactions t ON ti.transaction_id = t.id WHERE t.user_id = $1 AND to_char(t.transaction_date, 'YYYY-MM') = $2`, [userId, lastMonth])
            ]);

            if (transactions.rows.length === 0) continue;

            const payload = {
                user_id: userId,
                month_period: lastMonth,
                transactions: transactions.rows,
                transaction_items: transactionItems.rows,
                budgets: budgets.rows
            };

            // 2. LOGIKA INDEPENDEN: Tembak DS & AI secara terpisah agar tidak saling menjatuhkan
            console.log(`   -> Menghubungi API DS & AI untuk User: ${userId}`);
            
            // Inisialisasi default values
            let health_score = 0;
            let predicted_cashflow = 0;
            let overbudget_risk = "low";
            let money_leak = "-";
            let total_spent = 0;
            let total_budget = 0;
            let categories = [];
            let ai_insight = "Insight belum tersedia karena masalah koneksi ke AI Service.";

            const axiosConfig = {
                headers: {
                    'x-internal-service-key': process.env.INTERNAL_SERVICE_KEY || 'secret-antara-express-dan-python'
                },
                timeout: 30000
            };

            // Tembak DS (Team Bang Pascal)
            try {
                const dsRes = await axios.post(`${pythonUrl}/ds/predict`, payload, axiosConfig);
                if (dsRes.data) {
                    health_score = dsRes.data.health_score ?? 0;
                    predicted_cashflow = dsRes.data.predicted_cashflow ?? 0;
                    overbudget_risk = dsRes.data.overbudget_risk ?? "low";
                    money_leak = dsRes.data.money_leak ?? "-";
                    total_spent = dsRes.data.total_spent ?? 0;
                    total_budget = dsRes.data.total_budget ?? 0;
                    categories = dsRes.data.categories ?? [];
                }
            } catch (err) {
                if (err.response) {
                    console.error(` [Insight Worker] DS Service Error (${err.response.status}):`, JSON.stringify(err.response.data));
                } else {
                    console.error(` [Insight Worker] DS Service Unreachable:`, err.message);
                }
            }

            // Tembak AI (Team Bang Hafizh)
            try {
                const aiRes = await axios.post(`${pythonUrl}/ai/financial-insights/monthly`, payload, axiosConfig);
                ai_insight = aiRes.data.ai_insight;
            } catch (err) {
                if (err.response) {
                    console.error(` [Insight Worker] AI Service Error (${err.response.status}):`, JSON.stringify(err.response.data));
                } else {
                    console.error(` [Insight Worker] AI Service Unreachable:`, err.message);
                }
            }

            // 4. UPSERT (Update or Insert) ke tabel financial_insights
            await db.query(`
                INSERT INTO financial_insights 
                (user_id, month_period, health_score, predicted_cashflow, overbudget_risk, money_leak, ai_insight, total_spent, total_budget, raw_analysis_data)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
                ON CONFLICT (user_id, month_period) 
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
            `, [userId, lastMonth, health_score, predicted_cashflow, overbudget_risk, money_leak, ai_insight, total_spent, total_budget, JSON.stringify(categories)]);

            console.log(`Rapor berhasil disimpan untuk User: ${userId}`);
        }
    } catch (error) {
        if (error.response) {
            console.error(` [Insight Worker] API Error (${error.config.url}):`, error.response.status, error.response.data);
        } else if (error.request) {
            console.error(` [Insight Worker] No Response from AI Service (${error.config.url}). Check IP/Port & Firewall.`);
        } else {
            console.error(' [Insight Worker] Error:', error.message);
        }
    }
};

cron.schedule('0 0 1 * *', runMonthlyInsight, { scheduled: true, timezone: "Asia/Jakarta" });

module.exports = { runMonthlyInsight };