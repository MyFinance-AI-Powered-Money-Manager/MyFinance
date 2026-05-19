// backend/src/cronJob/insightWorker.js
const cron = require('node-cron');
const db = require('../config/db');
const axios = require('axios');

const runMonthlyInsight = async () => {
    console.log('⏳ [CRON JOB] Memulai proses sinkronisasi Rapor Bulanan (DS & AI)...');

    try {
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth(); // 0-indexed (4 for May)
        
        let prevYear = year;
        let prevMonth = month - 1;
        if (prevMonth < 0) {
            prevMonth = 11;
            prevYear -= 1;
        }
        
        const formattedMonth = String(prevMonth + 1).padStart(2, '0');
        const lastMonth = `${prevYear}-${formattedMonth}`;

        const users = await db.query('SELECT id FROM users');
        const pythonUrl = process.env.PYTHON_API_URL || 'http://96.9.210.207:8000/api/v1';

        for (const user of users.rows) {
            const userId = user.id;

            // 1. Tarik semua data mentah (Transactions, Items, Budgets)
            const [transactions, budgets, transactionItems] = await Promise.all([
                db.query(`SELECT id, wallet_id, type, total_amount, category, subcategory, description, transaction_date FROM transactions WHERE user_id = $1 AND to_char(transaction_date, 'YYYY-MM') = $2`, [userId, lastMonth]),
                db.query(`SELECT id, category, limit_amount, month_period FROM budgets WHERE user_id = $1 AND month_period = $2`, [userId, lastMonth]),
                db.query(`SELECT ti.id, ti.transaction_id, ti.item_name, ti.price, ti.category, ti.subcategory FROM transaction_items ti JOIN transactions t ON ti.transaction_id = t.id WHERE t.user_id = $1 AND to_char(t.transaction_date, 'YYYY-MM') = $2`, [userId, lastMonth])
            ]);

            if (transactions.rows.length === 0) continue;

            // 1a. Format payload untuk DS (Data Science) - Sangat ketat terhadap null & nama field
            const dsPayload = {
                user_id: userId,
                month_period: lastMonth,
                transactions: transactions.rows.map(t => ({
                    id: t.id || "",
                    wallet_id: t.wallet_id || "",
                    type: t.type || "",
                    total_amount: Math.round(parseFloat(t.total_amount || 0)),
                    category: t.category || "General",
                    subcategory: t.subcategory || "General",
                    description: t.description || "",
                    transaction_date: t.transaction_date ? new Date(t.transaction_date).toISOString().split('T')[0] : ""
                })),
                transaction_items: transactionItems.rows.map(ti => ({
                    id: ti.id || "",
                    transaction_id: ti.transaction_id || "",
                    item_name: ti.item_name || "",
                    price: Math.round(parseFloat(ti.price || 0)),
                    category: ti.category || "General",
                    subcategory: ti.subcategory || "General"
                })),
                budgets: budgets.rows.map(b => ({
                    id: b.id || "",
                    category: b.category || "General",
                    limit_amount: Math.round(parseFloat(b.limit_amount || 0)),
                    month_period: b.month_period || lastMonth
                }))
            };

            // 1b. Format payload untuk AI (Hafizh) - Sesuai skema openapi AI
            const aiPayload = {
                user_id: userId,
                month_period: lastMonth,
                transactions: transactions.rows.map(t => ({
                    id: t.id,
                    user_id: userId,
                    wallet_id: t.wallet_id,
                    type: t.type,
                    total_amount: parseFloat(t.total_amount || 0),
                    category: t.category,
                    subcategory: t.subcategory,
                    deskripsi: t.description,
                    created_at: t.transaction_date ? new Date(t.transaction_date).toISOString() : null
                })),
                transaction_items: transactionItems.rows.map(ti => ({
                    id: ti.id,
                    transaction_id: ti.transaction_id,
                    item_name: ti.item_name,
                    price: parseFloat(ti.price || 0),
                    category: ti.category,
                    subcategory: ti.subcategory
                })),
                budgets: budgets.rows.map(b => ({
                    id: b.id,
                    user_id: userId,
                    limit_amount: parseFloat(b.limit_amount || 0),
                    month_period: b.month_period
                }))
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

             // Tembak DS (Team Bang Pascal) - Menggunakan 3 Endpoint secara Paralel
             try {
                 const [dsCatRes, dsBudgRes, dsLeakRes] = await Promise.allSettled([
                     axios.post(`${pythonUrl}/category-prediction`, dsPayload, axiosConfig),
                     axios.post(`${pythonUrl}/budget-calculator`, dsPayload, axiosConfig),
                     axios.post(`${pythonUrl}/leak-and-financial-score`, dsPayload, axiosConfig)
                 ]);
 
                 let dsData = {};
                 
                 // Gabungkan hasil respons dari ke-3 endpoint jika berhasil (fulfilled)
                 if (dsCatRes.status === 'fulfilled' && dsCatRes.value.data) {
                     dsData = { ...dsData, ...dsCatRes.value.data };
                 } else if (dsCatRes.status === 'rejected') {
                     console.error(' [Insight Worker] DS Category Prediction Error:', dsCatRes.reason?.response?.data || dsCatRes.reason?.message);
                 }
 
                 if (dsBudgRes.status === 'fulfilled' && dsBudgRes.value.data) {
                     dsData = { ...dsData, ...dsBudgRes.value.data };
                 } else if (dsBudgRes.status === 'rejected') {
                     console.error(' [Insight Worker] DS Budget Calculator Error:', dsBudgRes.reason?.response?.data || dsBudgRes.reason?.message);
                 }
 
                 if (dsLeakRes.status === 'fulfilled' && dsLeakRes.value.data) {
                     dsData = { ...dsData, ...dsLeakRes.value.data };
                 } else if (dsLeakRes.status === 'rejected') {
                     console.error(' [Insight Worker] DS Leak & Financial Score Error:', dsLeakRes.reason?.response?.data || dsLeakRes.reason?.message);
                 }
 
                 const finSummary = dsData['financial summary'] || {};
                 const leakProducts = dsData['leak_products'] || [];
                 
                 health_score = finSummary.financial_score ?? 0;
                 predicted_cashflow = finSummary.net_cashflow ?? 0;
                 overbudget_risk = finSummary.overbudget_category_count > 0 ? "high" : "low";
                 money_leak = leakProducts.length > 0 ? leakProducts.join(', ') : "-";
                 total_spent = finSummary.total_expense ?? dsPayload.transactions.reduce((sum, t) => t.type === 'EXPENSE' ? sum + t.total_amount : sum, 0);
                 total_budget = dsPayload.budgets.reduce((sum, b) => sum + b.limit_amount, 0);
                 categories = dsData;
                 
             } catch (err) {
                 console.error(` [Insight Worker] DS Service Parallel Execution Failed:`, err.message);
             }
 
             // Tembak AI (Team Bang Hafizh)
             try {
                 const aiRes = await axios.post(`${pythonUrl}/ai/financial-insights/monthly`, aiPayload, axiosConfig);
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