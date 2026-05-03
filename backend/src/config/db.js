// backend/src/config/db.js
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
    ssl: {
        rejectUnauthorized: false // Wajib diaktifkan untuk koneksi Supabase
    }
});

// Memaksa inisialisasi koneksi dengan query waktu (ping)
pool.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.error('Gagal terhubung ke database Supabase:', err.stack);
    } else {
        console.log('Terhubung ke database PostgreSQL (Supabase).');
    }
});

module.exports = {
    query: (text, params) => pool.query(text, params),

    // TAMBAHKAN BARIS INI: Untuk meminjam koneksi khusus (digunakan oleh fitur Transaksi/BEGIN/COMMIT)
    connect: () => pool.connect(),
};