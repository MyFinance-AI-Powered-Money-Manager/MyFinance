import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowDownLeft, ArrowUpRight, Car, Search, ShoppingBag, Scan, Utensils, Wallet } from 'lucide-react';
import { cn, formatCurrency } from '../lib/utils';
import { useLanguage } from '../context/LanguageContext';
import { LoadingScreen } from '../components/LoadingScreen';
import { useCreateTransaction, useTransactions, useWallets } from '../hooks/useFinance';
import { TransactionFormModal } from '../components/TransactionFormModal';
import { Layout } from '../components/layout/Layout';

const Transactions = () => {
    const { t, language } = useLanguage();
    const navigate = useNavigate();
    const [activeDate, setActiveDate] = React.useState('today');
    const [activeType, setActiveType] = React.useState('all');
    const [search, setSearch] = React.useState('');
    const [formType, setFormType] = React.useState('income');
    const [openTransactionModal, setOpenTransactionModal] = React.useState(false);
    const { data, isLoading, error } = useTransactions();
    const { data: walletsData } = useWallets();
    const createTransaction = useCreateTransaction();

    const isSameDay = (left, right) => {
        if (!left || !right) {
            return false;
        }

        return left.toDateString() === right.toDateString();
    };

    const daysBetween = (left, right) => {
        const msPerDay = 24 * 60 * 60 * 1000;
        const startOfLeft = new Date(left.getFullYear(), left.getMonth(), left.getDate());
        const startOfRight = new Date(right.getFullYear(), right.getMonth(), right.getDate());
        return Math.round((startOfRight - startOfLeft) / msPerDay);
    };

    if (isLoading) {
        return <LoadingScreen />;
    }

    if (error) {
        return (
            <Layout>
                <div className="finance-card p-8 text-center md:p-10">
                    <h2 className="text-2xl font-extrabold text-red-600">{t('transactions_load_failed')}</h2>
                    <p className="mt-2 text-sm text-zinc-500">{t('transactions_load_hint')}</p>
                </div>
            </Layout>
        );
    }

    const transactions = Array.isArray(data) ? data : data?.data ?? [];
    const wallets = Array.isArray(walletsData) ? walletsData : walletsData?.data ?? [];

    if (wallets.length === 0) {
        return (
            <Layout>
                <div className="finance-card mx-auto max-w-2xl p-8 text-center md:p-10">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#DDF4E2] text-finance-700">
                        <Wallet className="h-8 w-8" />
                    </div>
                    <h1 className="text-2xl font-extrabold text-zinc-900 dark:text-[#F0F1F3]">Buat Dompet Dulu</h1>
                    <p className="mt-3 text-sm leading-7 text-zinc-500 dark:text-[#B0B8CC]">
                        Sebelum mencatat transaksi, kamu perlu membuat dompet terlebih dahulu.
                    </p>
                    <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
                        <button
                            onClick={() => navigate('/dashboard', { state: { openWalletModal: true } })}
                            className="rounded-[18px] bg-finance-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-finance-800"
                        >
                            Buat Dompet Sekarang
                        </button>
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="rounded-[18px] border border-[#D9E5CF] bg-white px-5 py-3 text-sm font-semibold text-zinc-700 transition hover:bg-[#F6FAF1]"
                        >
                            Kembali ke Dashboard
                        </button>
                    </div>
                </div>
            </Layout>
        );
    }

    const normalized = transactions
        .map((tx, index) => ({
            id: tx.id ?? index,
            icon: tx.category?.toLowerCase().includes('makan') ? Utensils : tx.category?.toLowerCase().includes('transport') ? Car : tx.type === 'income' ? Wallet : ShoppingBag,
            label: tx.label || tx.description || t('transaction'),
            category: tx.category || tx.type || t('category'),
            amount: Number(tx.amount ?? 0),
            type: tx.type || (Number(tx.amount ?? 0) >= 0 ? 'income' : 'expense'),
            date: tx.date || tx.createdAt || '',
        }))
        .filter((tx) => {
            const matchesSearch = [tx.label, tx.category, String(tx.amount)].join(' ').toLowerCase().includes(search.toLowerCase());
            const matchesType = activeType === 'all' ? true : tx.type === activeType;
            const transactionDate = tx.date ? new Date(tx.date) : null;
            const today = new Date();
            const matchesDate =
                activeDate === 'today'
                    ? transactionDate ? isSameDay(transactionDate, today) : false
                    : activeDate === 'yesterday'
                        ? transactionDate ? daysBetween(transactionDate, today) === 1 : false
                        : activeDate === 'month'
                            ? transactionDate ? daysBetween(transactionDate, today) >= 0 && daysBetween(transactionDate, today) < 30 : false
                            : true;
            return matchesSearch && matchesType && matchesDate;
        });

    const grouped = normalized.reduce((acc, tx) => {
        const key = tx.date
            ? new Date(tx.date).toLocaleDateString(language === 'id' ? 'id-ID' : 'en-US', { day: '2-digit', month: 'long', year: 'numeric' })
            : t('no_date');
        if (!acc[key]) {
            acc[key] = [];
        }
        acc[key].push(tx);
        return acc;
    }, {});

    const filters = [
        { id: 'all', label: t('filter_all') },
        { id: 'income', label: t('filter_income') },
        { id: 'expense', label: t('filter_expense') },
    ];

    const dateTabs = [
        { id: 'today', label: 'Hari Ini' },
        { id: 'yesterday', label: 'Kemarin' },
        { id: 'month', label: '1 Bulan' },
    ];

    const handleCreateTransaction = async (payload) => {
        await createTransaction.mutateAsync(payload);
        setOpenTransactionModal(false);
    };

    return (
        <Layout>
            <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                    <h1 className="text-3xl font-extrabold leading-tight text-finance-700 md:text-4xl dark:text-[#7CF38E]">{t('all_transactions')}</h1>
                    <p className="mt-1 text-sm text-zinc-500 dark:text-[#B0B8CC]">{t('manage_cashflow')}</p>
                </div>
                <div className="relative w-full lg:max-w-md">
                    <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-400" />
                    <input
                        type="text"
                        placeholder={t('search_transactions_placeholder')}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="finance-input pl-12 dark:bg-[#2D3748] dark:border-[#3F4959] dark:text-[#F0F1F3] dark:placeholder-[#8B92A9]"
                    />
                </div>
            </div>

            <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                    {dateTabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveDate(tab.id)}
                            className={cn(
                                'finance-pill whitespace-nowrap border transition',
                                activeDate === tab.id
                                    ? 'bg-white text-finance-700 shadow-card border-white dark:bg-[#2D3748] dark:text-[#7CF38E] dark:border-[#2D3748]'
                                    : 'bg-transparent text-zinc-500 border-transparent hover:text-finance-700 dark:text-[#8B92A9] dark:hover:text-[#7CF38E]'
                            )}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => {
                            if (wallets.length === 0) {
                                navigate('/dashboard', { state: { openWalletModal: true } });
                                return;
                            }

                            setFormType('income');
                            setOpenTransactionModal(true);
                        }}
                        className="flex-1 rounded-[18px] bg-[#7CF38E] px-4 py-3 text-sm font-semibold text-finance-800 transition hover:-translate-y-0.5 md:flex-none"
                    >
                        <ArrowDownLeft className="mr-2 inline-block h-4 w-4" />
                        {t('filter_income')}
                    </button>
                    <button
                        onClick={() => {
                            if (wallets.length === 0) {
                                navigate('/dashboard', { state: { openWalletModal: true } });
                                return;
                            }

                            setFormType('expense');
                            setOpenTransactionModal(true);
                        }}
                        className="flex-1 rounded-[18px] bg-[#F8D6DF] px-4 py-3 text-sm font-semibold text-[#D1496F] transition hover:-translate-y-0.5 md:flex-none"
                    >
                        <ArrowUpRight className="mr-2 inline-block h-4 w-4" />
                        {t('filter_expense')}
                    </button>
                </div>
            </div>

            <div className="mb-6 flex items-center gap-2 overflow-x-auto pb-1">
                {filters.map((filter) => (
                    <button
                        key={filter.id}
                        onClick={() => setActiveType(filter.id)}
                        className={cn(
                            'finance-pill whitespace-nowrap transition',
                            activeType === filter.id ? 'bg-white text-finance-700 shadow-card dark:bg-[#2D3748] dark:text-[#7CF38E]' : 'bg-white/55 text-zinc-500 dark:bg-white/10 dark:text-[#8B92A9]'
                        )}
                    >
                        {filter.label}
                    </button>
                ))}
            </div>

            <div className="space-y-6">
                {Object.entries(grouped).length > 0 ? Object.entries(grouped).map(([day, txs]) => (
                    <section key={day} className="finance-card p-6 md:p-8">
                        <h3 className="text-lg font-extrabold text-zinc-900 dark:text-[#F0F1F3]">{day}</h3>
                        <div className="mt-6 space-y-4">
                            {txs.map((tx) => (
                                <div key={tx.id} className="flex items-center justify-between gap-4 rounded-[22px] bg-[#FAFCF7] px-4 py-4">
                                    <div className="flex items-center gap-4">
                                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#7CF38E] text-zinc-900">
                                            <tx.icon className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-bold text-zinc-900 md:text-base dark:text-[#F0F1F3]">{tx.label}</h4>
                                            <p className="text-[11px] text-zinc-500 md:text-sm dark:text-[#8B92A9]">{tx.category}</p>
                                        </div>
                                    </div>
                                    <p className={cn('text-sm font-bold md:text-base', tx.type === 'income' ? 'text-finance-700' : 'text-[#D1496F]')}>
                                        {tx.type === 'income' ? '+' : '-'} {formatCurrency(Math.abs(tx.amount))}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </section>
                )) : (
                    <div className="finance-card p-10 text-center text-zinc-500">
                        {t('no_transactions_match_filter')}
                    </div>
                )}
            </div>

            <div className="fixed bottom-24 right-6 z-50 md:hidden">
                <button
                    onClick={() => navigate('/scan')}
                    className="flex h-14 w-14 items-center justify-center rounded-full bg-[#7CF38E] text-finance-800 shadow-soft"
                >
                    <Scan className="h-6 w-6" />
                </button>
            </div>

            <TransactionFormModal
                open={openTransactionModal}
                type={formType}
                wallets={wallets}
                onClose={() => setOpenTransactionModal(false)}
                onSubmit={handleCreateTransaction}
                isSubmitting={createTransaction.isPending}
            />
        </Layout>
    );
};

export default Transactions;
