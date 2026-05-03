// backend/src/routes/walletRoutes.js
const express = require('express');
const router = express.Router();
const { createWallet, getWallets, updateWallet, deleteWallet, transferWallet } = require('../controllers/walletController');
const authenticateToken = require('../middlewares/authMiddleware');


// Rute CRUD wallwt
router.post('/', authenticateToken, createWallet);
router.get('/', authenticateToken, getWallets);
router.put('/:id', authenticateToken, updateWallet);
router.delete('/:id', authenticateToken, deleteWallet);
router.post('/transfer', authenticateToken, transferWallet);

module.exports = router;