import React, { createContext, useContext, useEffect, useState } from 'react';

// Simple translation map
const translations = {
    id: {
        'welcome': 'Halo, Robby!',
        'sub_welcome': 'Mari pantau kesehatan finansialmu hari ini.',
        'total_balance': 'Total Saldo',
        'income': 'Pemasukan',
        'expense': 'Pengeluaran',
        'bank': 'Bank',
        'emergency_fund': 'Dana Darurat',
        'e_wallet': 'E-Wallet',
        'cash': 'Cash',
        'savings': 'Tabungan',
        'add': 'Tambah',
        'smart_insight': 'Insight Cerdas',
        'insight_text': 'Pengeluaran kamu minggu ini 15% lebih rendah dari rata-rata bulanan. Pertahankan tren ini untuk mencapai target tabungan akhir tahun!',
        'transaction_history': 'Riwayat Transaksi',
        'see_all': 'Lihat Semua',
        'home': 'Home',
        'scan': 'Scan Transactions',
        'all_transactions': 'All Transactions',
        'transactions': 'Transaksi',
        'reports': 'Reports',
        'catat_pemasukan': 'Catat Pemasukan',
        'catat_pengeluaran': 'Catat Pengeluaran',
        'login_welcome': 'Selamat Datang Kembali',
        'login_sub': 'Silahkan masuk ke akun Anda untuk melanjutkan perjalanan finansial Anda.',
        'register': 'Daftar Sekarang',
        'register_sub': 'Mulai mengatur keuangan anda lebih cerdas dan teratur.',
        'email': 'Email',
        'password': 'Password',
        'login': 'Masuk',
        'or_login_with': 'ATAU MASUK DENGAN',
        'google': 'Lanjutkan dengan Google',
        'no_account': 'Belum punya akun?',
        'register_now': 'Daftar sekarang',
        'footer_text': 'Sanctuary Terpandu untuk kekayaan Anda. Kami mendefinisikan ulang manajemen kekayaan melalui estetika editorial dan kecerdasan buatan.',
        'copyright': '© 2024 MyFinance. Perlindungan Terpandu untuk kekayaan Anda.',
        'welcome_back': 'Selamat datang kembali',
        'financial_sanctuary': 'Sanctuary Finansial',
        'dark_mode': 'Mode Gelap',
        'light_mode': 'Mode Terang',
        'translate_to_english': 'Terjemahkan ke English',
        'translate_to_indonesia': 'Terjemahkan ke Indonesia',
        'service_status': 'Layanan Beroperasi Normal',
        'dashboard_load_failed': 'Gagal memuat dashboard',
        'dashboard_load_hint': 'Silakan cek koneksi backend atau coba muat ulang halaman.',
        'recent_backend_empty': 'Belum ada transaksi dari backend.',
        'report_load_failed': 'Gagal memuat laporan',
        'report_load_hint': 'Pastikan endpoint /transactions, /wallets, dan /budgets tersedia.',
        'financial_reports': 'Laporan Keuangan',
        'financial_overview': 'Tinjauan komprehensif aktivitas finansial Anda.',
        'backend_live': 'Backend Live',
        'export': 'Export',
        'total_transactions': 'Total Transaksi',
        'avg_expense': 'Rata-rata Pengeluaran',
        'expense_tracked_backend': 'Pengeluaran terpantau dari backend',
        'savings_rate': 'Tingkat Tabungan',
        'total_balance_label': 'Total saldo',
        'income_vs_expense': 'Pemasukan vs Pengeluaran',
        'backend_transactions_data': 'Data dari transaksi backend',
        'category_summary': 'Ringkasan Kategori',
        'accumulated_backend_transactions': 'Akumulasi dari transaksi backend',
        'transactions_data_unavailable': 'Data transaksi belum tersedia.',
        'budget_overview': 'Budget Overview',
        'budget_progress_from_endpoint': 'Progress dari data endpoint /budgets',
        'spent_target': 'Spent / Target',
        'transactions_load_failed': 'Gagal memuat transaksi',
        'transactions_load_hint': 'Pastikan backend aktif dan endpoint /transactions tersedia.',
        'manage_cashflow': 'Kelola dan pantau arus kas Anda.',
        'search_transactions_placeholder': 'Cari transaksi, kategori, atau jumlah...',
        'filter_all': 'Semua',
        'filter_income': 'Pemasukan',
        'filter_expense': 'Pengeluaran',
        'no_date': 'Tanpa Tanggal',
        'no_transactions_match_filter': 'Tidak ada transaksi yang cocok dengan filter saat ini.',
        'transaction': 'Transaksi',
        'category': 'Kategori',
        'see_all_upper': 'Lihat Semua'
    },
    en: {
        'welcome': 'Hello, Robby!',
        'sub_welcome': "Let's monitor your financial health today.",
        'total_balance': 'Total Balance',
        'income': 'Income',
        'expense': 'Expense',
        'bank': 'Bank',
        'emergency_fund': 'Emergency Fund',
        'e_wallet': 'E-Wallet',
        'cash': 'Cash',
        'savings': 'Savings',
        'add': 'Add',
        'smart_insight': 'Smart Insight',
        'insight_text': "Your spending this week is 15% lower than the monthly average. Keep it up to reach your year-end savings goal!",
        'transaction_history': 'Transaction History',
        'see_all': 'See All',
        'home': 'Home',
        'scan': 'Scan Transactions',
        'all_transactions': 'All Transactions',
        'transactions': 'Transactions',
        'reports': 'Reports',
        'catat_pemasukan': 'Record Income',
        'catat_pengeluaran': 'Record Expense',
        'login_welcome': 'Welcome Back',
        'login_sub': 'Please log in to your account to continue your financial journey.',
        'register': 'Register Now',
        'register_sub': 'Start managing your finances smarter and more organized.',
        'email': 'Email',
        'password': 'Password',
        'login': 'Login',
        'or_login_with': 'OR LOGIN WITH',
        'google': 'Continue with Google',
        'no_account': "Don't have an account?",
        'register_now': 'Register now',
        'footer_text': 'A Guided Sanctuary for your wealth. We redefine wealth management through editorial aesthetics and artificial intelligence.',
        'copyright': '© 2024 MyFinance. Guided Protection for your wealth.',
        'welcome_back': 'Welcome back',
        'financial_sanctuary': 'Financial Sanctuary',
        'dark_mode': 'Dark Mode',
        'light_mode': 'Light Mode',
        'translate_to_english': 'Translate to English',
        'translate_to_indonesia': 'Translate to Indonesian',
        'service_status': 'Service Operating Normally',
        'dashboard_load_failed': 'Failed to load dashboard',
        'dashboard_load_hint': 'Please check backend connectivity or reload the page.',
        'recent_backend_empty': 'No transactions available from backend yet.',
        'report_load_failed': 'Failed to load reports',
        'report_load_hint': 'Ensure /transactions, /wallets, and /budgets endpoints are available.',
        'financial_reports': 'Financial Reports',
        'financial_overview': 'Comprehensive overview of your financial activity.',
        'backend_live': 'Backend Live',
        'export': 'Export',
        'total_transactions': 'Total Transactions',
        'avg_expense': 'Average Expense',
        'expense_tracked_backend': 'Expense tracked from backend',
        'savings_rate': 'Savings Rate',
        'total_balance_label': 'Total balance',
        'income_vs_expense': 'Income vs Expense',
        'backend_transactions_data': 'Data from backend transactions',
        'category_summary': 'Category Summary',
        'accumulated_backend_transactions': 'Accumulated from backend transactions',
        'transactions_data_unavailable': 'Transaction data is not available yet.',
        'budget_overview': 'Budget Overview',
        'budget_progress_from_endpoint': 'Progress from /budgets endpoint data',
        'spent_target': 'Spent / Target',
        'transactions_load_failed': 'Failed to load transactions',
        'transactions_load_hint': 'Ensure backend is running and /transactions endpoint is available.',
        'manage_cashflow': 'Manage and monitor your cash flow.',
        'search_transactions_placeholder': 'Search transactions, category, or amount...',
        'filter_all': 'All',
        'filter_income': 'Income',
        'filter_expense': 'Expense',
        'no_date': 'No Date',
        'no_transactions_match_filter': 'No transactions match the current filter.',
        'transaction': 'Transaction',
        'category': 'Category',
        'see_all_upper': 'See All'
    },
};

const LanguageContext = createContext(undefined);

export const LanguageProvider = ({ children }) => {
    const [language, setLanguage] = useState(() => {
        const savedLanguage = localStorage.getItem('language');
        return savedLanguage || 'id';
    });

    useEffect(() => {
        localStorage.setItem('language', language);
        document.documentElement.lang = language;
    }, [language]);

    const t = (key) => {
        return translations[language][key] || key;
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (!context) throw new Error('useLanguage must be used within LanguageProvider');
    return context;
};
