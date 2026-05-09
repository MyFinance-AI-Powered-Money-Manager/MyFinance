const db = require('../config/db');
const bcrypt = require('bcryptjs');

// 1. Ambil Data Profil
const getProfile = async (req, res) => {
    try {
        // Asumsi: Middleware JWT menyimpan ID user di req.user.id
        const userId = req.user.id;

        const result = await db.query(
            'SELECT id, full_name, email, profile_picture, created_at FROM users WHERE id = $1',
            [userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ status: 'error', message: 'User tidak ditemukan.' });
        }

        res.status(200).json({ status: 'success', data: result.rows[0] });
    } catch (error) {
        console.error('Error get profile:', error);
        res.status(500).json({ status: 'error', message: 'Terjadi kesalahan sistem.' });
    }
};

// 2. Update Nama Lengkap dan Foto Profile
const updateProfile = async (req, res) => {
    const userId = req.user.id;
    const { full_name, profile_picture } = req.body;

    try {
        if (!full_name) {
            return res.status(400).json({ status: 'error', message: 'Nama lengkap tidak boleh kosong.' });
        }

        const result = await db.query(
            `UPDATE users 
             SET full_name = COALESCE($1, full_name), 
                 profile_picture = COALESCE($2, profile_picture) 
             WHERE id = $3 
             RETURNING id, full_name, email, profile_picture`,
            [full_name, profile_picture, userId]
        );

        res.status(200).json({
            status: 'success',
            message: 'Profil berhasil diperbarui.',
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Error update profile:', error);
        res.status(500).json({ status: 'error', message: 'Terjadi kesalahan sistem.' });
    }
};

// 3. Ganti Password
const updatePassword = async (req, res) => {
    const userId = req.user.id;
    const { old_password, new_password, confirm_new_password } = req.body;

    try {
        if (!old_password || !new_password || !confirm_new_password) {
            return res.status(400).json({ status: 'error', message: 'Semua kolom password wajib diisi.' });
        }

        if (new_password !== confirm_new_password) {
            return res.status(400).json({ status: 'error', message: 'Password baru dan konfirmasi tidak cocok.' });
        }

        // Ambil password lama dari database
        const userResult = await db.query('SELECT password FROM users WHERE id = $1', [userId]);
        const user = userResult.rows[0];

        // Verifikasi password lama
        const validPassword = await bcrypt.compare(old_password, user.password);
        if (!validPassword) {
            return res.status(401).json({ status: 'error', message: 'Password lama salah.' });
        }

        // Hash password baru & simpan
        const salt = await bcrypt.genSalt(10);
        const newPasswordHash = await bcrypt.hash(new_password, salt);

        await db.query('UPDATE users SET password = $1 WHERE id = $2', [newPasswordHash, userId]);

        res.status(200).json({ status: 'success', message: 'Password berhasil diubah.' });
    } catch (error) {
        console.error('Error update password:', error);
        res.status(500).json({ status: 'error', message: 'Terjadi kesalahan sistem.' });
    }
};

module.exports = { getProfile, updateProfile, updatePassword };