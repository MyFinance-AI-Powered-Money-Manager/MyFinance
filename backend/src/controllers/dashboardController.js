const db = require('../config/db');
const axios = require('axios');
require('dotenv').config();

const getDashboardSummary = async (req, res) => {
    const userId = req.user.id;

    // Ambil bulan saat ini (Format: YYYY-MM) untuk filter data bulan berjalan
    const currentMonth = new Date().toISOString().slice(0, 7);

    try {
        // 1. Tarik Saldo Keseluruhan (Agregasi total dari semua dompet user)
        const walletResult = await db.query(
            'SELECT COALESCE(SUM(balance), 0) as current_balance FROM wallets WHERE user_id = $1',
            [userId]
        );
        const currentBalance = parseFloat(walletResult.rows[0].current_balance);

        // 2. Tarik Ringkasan Pemasukan & Pengeluaran Bulan Ini
        const summaryResult = await db.query(`
            SELECT 
                COALESCE(SUM(CASE WHEN type = 'INCOME' THEN total_amount ELSE 0 END), 0) as total_income,
                COALESCE(SUM(CASE WHEN type = 'EXPENSE' THEN total_amount ELSE 0 END), 0) as total_expense
            FROM transactions 
            WHERE user_id = $1 AND to_char(transaction_date, 'YYYY-MM') = $2
        `, [userId, currentMonth]);

        const totalIncome = parseFloat(summaryResult.rows[0].total_income);
        const totalExpense = parseFloat(summaryResult.rows[0].total_expense);

        // 3. Susun Raw Data Payload (Data Mentah) untuk dikirim ke AI Python
        const transactions = await db.query(`
            SELECT id, wallet_id, type, total_amount, category, subcategory, description, transaction_date 
            FROM transactions 
            WHERE user_id = $1 AND to_char(transaction_date, 'YYYY-MM') = $2
        `, [userId, currentMonth]);

        const transactionItems = await db.query(`
            SELECT ti.id, ti.transaction_id, ti.item_name, ti.price, ti.category, ti.subcategory
            FROM transaction_items ti
            JOIN transactions t ON ti.transaction_id = t.id
            WHERE t.user_id = $1 AND to_char(t.transaction_date, 'YYYY-MM') = $2
        `, [userId, currentMonth]);

        const budgets = await db.query(`
            SELECT id, category, limit_amount, month_period 
            FROM budgets 
            WHERE user_id = $1 AND month_period = $2
        `, [userId, currentMonth]);

        const rawDataPayload = {
            user_id: userId,
            month_period: currentMonth,
            transactions: transactions.rows,
            transaction_items: transactionItems.rows,
            budgets: budgets.rows
        };

        // 4. DS response
        let dsMetrics = {
            health_score: 0,
            predicted_cashflow: 0,
            overbudget_risk: "low",
            money_leak: "-"
        };

        try {
            // Tembak ke API Data Science Python
            const pythonUrl = process.env.PYTHON_API_URL || 'http://96.9.210.207:8000/api/v1';
            const dsResponse = await axios.post(`${pythonUrl}/ds/predict`, rawDataPayload, {
                headers: {
                    'x-internal-service-key': process.env.INTERNAL_SERVICE_KEY
                },
                timeout: 30000
            });
            dsMetrics = dsResponse.data;
        } catch (dsError) {
            if (dsError.response) {
                console.error(`DS Service Error: ${dsError.response.status} - ${JSON.stringify(dsError.response.data)}`);
            } else {
                console.error("DS Service Offline/Unreachable: Menggunakan fallback data default.");
            }
        }

        // 5. Kirim Response Final ke Frontend
        res.status(200).json({
            status: 'success',
            data: {
                current_balance: currentBalance,
                total_income: totalIncome,
                total_expense: totalExpense,
                ds_metrics: dsMetrics
            }
        });

    } catch (error) {
        console.error('Error Dashboard Summary:', error);
        res.status(500).json({ status: 'error', message: 'Terjadi kesalahan sistem saat memuat dashboard.' });
    }
};

module.exports = { getDashboardSummary };