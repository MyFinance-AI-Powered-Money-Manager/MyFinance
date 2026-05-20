// backend/src/routes/transactionRoutes.js
const express = require('express');
const router = express.Router();
const { createTransaction, getTransactions, deleteTransaction } = require('../controllers/transactionController');
const authenticateToken = require('../middlewares/authMiddleware');

const multer = require('multer');
const { createClient } = require('@supabase/supabase-js');
const storage = multer.memoryStorage(); // Simpan di memori (tidak di disk)
const upload = multer({ storage });

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);

// Rute CRUD Transactions
router.post('/', authenticateToken, createTransaction);
router.get('/', authenticateToken, getTransactions);
router.delete('/:id', authenticateToken, deleteTransaction);

router.post('/upload-receipt', authenticateToken, upload.single('file'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ status: 'error', message: 'Tidak ada file.' });

        const fileExt = req.file.originalname.split('.').pop();
        const fileName = `${req.user.id}-${Date.now()}.${fileExt}`;
        const filePath = `receipt_scan/${fileName}`;

        const { data, error } = await supabase.storage
            .from('receipt_scan') // bucket: receipt-scan
            .upload(filePath, req.file.buffer, {
                contentType: req.file.mimetype,
                upsert: true
            });

        if (error) throw error;

        // Ambil Public URL
        const publicUrlData = supabase.storage
            .from('receipt_scan')
            .getPublicUrl(filePath);

        console.log('   -> [Backend Debug] Upload Success, URL:', publicUrlData.data.publicUrl);
        res.status(200).json({ status: 'success', image_url: publicUrlData.data.publicUrl });
    } catch (err) {
        console.error('Upload Error:', err);
        res.status(500).json({ status: 'error', message: err.message });
    }
});


module.exports = router;