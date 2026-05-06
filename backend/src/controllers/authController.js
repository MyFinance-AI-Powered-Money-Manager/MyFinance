// Ini untuk logika daftar & login nanti
const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const register = async (req, res) => {
    // 1. Tangkap parameter dari body request
    const { full_name, email, password, confirm_password } = req.body;

    try {
        // 2. Validasi Input Kelengkapan Data
        if (!full_name || !email || !password || !confirm_password) {
            return res.status(400).json({ 
                status: 'error', 
                message: 'Semua kolom (Nama Lengkap, Email, Password, Konfirmasi Password) wajib diisi.' 
            });
        }

        // 3. Validasi Kesesuaian Password 
        if (password !== confirm_password) {
            return res.status(400).json({ 
                status: 'error', 
                message: 'Password dan Konfirmasi Password tidak cocok.' 
            });
        }

        // 4. Cek apakah email sudah digunakan
        const userCheck = await db.query('SELECT id FROM users WHERE email = $1', [email]);
        if (userCheck.rows.length > 0) {
            return res.status(400).json({ 
                status: 'error', 
                message: 'Email sudah terdaftar di dalam sistem.' 
            });
        }

        // 5. Enkripsi (Hashing) Password
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        // 6. Simpan ke database beserta full_name
        const newUser = await db.query(
            'INSERT INTO users (full_name, email, password) VALUES ($1, $2, $3) RETURNING id, full_name, email, created_at',
            [full_name, email, passwordHash]
        );

        res.status(201).json({ 
            status: 'success', 
            message: 'Registrasi berhasil.',
            data: newUser.rows[0] 
        });
    } catch (error) {
        console.error('Error register:', error);
        res.status(500).json({ 
            status: 'error', 
            message: 'Terjadi kesalahan sistem saat memproses registrasi.' 
        });
    }
};

const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        // 1. Validasi Input
        if (!email || !password) {
            return res.status(400).json({ status: 'error', message: 'Email dan password wajib diisi.' });
        }

        // 2. Cari pengguna berdasarkan email
        const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
        if (result.rows.length === 0) {
            return res.status(401).json({ status: 'error', message: 'Email atau password salah.' });
        }

        const user = result.rows[0];

        // 3. Verifikasi Password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ status: 'error', message: 'Email atau password salah.' });
        }

        // 4. Buat Token JWT (Masa aktif 1 Hari)
        const token = jwt.sign(
            { id: user.id, email: user.email }, 
            process.env.JWT_SECRET || 'rahasia_sistem_keuangan', 
            { expiresIn: '1d' }
        );

        res.status(200).json({ 
            status: 'success', 
            data: { 
                user: { id: user.id, email: user.email },
                token 
            } 
        });
    } catch (error) {
        console.error('Error login:', error);
        res.status(500).json({ status: 'error', message: 'Terjadi kesalahan sistem saat login.' });
    }
};

module.exports = { register, login };