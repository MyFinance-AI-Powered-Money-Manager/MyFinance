const db = require('../config/db');

const exportDataForDS = async (req, res) => {
    try {
        const userId = req.query.USERID || req.query.user_id;
        let startDateStr = req.query.START || req.query.start;
        let endDateStr = req.query.END || req.query.end;

        if (!userId || !startDateStr || !endDateStr) {
            return res.status(400).json({ error: 'Missing required parameters: USERID, START, END' });
        }

        // Convert YYYY_MM_DD to YYYY-MM-DD
        const startDate = startDateStr.replace(/_/g, '-');
        const endDate = endDateStr.replace(/_/g, '-');
        const monthPeriod = startDate.substring(0, 7); // Extract YYYY-MM for budget query

        const [transactions, transactionItems, budgets] = await Promise.all([
            db.query(
                `SELECT id, wallet_id, type, total_amount, category, subcategory, description, transaction_date 
                 FROM transactions 
                 WHERE user_id = $1 AND transaction_date::date >= $2::date AND transaction_date::date <= $3::date`,
                [userId, startDate, endDate]
            ),
            db.query(
                `SELECT ti.id, ti.transaction_id, ti.item_name, ti.price, ti.category, ti.subcategory 
                 FROM transaction_items ti 
                 JOIN transactions t ON ti.transaction_id = t.id 
                 WHERE t.user_id = $1 AND t.transaction_date::date >= $2::date AND t.transaction_date::date <= $3::date`,
                [userId, startDate, endDate]
            ),
            db.query(
                `SELECT id, category, limit_amount, month_period 
                 FROM budgets 
                 WHERE user_id = $1 AND month_period = $2`,
                [userId, monthPeriod]
            )
        ]);

        const responseData = {
            user_id: userId,
            month_period: monthPeriod,
            start_date: startDate,
            end_date: endDate,
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
                month_period: b.month_period || monthPeriod
            }))
        };

        return res.status(200).json(responseData);

    } catch (error) {
        console.error('Error exporting data for DS:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};

module.exports = { exportDataForDS };
