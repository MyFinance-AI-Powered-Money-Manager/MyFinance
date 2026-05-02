// backend/src/routes/budgetRoutes.js
const express = require('express');
const router = express.Router();
const { createBudget, getBudgets, updateBudget, deleteBudget } = require('../controllers/budgetController');
const authenticateToken = require('../middlewares/authMiddleware');


// Rute CRUD Budgets
router.post('/', authenticateToken, createBudget);
router.get('/', authenticateToken, getBudgets);
router.put('/:id', authenticateToken, updateBudget);
router.delete('/:id', authenticateToken, deleteBudget);


module.exports = router;