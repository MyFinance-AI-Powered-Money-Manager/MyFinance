const express = require('express');
const router = express.Router();
const { getProfile, updateProfile, updatePassword } = require('../controllers/userController');
const authenticateToken = require('../middlewares/authMiddleware');

// Rute ini wajib pakai token (authMiddleware)
router.get('/profile', authenticateToken, getProfile);
router.put('/profile', authenticateToken, updateProfile);
router.put('/password', authenticateToken, updatePassword);

module.exports = router;