// Ini untuk satpam pemeriksa token JWT
const jwt = require('jsonwebtoken');
require('dotenv').config();

const authenticateToken = (req, res, next) => {
    // Mengambil token dari header Authorization: Bearer <token>
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    // Jika klien tidak mengirimkan token sama sekali
    if (!token) {
        return res.status(401).json({
            status: 'error',
            message: 'Akses ditolak. Token autentikasi tidak ditemukan.'
        });
    }

    try {
        // Memverifikasi validitas dan masa kedaluwarsa token
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

        // Menyuntikkan data payload (termasuk id user) ke dalam object request
        req.user = decoded;

        // Mengizinkan request berlanjut ke Controller tujuan
        next();
    } catch (error) {
        console.error('JWT Verification Error:', error.message);
        return res.status(403).json({
            status: 'error',
            message: 'Token tidak valid atau telah kedaluwarsa. Silakan login kembali.'
        });
    }
};

module.exports = authenticateToken;