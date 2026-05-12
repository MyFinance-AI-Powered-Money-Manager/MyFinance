const express = require('express');
const router = express.Router();
const { getDashboardSummary } = require('../controllers/dashboardController');
const authenticateToken = require('../middlewares/authMiddleware');

// Dashboard hanya bisa diakses oleh user yang sudah login (ber-token)
router.get('/summary', authenticateToken, getDashboardSummary);

module.exports = router;