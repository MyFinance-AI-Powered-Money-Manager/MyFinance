const db = require('../config/db');
const { runMonthlyInsight } = require('../cronJob/insightWorker');

const getFinancialInsights = async (req, res) => {
    // Hanya butuh period dari query URL, user_id diambil dari token JWT (Auth Middleware)
    const { month_period } = req.query; 
    const userId = req.user.id;

    try {
        if (!month_period) {
            return res.status(400).json({ status: 'error', message: 'Parameter month_period (YYYY-MM) wajib disertakan.' });
        }

        // FIXED: Mencari berdasarkan user_id, 
        const insightData = await db.query(`
            SELECT * FROM financial_insights 
            WHERE user_id = $1 AND month_period = $2
        `, [userId, month_period]);

        if (insightData.rows.length === 0) {
             return res.status(200).json({ 
                 status: 'success', 
                 message: 'Insight belum tersedia untuk bulan ini.',
                 data: null
             });
        }

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

const triggerMonthlyInsight = async (req, res) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token !== process.env.CRON_SECRET_KEY) {
        return res.status(403).json({ status: 'error', message: 'Unauthorized. Invalid Cron Secret Key.' });
    }

    try {
        // Trigger worker secara async (jangan ditunggu selesai kalau datanya banyak)
        runMonthlyInsight(); 
        
        res.status(200).json({ 
            status: 'success', 
            message: 'Cron job manual berhasil dipicu. Proses berjalan di background.' 
        });
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Gagal memicu cron job.' });
    }
};

module.exports = { getFinancialInsights, triggerMonthlyInsight };