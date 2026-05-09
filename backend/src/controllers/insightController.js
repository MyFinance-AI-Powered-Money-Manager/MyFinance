const db = require('../config/db');

const getFinancialInsights = async (req, res) => {
    const { wallet_id, period } = req.query; 

    try {
        if (!wallet_id || !period) {
            return res.status(400).json({ status: 'error', message: 'wallet_id dan period wajib disertakan.' });
        }

        // CUMA NGE-QUERY SELECT 
        const insightData = await db.query(`
            SELECT * FROM financial_insights 
            WHERE wallet_id = $1 AND period = $2
        `, [wallet_id, period]);

        if (insightData.rows.length === 0) {
             return res.status(200).json({ 
                 status: 'success', 
                 message: 'Insight belum tersedia untuk bulan ini.',
                 data: null
             });
        }

        // Langsung return ke Frontend 
        res.status(200).json({
            status: 'success',
            message: 'Insight berhasil diambil',
            data: insightData.rows[0] 
        });

    } catch (error) {
        console.error('Error fetching AI Insights:', error);
        res.status(500).json({ status: 'error', message: 'Terjadi kesalahan sistem.' });
    }
};

module.exports = { getFinancialInsights };