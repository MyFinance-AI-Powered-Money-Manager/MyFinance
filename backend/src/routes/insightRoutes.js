const express = require('express');
const router = express.Router();
const { getFinancialInsights, triggerMonthlyInsight } = require('../controllers/insightController');
const authenticateToken = require('../middlewares/authMiddleware');


// Rute untuk mendapatkan insight keuangan dari AI dan autentikasi dengan JWT (memerlukan token) 
router.get('/', authenticateToken, getFinancialInsights);

// Rute untuk memicu cron job secara manual
router.post('/trigger', triggerMonthlyInsight);

module.exports = router;    