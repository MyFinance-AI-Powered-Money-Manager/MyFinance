const db = require('../config/db');
const axios = require('axios');

const getFinancialInsights = async (req, res) => {
    // Menangkap filter dari Frontend (misal: /api/insights?wallet_id=xxx&period=monthly)
    const { wallet_id, period } = req.query; 

    try {
        if (!wallet_id) {
            return res.status(400).json({ status: 'error', message: 'wallet_id wajib disertakan.' });
        }

        // 1. Tarik Data Historis dari Database (Supabase)
        // Kita ambil transaksi bulan ini sebagai contoh dasar
        const currentMonth = new Date().toISOString().slice(0, 7); 
        
        const transactions = await db.query(`
            SELECT type, total_amount, category, transaction_date 
            FROM transactions 
            WHERE wallet_id = $1 AND to_char(transaction_date, 'YYYY-MM') = $2
        `, [wallet_id, currentMonth]);

        if (transactions.rows.length === 0) {
            return res.status(200).json({ 
                status: 'success', 
                message: 'Belum ada transaksi bulan ini untuk dianalisis.',
                data: null
            });
        }

        // 2. Siapkan Payload (Bungkus data) untuk dikirim ke Python
        const payloadToAI = {
            period: period || 'monthly',
            transactions: transactions.rows
        };

        // 3. Tembak ke Server Python (AI Service)
        // Pastikan tim AI punya endpoint ini di FastAPI/Flask mereka
        const aiResponse = await axios.post('http://localhost:8000/api/ai/generate-insight', payloadToAI);

        // 4. Kembalikan Insight dari AI ke Frontend
        res.status(200).json({
            status: 'success',
            message: 'Insight berhasil di-generate',
            data: aiResponse.data // Berisi teks saran/insight dari AI
        });

    } catch (error) {
        console.error('Error fetching AI Insights:', error);
        
        // Handle error jika server Python mati/belum jalan
        if (error.code === 'ECONNREFUSED') {
            return res.status(503).json({ 
                status: 'error', 
                message: 'Server AI (Python) sedang tidak aktif atau tidak dapat dijangkau.' 
            });
        }

        res.status(500).json({ status: 'error', message: 'Terjadi kesalahan sistem.' });
    }
};

module.exports = { getFinancialInsights };