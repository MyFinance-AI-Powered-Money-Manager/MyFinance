const db = require('../config/db');
const { v4: uuidv4 } = require('uuid'); // Wajib untuk generate transfer_id

const createWallet = async (req, res) => {
    const { name, type, balance } = req.body;
    try {
        const newWallet = await db.query(
            'INSERT INTO wallets (user_id, name, type, balance) VALUES ($1, $2, $3, $4) RETURNING *',
            [req.user.id, name, type, balance || 0]
        );
        res.status(201).json({ status: 'success', data: newWallet.rows[0] });
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Terjadi kesalahan server.' });
    }
};

const getWallets = async (req, res) => {
    try {
        const wallets = await db.query('SELECT * FROM wallets WHERE user_id = $1 ORDER BY created_at ASC', [req.user.id]);
        res.status(200).json({ status: 'success', data: wallets.rows });
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Terjadi kesalahan server.' });
    }
};

const updateWallet = async (req, res) => {
    const { name, type, balance } = req.body;
    try {
        const updated = await db.query(
            'UPDATE wallets SET name = COALESCE($1, name), type = COALESCE($2, type), balance = COALESCE($3, balance),updated_at = CURRENT_TIMESTAMP WHERE id = $4 AND user_id = $5 RETURNING *',
            [name, type, balance, req.params.id, req.user.id]
        );
        if (updated.rows.length === 0) return res.status(404).json({ status: 'error', message: 'Dompet tidak ditemukan.' });
        res.status(200).json({ status: 'success', data: updated.rows[0] });
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Terjadi kesalahan server.' });
    }
};

const deleteWallet = async (req, res) => {
    try {
        const deleted = await db.query('DELETE FROM wallets WHERE id = $1 AND user_id = $2 RETURNING *', [req.params.id, req.user.id]);
        if (deleted.rows.length === 0) return res.status(404).json({ status: 'error', message: 'Dompet tidak ditemukan.' });
        res.status(200).json({ status: 'success', message: 'Dompet dihapus.' });
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Terjadi kesalahan server.' });
    }
};

// Logika Transfer Dana antar dompet
const transferWallet = async (req, res) => {
    const { source_wallet_id, destination_wallet_id, amount } = req.body;
    const userId = req.user.id;
    const client = await db.connect();

    try {
        if (!source_wallet_id || !destination_wallet_id || !amount || amount <= 0) {
            return res.status(400).json({ status: 'error', message: 'Data transfer tidak valid.' });
        }

        // --- MULAI TRANSAKSI (WAJIB) ---
        await client.query('BEGIN');

        // 1. Validasi saldo dompet sumber
        const sourceWallet = await client.query(
            'SELECT balance FROM wallets WHERE id = $1 AND user_id = $2 FOR UPDATE',
            [source_wallet_id, userId]
        );

        if (sourceWallet.rows.length === 0 || parseFloat(sourceWallet.rows[0].balance) < amount) {
            await client.query('ROLLBACK');
            return res.status(400).json({ status: 'error', message: 'Saldo tidak mencukupi atau dompet tidak ditemukan.' });
        }

        // 2. Validasi eksistensi dompet tujuan
        const destWallet = await client.query('SELECT id FROM wallets WHERE id = $1 AND user_id = $2', [destination_wallet_id, userId]);
        if (destWallet.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(400).json({ status: 'error', message: 'Dompet tujuan tidak ditemukan.' });
        }

        // 3. Pindahkan saldo antar Dompet
        await client.query('UPDATE wallets SET balance = balance - $1 WHERE id = $2', [amount, source_wallet_id]);
        await client.query('UPDATE wallets SET balance = balance + $1 WHERE id = $2', [amount, destination_wallet_id]);

        // 4. Catat riwayat (Tambahkan transaction_date agar tidak error NOT NULL)
        const transferId = uuidv4();
        const now = new Date();

        // Catat Sisi Pengeluaran
        await client.query(
            `INSERT INTO transactions (user_id, wallet_id, type, total_amount, category, description, transfer_id, transaction_date) 
             VALUES ($1, $2, 'TRANSFER', $3, 'OTHER', 'Transfer Keluar', $4, $5)`,
            [userId, source_wallet_id, amount, transferId, now]
        );

        // Catat Sisi Pemasukan
        await client.query(
            `INSERT INTO transactions (user_id, wallet_id, type, total_amount, category, description, transfer_id, transaction_date) 
             VALUES ($1, $2, 'TRANSFER', $3, 'OTHER', 'Transfer Masuk', $4, $5)`,
            [userId, destination_wallet_id, amount, transferId, now]
        );

        await client.query('COMMIT');
        res.status(200).json({ status: 'success', message: 'Transfer berhasil dicatat.' });

    } catch (error) {
        // Cek jika client masih aktif sebelum rollback
        if (client) await client.query('ROLLBACK');
        console.error("DETAIL ERROR TRANSFER:", error.message); // Biar kelihatan di terminal VS Code
        res.status(500).json({ status: 'error', message: 'Terjadi kesalahan sistem: ' + error.message });
    } finally {
        client.release(); // lepaskan koneksi kembali ke pool
    }
};

module.exports = { createWallet, getWallets, updateWallet, deleteWallet, transferWallet };