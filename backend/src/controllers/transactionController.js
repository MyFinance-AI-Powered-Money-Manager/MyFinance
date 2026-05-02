const db = require('../config/db');


const createTransaction = async (req, res) => {
    // Backend (Node.js) - Ambil User ID dari JWT
    const userId = req.user.id;
    
    // 1. TAMBAHAN BARU: Tangkap image_url dan raw_ai_output
    const { 
        wallet_id, type, total_amount, category, subcategory, 
        description, transaction_date, items,
        image_url, raw_ai_output 
    } = req.body;

    const client = await db.connect();

    try {
        await client.query('BEGIN'); 

        // 2. Cek Saldo Dompet
        const walletResult = await client.query('SELECT balance FROM wallets WHERE id = $1 FOR UPDATE', [wallet_id]);
        if (walletResult.rows.length === 0) throw new Error('Dompet tidak ditemukan.');
        
        let currentBalance = parseFloat(walletResult.rows[0].balance);

        if (type === 'expense' && currentBalance < total_amount) {
            throw new Error('Saldo dompet tidak mencukupi.');
        }

        // 3. Simpan Transaksi Utama
        const newTransaction = await client.query(
            `INSERT INTO transactions (user_id, wallet_id, type, total_amount, category, subcategory, description, transaction_date) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
            [userId, wallet_id, type, total_amount, category, subcategory, description, transaction_date]
        );
        
        const transactionId = newTransaction.rows[0].id;

        // 4. Simpan Detail Item OCR
        if (items && Array.isArray(items) && items.length > 0) {
            const itemQueries = items.map(item => {
                return client.query(
                    `INSERT INTO transaction_items (transaction_id, item_name, price, category, subcategory) 
                     VALUES ($1, $2, $3, $4, $5)`,
                    [transactionId, item.name, item.price, item.category, item.subcategory]
                );
            });
            await Promise.all(itemQueries); 
        }

        // 5. TAMBAHAN BARU: Simpan Bukti Scan ke receipt_scans (Hanya jika image_url dikirim)
        if (image_url) {
            await client.query(
                `INSERT INTO receipt_scans (user_id, transaction_id, image_url, raw_ai_output) 
                 VALUES ($1, $2, $3, $4)`,
                [userId, transactionId, image_url, raw_ai_output || null]
            );
        }

        // 6. Update Saldo Dompet
        const newBalance = type === 'income' ? currentBalance + total_amount : currentBalance - total_amount;
        await client.query('UPDATE wallets SET balance = $1 WHERE id = $2', [newBalance, wallet_id]);

        await client.query('COMMIT'); 

        res.status(201).json({ 
            status: 'success', 
            message: 'Transaksi, item, dan bukti scan AI berhasil dicatat.',
            data: { transaction_id: transactionId }
        });

    } catch (error) {
        await client.query('ROLLBACK'); 
        console.error('Error transaction:', error);
        res.status(400).json({ status: 'error', message: error.message });
    } finally {
        client.release(); 
    }
};

const getTransactions = async (req, res) => {
    try {
        // Mengambil riwayat transaksi sekaligus melakukan JOIN untuk mendapatkan nama dompet
        const tx = await db.query(
            `SELECT t.*, w.name as wallet_name 
             FROM transactions t 
             JOIN wallets w ON t.wallet_id = w.id 
             WHERE t.user_id = $1 
             ORDER BY t.transaction_date DESC, t.created_at DESC`,
            [req.user.id]
        );
        res.status(200).json({ status: 'success', data: tx.rows });
    } catch (error) {
        console.error('Error getTransactions:', error);
        res.status(500).json({ status: 'error', message: 'Terjadi kesalahan server saat mengambil data transaksi.' });
    }
};

const deleteTransaction = async (req, res) => {
    const userId = req.user.id;
    const txId = req.params.id;

    try {
        await db.query('BEGIN');

        // 1. Cek validitas transaksi
        const txCheck = await db.query('SELECT * FROM transactions WHERE id = $1 AND user_id = $2', [txId, userId]);
        if (txCheck.rows.length === 0) {
            await db.query('ROLLBACK');
            return res.status(404).json({ status: 'error', message: 'Transaksi tidak ditemukan.' });
        }

        const tx = txCheck.rows[0];

        // 2. Hapus baris transaksi dari buku besar
        await db.query('DELETE FROM transactions WHERE id = $1', [txId]);

        // 3. Kembalikan saldo dompet (Reverse Logic)
        if (tx.type === 'expense') {
            await db.query('UPDATE wallets SET balance = balance + $1 WHERE id = $2', [tx.total_amount, tx.wallet_id]);
        } else if (tx.type === 'income') {
            await db.query('UPDATE wallets SET balance = balance - $1 WHERE id = $2', [tx.total_amount, tx.wallet_id]);
        }

        await db.query('COMMIT');

        res.status(200).json({ status: 'success', message: 'Transaksi berhasil dihapus dan saldo telah dikembalikan.' });
    } catch (error) {
        await db.query('ROLLBACK');
        console.error('Error deleteTransaction:', error);
        res.status(500).json({ status: 'error', message: 'Terjadi kesalahan server saat menghapus transaksi.' });
    }
};




module.exports = { createTransaction, getTransactions, deleteTransaction };