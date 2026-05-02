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
            'UPDATE wallets SET name = COALESCE($1, name), type = COALESCE($2, type), balance = COALESCE($3, balance) WHERE id = $4 AND user_id = $5 RETURNING *',
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

    try {
        if (!source_wallet_id || !destination_wallet_id || !amount || amount <= 0) {
            return res.status(400).json({ status: 'error', message: 'Data transfer tidak valid.' });
        }

        await db.query('BEGIN');

        // 1. Validasi saldo dompet sumber
        const sourceWallet = await db.query('SELECT balance FROM wallets WHERE id = $1 AND user_id = $2', [source_wallet_id, userId]);
        if (sourceWallet.rows.length === 0 || parseFloat(sourceWallet.rows[0].balance) < amount) {
            await db.query('ROLLBACK');
            return res.status(400).json({ status: 'error', message: 'Saldo tidak mencukupi.' });
        }

        // 2. Validasi eksistensi dompet tujuan
        const destWallet = await db.query('SELECT id FROM wallets WHERE id = $1 AND user_id = $2', [destination_wallet_id, userId]);
        if (destWallet.rows.length === 0) {
            await db.query('ROLLBACK');
            return res.status(400).json({ status: 'error', message: 'Dompet tujuan tidak ditemukan.' });
        }

        // 3. Pindahkan saldo antar Dompet
        await db.query('UPDATE wallets SET balance = balance - $1 WHERE id = $2', [amount, source_wallet_id]);
        await db.query('UPDATE wallets SET balance = balance + $1 WHERE id = $2', [amount, destination_wallet_id]);

        // 4. Catat riwayat di tabel Transaksi dengan transfer_id yang mengikat keduanya
        const transferId = uuidv4();
        
        await db.query(
            `INSERT INTO transactions (user_id, wallet_id, type, total_amount, category, description, transfer_id) 
             VALUES ($1, $2, 'expense', $3, 'TRANSFER', 'Transfer Keluar', $4)`,
            [userId, source_wallet_id, amount, transferId]
        );

        await db.query(
            `INSERT INTO transactions (user_id, wallet_id, type, total_amount, category, description, transfer_id) 
             VALUES ($1, $2, 'income', $3, 'TRANSFER', 'Transfer Masuk', $4)`,
            [userId, destination_wallet_id, amount, transferId]
        );

        await db.query('COMMIT');
        res.status(200).json({ status: 'success', message: 'Transfer berhasil dicatat.' });
    } catch (error) {
        await db.query('ROLLBACK');
        console.error(error);
        res.status(500).json({ status: 'error', message: 'Terjadi kesalahan sistem.' });
    }
};

module.exports = { createWallet, getWallets, updateWallet, deleteWallet, transferWallet };