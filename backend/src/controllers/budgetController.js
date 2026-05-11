const db = require('../config/db');

const createBudget = async (req, res) => {
    // Menyesuaikan dengan schema DB: month_period
    const { category, limit_amount, month_period } = req.body;
    const userId = req.user.id;

    try {
        if (!category || !limit_amount || !month_period) {
            return res.status(400).json({ status: 'error', message: 'Kategori, limit, dan periode bulan wajib diisi.' });
        }

        const newBudget = await db.query(
            'INSERT INTO budgets (user_id, category, limit_amount, month_period) VALUES ($1, $2, $3, $4) RETURNING *',
            [userId, category, limit_amount, month_period]
        );

        res.status(201).json({ status: 'success', data: newBudget.rows[0] });
    } catch (error) {
        // Tangkap error UNIQUE CONSTRAINT
        if (error.code === '23505') {
            return res.status(400).json({
                status: 'error',
                message: `Anggaran untuk category ${category} pada periode ${month_period} sudah ada.`
            })
        }
        console.error(error);
        res.status(500).json({ status: 'error', message: 'Terjadi kesalahan server.' });
    }
};

const getBudgets = async (req, res) => {
    try {
        const budgets = await db.query('SELECT * FROM budgets WHERE user_id = $1 ORDER BY month_period DESC', [req.user.id]);
        res.status(200).json({ status: 'success', data: budgets.rows });
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Terjadi kesalahan server.' });
    }
};

const updateBudget = async (req, res) => {
    const { limit_amount } = req.body;
    try {
        const updated = await db.query(
            'UPDATE budgets SET limit_amount = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 AND user_id = $3 RETURNING *',
            [limit_amount, req.params.id, req.user.id]
        );
        if (updated.rows.length === 0) return res.status(404).json({ status: 'error', message: 'Anggaran tidak ditemukan.' });
        res.status(200).json({ status: 'success', data: updated.rows[0] });
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Terjadi kesalahan server.' });
    }
};

const deleteBudget = async (req, res) => {
    try {
        const deleted = await db.query('DELETE FROM budgets WHERE id = $1 AND user_id = $2 RETURNING *', [req.params.id, req.user.id]);
        if (deleted.rows.length === 0) return res.status(404).json({ status: 'error', message: 'Anggaran tidak ditemukan.' });
        res.status(200).json({ status: 'success', message: 'Anggaran dihapus.' });
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Terjadi kesalahan server.' });
    }
};

module.exports = { createBudget, getBudgets, updateBudget, deleteBudget };