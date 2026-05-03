// Ini untuk mengatur URL endpoint API
const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/authController');

// Rute register dan login
router.post('/register', register);
router.post('/login', login);

module.exports = router;