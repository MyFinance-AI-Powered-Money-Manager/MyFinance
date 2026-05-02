const express = require('express');
const router = express.Router();
const { getFinancialInsights } = require('../controllers/insightController');
const authenticateToken = require('../middlewares/authMiddleware');

// Rute untuk mendapatkan insight keuangan dari AI dan autentikasi dengan JWT (memerlukan token) 
router.get('/', authenticateToken, getFinancialInsights);

module.exports = router;    