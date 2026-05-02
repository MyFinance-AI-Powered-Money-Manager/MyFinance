// backend/src/routes/transactionRoutes.js
const express = require('express');
const router = express.Router();
const { createTransaction, getTransactions, deleteTransaction } = require('../controllers/transactionController');
const authenticateToken = require('../middlewares/authMiddleware');

router.use(authenticateToken); // Proteksi rute

// Rute CRUD Transactions
router.post('/', authenticateToken, createTransaction);
router.get('/', authenticateToken, getTransactions);
router.delete('/:id', authenticateToken, deleteTransaction);


module.exports = router;