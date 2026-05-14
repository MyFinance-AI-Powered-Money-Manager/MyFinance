import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowDown, ArrowRight, ArrowUp, Banknote, Car, CreditCard, Edit3, Landmark, Minus, Plus, Repeat, Scan, Sparkles, Target, Trash2, Utensils, Wallet } from 'lucide-react';
import { motion } from 'motion/react';
import { Layout } from '../components/layout/Layout';
import { DashboardHeader } from '../components/dashboard/DashboardHeader';
import { LoadingScreen } from '../components/LoadingScreen';
import { TransactionFormModal } from '../components/TransactionFormModal';
import { WalletFormModal } from '../components/WalletFormModal';
import { TransferFormModal } from '../components/TransferFormModal';
import { BudgetFormModal } from '../components/BudgetFormModal';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useBudgets, useCreateBudget, useCreateTransaction, useDashboardSummary, useDeleteBudget, useTransactions, useUpdateBudget, useWallets } from '../hooks/useFinance';
import { cn, formatCurrency } from '../lib/utils';

const WALLET_ICON_MAP = {
    BANK: Landmark,
    'E-WALLET': CreditCard,
    CASH: Wallet,
};

const Dashboard = () => {
    const { t, language } = useLanguage();
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();
    const [formType, setFormType] = React.useState('INCOME');
    const [openTransactionModal, setOpenTransactionModal] = React.useState(false);
    const [openWalletModal, setOpenWalletModal] = React.useState(false);
    const [openTransferModal, setOpenTransferModal] = React.useState(false);
    const [openBudgetModal, setOpenBudgetModal] = React.useState(false);
    const [editingBudget, setEditingBudget] = React.useState(null);

    const { data: walletsData, isLoading: walletsLoading, error: walletsError } = useWallets();
    const { data: budgetsData, isLoading: budgetsLoading } = useBudgets();
    const { data: transactionsData, isLoading: transactionsLoading, error: transactionsError } = useTransactions();
    const { data: dashboardData, isLoading: dashboardLoading, error: dashboardError } = useDashboardSummary();
    const createTransaction = useCreateTransaction();
    const createBudget = useCreateBudget();
    const updateBudget = useUpdateBudget();
    const deleteBudget = useDeleteBudget();

    const wallets = Array.isArray(walletsData) ? walletsData : walletsData?.data ?? [];
    const budgets = Array.isArray(budgetsData) ? budgetsData : budgetsData?.data ?? [];
    const transactions = Array.isArray(transactionsData) ? transactionsData : transactionsData?.data ?? [];

    const isLoading = walletsLoading || transactionsLoading || dashboardLoading;
    const error = walletsError || transactionsError || dashboardError;

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

    // Use backend dashboard summary (accurate server-side calculation)
    const totalBalance = dashboardData?.current_balance ?? wallets.reduce((sum, w) => sum + Number(w.balance ?? 0), 0);
    const totalIncome = dashboardData?.total_income ?? 0;
    const totalExpense = dashboardData?.total_expense ?? 0;

    const accountCards = wallets
        .slice(0, 5)
        .map((wallet) => ({
            icon: WALLET_ICON_MAP[wallet.type] || Wallet,
            name: wallet.name || wallet.label || wallet.type || 'Wallet',
            amount: Number(wallet.balance ?? 0),
            type: wallet.type,
        }));

    const activeBudget = budgets[0];

    // Get current month budgets
    const currentMonth = new Date().toISOString().slice(0, 7);
    const currentBudgets = budgets.filter((b) => (b.month_period || b.monthPeriod) === currentMonth);

    const recentTransactions = [...transactions]
        .slice(0, 3)
        .map((tx, index) => {
            const txType = String(tx.type).toUpperCase();
            const isTransferOut = txType === 'TRANSFER' && tx.description === 'Transfer Keluar';
            const isTransferIn = txType === 'TRANSFER' && tx.description === 'Transfer Masuk';

            return {
                id: tx.id ?? index,
                icon: isTransferOut
                    ? ArrowUp
                    : isTransferIn
                        ? ArrowDown
                        : tx.category?.toLowerCase().includes('makan') || tx.subcategory?.toLowerCase().includes('makan')
                            ? Utensils
                            : tx.category?.toLowerCase().includes('transport') || tx.subcategory?.toLowerCase().includes('transport')
                                ? Car
                                : Wallet,
                label: tx.label || tx.description || 'Transaksi',
                category: tx.subcategory || tx.category || tx.type || 'Kategori',
                date: tx.date
                    ? new Date(tx.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })
                    : 'Hari ini',
                amount: Number(tx.amount ?? 0),
                type: txType,
                isTransferOut,
                isTransferIn,
            };
        });

    const getTransactionColor = (tx) => {
        if (tx.type === 'EXPENSE' || tx.isTransferOut) return 'text-[#D1496F] dark:text-[#F47A97]';
        return 'text-finance-700 dark:text-[#7CF38E]';
    };

    const getTransactionBg = (tx) => {
        if (tx.type === 'EXPENSE' || tx.isTransferOut) return 'bg-[#FBE5EA] text-[#D1496F] dark:bg-[#402233] dark:text-[#F47A97]';
        return 'bg-[#7CF38E] text-zinc-900 dark:bg-[#1F5B3A] dark:text-[#9AF2AF]';
    };

    const getTransactionPrefix = (tx) => {
        if (tx.type === 'EXPENSE' || tx.isTransferOut) return '-';
        return '+';
    };

    const handleCreateTransaction = async (payload) => {
        try {
            await createTransaction.mutateAsync(payload);
            setOpenTransactionModal(false);
        } catch {
            // Error already handled by the mutation callback.
        }
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

    const handleBudgetSubmit = async (payload) => {
        try {
            if (payload.id) {
                await updateBudget.mutateAsync({ id: payload.id, data: payload.data });
            } else {
                await createBudget.mutateAsync(payload);
            }
            setOpenBudgetModal(false);
            setEditingBudget(null);
        } catch {
            // Error already handled by the mutation callback.
        }
    };

    const handleDeleteBudget = async (budgetId) => {
        if (!window.confirm('Yakin ingin menghapus anggaran ini?')) return;
        try {
            await deleteBudget.mutateAsync(budgetId);
        } catch {
            // Error already handled by the mutation callback.
        }
    };

    return (
        <Layout>
            <DashboardHeader user={user} onProfileClick={() => navigate('/profile')} />

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

                <section className="hidden gap-3 lg:grid">
                    <button
                        onClick={() => {
                            if (wallets.length === 0) {
                                setOpenWalletModal(true);
                                return;
                            }

                            setFormType('INCOME');
                            setOpenTransactionModal(true);
                        }}
                        className="flex items-center justify-center gap-3 rounded-[24px] bg-white px-5 py-4 text-finance-700 shadow-sm transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
                        disabled={wallets.length === 0}
                    >
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#DDF4E2]">
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

                            setFormType('EXPENSE');
                            setOpenTransactionModal(true);
                        }}
                        className="flex items-center justify-center gap-3 rounded-[24px] bg-white px-5 py-4 text-red-500 shadow-sm transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
                        disabled={wallets.length === 0}
                    >
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FBE5EA]">
                            <Minus className="h-5 w-5" />
                        </div>
                        <span className="text-sm font-semibold">{t('catat_pengeluaran')}</span>
                    </button>
                    <button
                        onClick={() => {
                            if (wallets.length < 2) {
                                setOpenWalletModal(true);
                                return;
                            }
                            setOpenTransferModal(true);
                        }}
                        className="flex items-center justify-center gap-3 rounded-[24px] bg-white px-5 py-4 text-blue-600 shadow-sm transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
                        disabled={wallets.length < 2}
                    >
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50">
                            <Repeat className="h-5 w-5" />
                        </div>
                        <span className="text-sm font-semibold">Transfer Dana</span>
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
                        <p className="mt-1 text-xs text-zinc-500 dark:text-[#8B92A9]">{account.type}</p>
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

            {/* ── Budget Progress ── */}
            <section className="finance-card mt-4 p-6 md:p-8">
                <div className="mb-5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#DDF4E2] text-finance-700">
                            <Target className="h-5 w-5" />
                        </div>
                        <div>
                            <h3 className="text-lg font-extrabold text-zinc-900 dark:text-[#F0F1F3]">{t('this_month_budgets')}</h3>
                            <p className="text-xs text-zinc-500 dark:text-[#8B92A9]">{currentMonth}</p>
                        </div>
                    </div>
                    <button
                        onClick={() => { setEditingBudget(null); setOpenBudgetModal(true); }}
                        className="flex items-center gap-1.5 rounded-full bg-[#7CF38E] px-4 py-2 text-xs font-semibold text-finance-800 transition hover:-translate-y-0.5"
                    >
                        <Plus className="h-3.5 w-3.5" /> {t('create_budget')}
                    </button>
                </div>

                {currentBudgets.length > 0 ? (
                    <div className="space-y-4">
                        {currentBudgets.map((budget) => {
                            const spent = Number(budget.spent ?? 0);
                            const limit = Number(budget.limit_amount ?? budget.limit ?? 0);
                            const percentage = limit > 0 ? Math.min(100, Math.round((spent / limit) * 100)) : 0;
                            const isOver = spent > limit;

                            return (
                                <div key={budget.id} className="group rounded-[22px] bg-[#FAFCF7] p-4 transition hover:bg-[#F3F8EE] dark:bg-[#2A3341]">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-bold text-zinc-900 dark:text-[#F0F1F3]">{budget.category}</p>
                                            <p className="mt-0.5 text-xs text-zinc-500 dark:text-[#8B92A9]">
                                                {formatCurrency(spent)} / {formatCurrency(limit)}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className={cn(
                                                'rounded-full px-2.5 py-1 text-[11px] font-bold',
                                                isOver ? 'bg-red-100 text-red-600' : percentage >= 80 ? 'bg-amber-100 text-amber-700' : 'bg-[#DDF4E2] text-finance-700'
                                            )}>
                                                {percentage}%
                                            </span>
                                            <button
                                                onClick={() => { setEditingBudget(budget); setOpenBudgetModal(true); }}
                                                className="rounded-full p-1.5 text-zinc-400 opacity-0 transition hover:bg-white hover:text-finance-700 group-hover:opacity-100"
                                                title={t('edit_budget')}
                                            >
                                                <Edit3 className="h-3.5 w-3.5" />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteBudget(budget.id)}
                                                className="rounded-full p-1.5 text-zinc-400 opacity-0 transition hover:bg-red-50 hover:text-red-500 group-hover:opacity-100"
                                                title={t('delete')}
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-zinc-200 dark:bg-[#3F4959]">
                                        <div
                                            className={cn(
                                                'h-full rounded-full transition-all duration-500',
                                                isOver ? 'bg-red-500' : percentage >= 80 ? 'bg-amber-500' : 'bg-finance-600'
                                            )}
                                            style={{ width: `${Math.min(100, percentage)}%` }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="rounded-[22px] border border-dashed border-[#D9E5CF] p-8 text-center dark:border-[#3F4959]">
                        <Target className="mx-auto mb-3 h-8 w-8 text-zinc-300 dark:text-[#8B92A9]" />
                        <p className="text-sm font-semibold text-zinc-500 dark:text-[#B0B8CC]">{t('no_budget_this_month')}</p>
                        <p className="mt-1 text-xs text-zinc-400 dark:text-[#8B92A9]">{t('click_to_create_budget')}</p>
                    </div>
                )}
            </section>

            <div className="mt-4 grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
                <section className="relative overflow-hidden rounded-[30px] border border-finance-200 bg-white p-6 shadow-card md:p-8 lg:col-start-1 lg:row-start-1">
                    <div className="flex items-start gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#DDF4E2] text-finance-700">
                            <Sparkles className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-lg font-extrabold text-zinc-900 dark:text-[#F0F1F3]">{t('AI_insight')}</h3>
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
                            <div key={tx.id} className="flex items-center justify-between gap-4 rounded-[20px] bg-[#FAFCF7] px-3 py-3 transition hover:bg-[#F3F8EE] dark:bg-[#253044] dark:hover:bg-[#2D3A52]">
                                <div className="flex items-center gap-4">
                                    <div className={cn(
                                        'flex h-12 w-12 items-center justify-center rounded-full',
                                        getTransactionBg(tx)
                                    )}>
                                        <tx.icon className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-zinc-900 dark:text-[#F0F1F3]">{tx.label}</h4>
                                        <p className="text-[11px] text-zinc-500 dark:text-[#8B92A9]">{tx.category} • {tx.date}</p>
                                    </div>
                                </div>
                                <p className={cn('text-sm font-bold md:text-base', getTransactionColor(tx))}>
                                    {getTransactionPrefix(tx)} {formatCurrency(Math.abs(tx.amount))}
                                </p>
                            </div>
                        )) : (
                            <p className="text-sm text-zinc-500 dark:text-[#B0B8CC]">{t('recent_backend_empty')}</p>
                        )}
                    </div>
                </section>
            </div>

            {/* Mobile action buttons */}
            <div className="mt-4 grid grid-cols-3 gap-3 lg:hidden">
                <button
                    onClick={() => {
                        setFormType('INCOME');
                        setOpenTransactionModal(true);
                    }}
                    className="flex flex-col items-center justify-center gap-2 rounded-[24px] bg-white px-3 py-4 text-finance-700 shadow-card"
                >
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#DDF4E2]">
                        <Plus className="h-5 w-5" />
                    </div>
                    <span className="text-xs font-semibold">{t('catat_pemasukan')}</span>
                </button>
                <button
                    onClick={() => {
                        setFormType('EXPENSE');
                        setOpenTransactionModal(true);
                    }}
                    className="flex flex-col items-center justify-center gap-2 rounded-[24px] bg-white px-3 py-4 text-red-500 shadow-card"
                >
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#FBE5EA]">
                        <Minus className="h-5 w-5" />
                    </div>
                    <span className="text-xs font-semibold">{t('catat_pengeluaran')}</span>
                </button>
                <button
                    onClick={() => setOpenTransferModal(true)}
                    className="flex flex-col items-center justify-center gap-2 rounded-[24px] bg-white px-3 py-4 text-blue-600 shadow-card"
                    disabled={wallets.length < 2}
                >
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-50">
                        <Repeat className="h-5 w-5" />
                    </div>
                    <span className="text-xs font-semibold">Transfer</span>
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
                        <div key={tx.id} className="flex items-center justify-between gap-4 rounded-[20px] bg-[#FAFCF7] px-3 py-3 transition hover:bg-[#F3F8EE] dark:bg-[#253044] dark:hover:bg-[#2D3A52]">
                            <div className="flex items-center gap-4">
                                <div className={cn(
                                    'flex h-12 w-12 items-center justify-center rounded-full',
                                    getTransactionBg(tx)
                                )}>
                                    <tx.icon className="h-5 w-5" />
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-zinc-900 dark:text-[#F0F1F3]">{tx.label}</h4>
                                    <p className="text-[11px] text-zinc-500 dark:text-[#8B92A9]">{tx.category} • {tx.date}</p>
                                </div>
                            </div>
                            <p className={cn('text-sm font-bold md:text-base', getTransactionColor(tx))}>
                                {getTransactionPrefix(tx)} {formatCurrency(Math.abs(tx.amount))}
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

            <TransferFormModal
                open={openTransferModal}
                onClose={() => setOpenTransferModal(false)}
            />

            <BudgetFormModal
                open={openBudgetModal}
                onClose={() => { setOpenBudgetModal(false); setEditingBudget(null); }}
                onSubmit={handleBudgetSubmit}
                isSubmitting={createBudget.isPending || updateBudget.isPending}
                editingBudget={editingBudget}
            />
        </Layout>
    );
};

export default Dashboard;
