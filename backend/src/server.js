// backend/src/server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');


// Inisialisasi koneksi Database
require('./config/db');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Health Check Server Express Endpoint
app.get('/api/v1/health', (req, res) => {
    res.status(200).json({
        status: 'success',
        message: 'MyFinance Express Server is running optimally.',
        timestamp: new Date().toISOString()
    });
});

// Import & Mount Routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const walletRoutes = require('./routes/walletRoutes');
const budgetRoutes = require('./routes/budgetRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const insightRoutes = require('./routes/insightRoutes');

// cron job
require('./cronJob/insightWorker');

// routing endpoint sesuai swagger 
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/wallets', walletRoutes);
app.use('/api/v1/budgets', budgetRoutes);
app.use('/api/v1/transactions', transactionRoutes);
app.use('/api/v1/insights', insightRoutes);


// Server Listener
app.listen(PORT, () => {
    console.log(`Server backend berjalan di port ${PORT}`);
});