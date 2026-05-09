import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowDown, ArrowRight, ArrowUp, Banknote, Car, CreditCard, Landmark, Minus, Plus, Scan, Sparkles, Utensils, Wallet } from 'lucide-react';
import { motion } from 'motion/react';
import { Layout } from '../components/layout/Layout';
import { DashboardHeader } from '../components/dashboard/DashboardHeader';
import { LoadingScreen } from '../components/LoadingScreen';
import { TransactionFormModal } from '../components/TransactionFormModal';
import { WalletFormModal } from '../components/WalletFormModal';
import { useLanguage } from '../context/LanguageContext';
import { useBudgets, useCreateTransaction, useTransactions, useWallets } from '../hooks/useFinance';
import { cn, formatCurrency } from '../lib/utils';

const Dashboard = () => {
    const { t } = useLanguage();
    const navigate = useNavigate();
    const location = useLocation();
    const [formType, setFormType] = React.useState('income');
    const [openTransactionModal, setOpenTransactionModal] = React.useState(false);
    const [openWalletModal, setOpenWalletModal] = React.useState(false);
    const { data: walletsData, isLoading: walletsLoading, error: walletsError } = useWallets();
    const { data: budgetsData, isLoading: budgetsLoading, error: budgetsError } = useBudgets();
    const { data: transactionsData, isLoading: transactionsLoading, error: transactionsError } = useTransactions();
    const createTransaction = useCreateTransaction();

    const wallets = Array.isArray(walletsData) ? walletsData : walletsData?.data ?? [];
    const budgets = Array.isArray(budgetsData) ? budgetsData : budgetsData?.data ?? [];
    const transactions = Array.isArray(transactionsData) ? transactionsData : transactionsData?.data ?? [];

    const isLoading = walletsLoading || budgetsLoading || transactionsLoading;
    const error = walletsError || budgetsError || transactionsError;

    React.useEffect(() => {
        if (location.state?.openWalletModal) {
            setOpenWalletModal(true);
        }
    }, [location.state]);

    React.useEffect(() => {
        if (!isLoading && wallets.length === 0) {
            setOpenWalletModal(true);
        }
    }, [isLoading, wallets.length]);

    if (isLoading) {
        return <LoadingScreen />;
    }

    if (error) {
        return (
            <Layout>
                <div className="finance-card p-8 text-center md:p-10">
                    <h2 className="text-2xl font-extrabold text-red-600">{t('dashboard_load_failed')}</h2>
                    <p className="mt-2 text-sm text-zinc-500 dark:text-[#B0B8CC]">{t('dashboard_load_hint')}</p>
                </div>
            </Layout>
        );
    }

    const walletFallbacks = [
        { name: t('bank'), balance: 0, icon: Landmark },
        { name: t('emergency_fund'), balance: 0, icon: Banknote },
        { name: t('e_wallet'), balance: 0, icon: CreditCard },
        { name: t('cash'), balance: 0, icon: Wallet },
        { name: t('savings'), balance: 0, icon: Wallet },
    ];

    const accountCards = (wallets.length ? wallets : walletFallbacks)
        .slice(0, 5)
        .map((wallet, index) => ({
            icon: wallet.icon || [Landmark, Banknote, CreditCard, Wallet, Wallet][index] || Wallet,
            name: wallet.name || wallet.label || wallet.type || walletFallbacks[index]?.name || 'Wallet',
            amount: Number(wallet.balance ?? wallet.amount ?? walletFallbacks[index]?.balance ?? 0),
        }));

    const totalBalance = accountCards.reduce((sum, item) => sum + item.amount, 0);
    const totalIncome = transactions.reduce((sum, tx) => sum + (tx.type === 'income' || Number(tx.amount) > 0 ? Number(tx.amount) : 0), 0);
    const totalExpense = transactions.reduce((sum, tx) => sum + (tx.type === 'expense' || Number(tx.amount) < 0 ? Math.abs(Number(tx.amount)) : 0), 0);
    const activeBudget = budgets[0];

    const recentTransactions = [...transactions]
        .slice(0, 3)
        .map((tx, index) => ({
            id: tx.id ?? index,
            icon: tx.category?.toLowerCase().includes('makan') ? Utensils : tx.category?.toLowerCase().includes('transport') ? Car : Wallet,
            label: tx.label || tx.description || 'Transaksi',
            category: tx.category || tx.type || 'Kategori',
            date: tx.date || tx.createdAt || 'Hari ini',
            amount: Number(tx.amount ?? 0),
        }));

    const handleCreateTransaction = async (payload) => {
        await createTransaction.mutateAsync(payload);
        setOpenTransactionModal(false);
    };

    const handleOpenWalletModal = () => {
        setOpenWalletModal(true);
    };

    const handleCloseWalletModal = () => {
        if (wallets.length === 0) {
            return;
        }

        setOpenWalletModal(false);
    };

    const handleWalletCreated = () => {
        setOpenWalletModal(false);
    };

    return (
        <Layout>
            <DashboardHeader />

            <div className="grid gap-4 lg:grid-cols-[1.7fr_0.95fr]">
                <section className="finance-card overflow-hidden bg-gradient-to-br from-finance-700 via-finance-600 to-finance-500 p-6 text-white shadow-soft md:p-8 lg:p-10">
                    <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-white/70">{t('total_balance')}</p>
                            <h2 className="mt-3 text-4xl font-extrabold leading-none md:text-5xl">{formatCurrency(totalBalance)}</h2>
                            <div className="mt-8 grid gap-3 sm:grid-cols-2">
                                <div className="rounded-[20px] bg-white/10 p-4 backdrop-blur-sm">
                                    <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/75">
                                        <ArrowDown className="h-3.5 w-3.5" /> {t('income')}
                                    </div>
                                    <p className="mt-2 text-lg font-bold md:text-xl">{formatCurrency(totalIncome)}</p>
                                </div>
                                <div className="rounded-[20px] bg-white/10 p-4 backdrop-blur-sm">
                                    <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/75">
                                        <ArrowUp className="h-3.5 w-3.5" /> {t('expense')}
                                    </div>
                                    <p className="mt-2 text-lg font-bold md:text-xl">{formatCurrency(totalExpense)}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="hidden gap-4 lg:grid">
                    <button
                        onClick={() => {
                            if (wallets.length === 0) {
                                setOpenWalletModal(true);
                                return;
                            }

                            setFormType('income');
                            setOpenTransactionModal(true);
                        }}
                        className="flex items-center justify-center gap-3 rounded-[24px] bg-white px-5 py-5 text-finance-700 shadow-sm transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
                        disabled={wallets.length === 0}
                    >
                        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#DDF4E2]">
                            <Plus className="h-5 w-5" />
                        </div>
                        <span className="text-sm font-semibold">{t('catat_pemasukan')}</span>
                    </button>
                    <button
                        onClick={() => {
                            if (wallets.length === 0) {
                                setOpenWalletModal(true);
                                return;
                            }

                            setFormType('expense');
                            setOpenTransactionModal(true);
                        }}
                        className="flex items-center justify-center gap-3 rounded-[24px] bg-white px-5 py-5 text-red-500 shadow-sm transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
                        disabled={wallets.length === 0}
                    >
                        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#FBE5EA]">
                            <Minus className="h-5 w-5" />
                        </div>
                        <span className="text-sm font-semibold">{t('catat_pengeluaran')}</span>
                    </button>
                </section>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-6">
                {accountCards.map((account, index) => (
                    <motion.div
                        key={`${account.name}-${index}`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.03 * index }}
                        className="finance-card flex flex-col items-center justify-center px-4 py-6 text-center"
                    >
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-finance-700 text-white shadow-sm">
                            <account.icon className="h-5 w-5" />
                        </div>
                        <h4 className="mt-4 text-sm font-bold text-zinc-900 dark:text-[#F0F1F3]">{account.name}</h4>
                        <p className="mt-1 text-sm font-semibold text-finance-700">
                            {formatCurrency(account.amount).replace('Rp', '').trim()}
                        </p>
                    </motion.div>
                ))}
                <button
                    onClick={handleOpenWalletModal}
                    className="finance-card flex flex-col items-center justify-center px-4 py-6 text-center text-zinc-500 transition hover:-translate-y-0.5 hover:text-finance-700 dark:text-[#8B92A9] dark:hover:text-[#7CF38E]"
                >
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#E6EEDA] text-finance-700 shadow-sm">
                        <Plus className="h-5 w-5" />
                    </div>
                    <span className="mt-4 text-sm font-bold">{t('add')}</span>
                </button>
            </div>

            <div className="mt-4 grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
                <section className="relative overflow-hidden rounded-[30px] border border-finance-200 bg-white p-6 shadow-card md:p-8 lg:col-start-1 lg:row-start-1">
                    <div className="flex items-start gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#DDF4E2] text-finance-700">
                            <Sparkles className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-lg font-extrabold text-zinc-900 dark:text-[#F0F1F3]">{t('smart_insight')}</h3>
                            <p className="mt-3 max-w-xl text-sm leading-7 text-zinc-500 dark:text-[#B0B8CC]">
                                {activeBudget
                                    ? `Pengeluaran kamu minggu ini 15% lebih rendah dari rata-rata bulanan. Pertahankan tren ini untuk mencapai target tabungan akhir tahun!`
                                    : t('insight_text')}
                            </p>
                        </div>
                        <div className="hidden rounded-full bg-[#EDF6E7] p-3 text-finance-500 md:block">
                            <Sparkles className="h-6 w-6" />
                        </div>
                    </div>
                </section>

                <section className="finance-card p-6 md:p-8 hidden lg:block lg:col-start-2 lg:row-start-1">
                    <div className="mb-6 flex items-center justify-between">
                        <h3 className="text-lg font-extrabold text-zinc-900 dark:text-[#F0F1F3]">{t('transaction_history')}</h3>
                        <button onClick={() => navigate('/transactions')} className="text-sm font-bold text-finance-700">
                            {t('see_all')}
                        </button>
                    </div>
                    <div className="space-y-5">
                        {recentTransactions.length > 0 ? recentTransactions.map((tx) => (
                            <div key={tx.id} className="flex items-center justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#7CF38E] text-zinc-900 dark:text-zinc-900">
                                        <tx.icon className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-zinc-900 dark:text-[#F0F1F3]">{tx.label}</h4>
                                        <p className="text-[11px] text-zinc-500 dark:text-[#8B92A9]">{tx.category} • {tx.date}</p>
                                    </div>
                                </div>
                                <p className={cn('text-sm font-bold md:text-base', tx.amount > 0 ? 'text-finance-700' : 'text-[#D1496F]')}>
                                    {tx.amount > 0 ? '+' : '-'} {formatCurrency(Math.abs(tx.amount))}
                                </p>
                            </div>
                        )) : (
                            <p className="text-sm text-zinc-500 dark:text-[#B0B8CC]">{t('recent_backend_empty')}</p>
                        )}
                    </div>
                </section>
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-2 lg:hidden">
                <button
                    onClick={() => {
                        setFormType('income');
                        setOpenTransactionModal(true);
                    }}
                    className="flex items-center justify-center gap-3 rounded-[24px] bg-white px-5 py-5 text-finance-700 shadow-card"
                >
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#DDF4E2]">
                        <Plus className="h-5 w-5" />
                    </div>
                    <span className="text-sm font-semibold">{t('catat_pemasukan')}</span>
                </button>
                <button
                    onClick={() => {
                        setFormType('expense');
                        setOpenTransactionModal(true);
                    }}
                    className="flex items-center justify-center gap-3 rounded-[24px] bg-white px-5 py-5 text-red-500 shadow-card"
                >
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#FBE5EA]">
                        <Minus className="h-5 w-5" />
                    </div>
                    <span className="text-sm font-semibold">{t('catat_pengeluaran')}</span>
                </button>
            </div>

            <div className="fixed bottom-24 right-6 z-50 md:hidden">
                <button
                    onClick={() => navigate('/scan')}
                    className="flex h-14 w-14 items-center justify-center rounded-full bg-[#7CF38E] text-finance-800 shadow-soft"
                >
                    <Scan className="h-6 w-6" />
                </button>
            </div>

            {/* Mobile-only transaction history moved to bottom */}
            <section className="finance-card p-6 md:p-8 mt-4 block lg:hidden">
                <div className="mb-6 flex items-center justify-between">
                    <h3 className="text-lg font-extrabold text-zinc-900 dark:text-[#F0F1F3]">{t('transaction_history')}</h3>
                    <button onClick={() => navigate('/transactions')} className="text-sm font-bold text-finance-700">
                        {t('see_all')}
                    </button>
                </div>
                <div className="space-y-5">
                    {recentTransactions.length > 0 ? recentTransactions.map((tx) => (
                        <div key={tx.id} className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#7CF38E] text-zinc-900 dark:text-zinc-900">
                                    <tx.icon className="h-5 w-5" />
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-zinc-900 dark:text-[#F0F1F3]">{tx.label}</h4>
                                    <p className="text-[11px] text-zinc-500 dark:text-[#8B92A9]">{tx.category} • {tx.date}</p>
                                </div>
                            </div>
                            <p className={cn('text-sm font-bold md:text-base', tx.amount > 0 ? 'text-finance-700' : 'text-[#D1496F]')}>
                                {tx.amount > 0 ? '+' : '-'} {formatCurrency(Math.abs(tx.amount))}
                            </p>
                        </div>
                    )) : (
                        <p className="text-sm text-zinc-500">{t('recent_backend_empty')}</p>
                    )}
                </div>
            </section>

            <TransactionFormModal
                open={openTransactionModal}
                type={formType}
                wallets={wallets}
                onClose={() => setOpenTransactionModal(false)}
                onSubmit={handleCreateTransaction}
                isSubmitting={createTransaction.isPending}
            />

            <WalletFormModal
                open={openWalletModal}
                required={wallets.length === 0}
                onClose={handleCloseWalletModal}
                onCreated={handleWalletCreated}
            />
        </Layout>
    );
};

export default Dashboard;
