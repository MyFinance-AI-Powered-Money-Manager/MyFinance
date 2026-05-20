const express = require('express');
const router = express.Router();
const { exportDataForDS } = require('../controllers/exportController');

// Rute untuk memberikan data ke Streamlit / Tim DS
// Diperbolehkan tanpa auth token agar Streamlit bisa langsung akses via GET param
router.get('/streamlit', exportDataForDS);

module.exports = router;
