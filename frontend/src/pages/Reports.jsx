import React from 'react';
import { Download, ChevronDown, Sparkles, TrendingDown, TrendingUp, Target, Car, Utensils, Wallet } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Layout } from '../components/layout/Layout';
import { LoadingScreen } from '../components/LoadingScreen';
import { useBudgets, useFinancialInsights, useTransactions, useWallets } from '../hooks/useFinance';
import { useLanguage } from '../context/LanguageContext';
import { cn, formatCurrency } from '../lib/utils';

const Reports = () => {
    const { t, language } = useLanguage();
    const { data: transactionsData, isLoading: transactionsLoading, error: transactionsError } = useTransactions();
    const { data: walletsData, isLoading: walletsLoading, error: walletsError } = useWallets();
    const { data: budgetsData, isLoading: budgetsLoading, error: budgetsError } = useBudgets();

    const transactions = Array.isArray(transactionsData) ? transactionsData : transactionsData?.data ?? [];
    const wallets = Array.isArray(walletsData) ? walletsData : walletsData?.data ?? [];
    const budgets = Array.isArray(budgetsData) ? budgetsData : budgetsData?.data ?? [];
    const primaryWalletId = wallets[0]?.id;
    const { data: insightData } = useFinancialInsights(primaryWalletId, 'monthly', {
        enabled: Boolean(primaryWalletId),
    });

    const isLoading = transactionsLoading || walletsLoading || budgetsLoading;
    const error = transactionsError || walletsError || budgetsError;

    if (isLoading) {
        return <LoadingScreen />;
    }

    if (error) {
        return (
            <Layout>
                <div className="finance-card p-8 text-center md:p-10">
                    <h2 className="text-2xl font-extrabold text-red-600">{t('report_load_failed')}</h2>
                    <p className="mt-2 text-sm text-zinc-500">{t('report_load_hint')}</p>
                </div>
            </Layout>
        );
    }

    const totals = transactions.reduce(
        (acc, tx) => {
            const amount = Number(tx.amount ?? 0);
            const type = tx.type || (amount >= 0 ? 'income' : 'expense');
            if (type === 'income') {
                acc.income += amount;
            } else {
                acc.expense += Math.abs(amount);
            }
            acc.count += 1;
            return acc;
        },
        { income: 0, expense: 0, count: 0 }
    );

    const chartMap = transactions.reduce((acc, tx) => {
        const rawDate = tx.date || tx.createdAt;
        const key = rawDate
            ? new Date(rawDate).toLocaleDateString(language === 'id' ? 'id-ID' : 'en-US', { month: 'short', year: 'numeric' })
            : t('no_date');
        if (!acc[key]) {
            acc[key] = { name: key, income: 0, expense: 0 };
        }

        const amount = Number(tx.amount ?? 0);
        const type = tx.type || (amount >= 0 ? 'income' : 'expense');
        if (type === 'income') {
            acc[key].income += amount;
        } else {
            acc[key].expense += Math.abs(amount);
        }

        return acc;
    }, {});

    const chartData = Object.values(chartMap).slice(-4);
    const totalBalance = wallets.reduce((sum, wallet) => sum + Number(wallet.balance ?? wallet.amount ?? 0), 0);
    const savingsRate = totals.income > 0 ? Math.max(0, ((totals.income - totals.expense) / totals.income) * 100) : 0;
    const budgetTarget = budgets.reduce((sum, budget) => sum + Number(budget.limit ?? budget.amount ?? 0), 0);
    const budgetSpent = budgets.reduce((sum, budget) => sum + Number(budget.spent ?? budget.used ?? 0), 0);
    const budgetProgress = budgetTarget > 0 ? Math.min(100, (budgetSpent / budgetTarget) * 100) : 0;

    return (
        <Layout>
            <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                    <h1 className="text-3xl font-extrabold leading-tight text-finance-700 md:text-4xl">{t('financial_reports')}</h1>
                    <p className="mt-1 text-sm text-zinc-500">{t('financial_overview')}</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="finance-pill bg-white text-zinc-700 shadow-card">
                        Oktober 2023 <ChevronDown className="h-4 w-4" />
                    </button>
                    <button className="finance-pill bg-[#7CF38E] text-finance-800 transition hover:-translate-y-0.5">
                        <Download className="h-4 w-4" /> {t('export')}
                    </button>
                </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-[0.92fr_1.08fr]">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
                    <div className="finance-card p-6 relative overflow-hidden">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <p className="text-sm text-zinc-500">{t('total_transactions')}</p>
                                <h2 className="mt-3 text-3xl font-extrabold text-zinc-900">{totals.count}</h2>
                                <p className="mt-3 flex items-center gap-1 text-sm font-semibold text-finance-700">
                                    <TrendingUp className="h-4 w-4" /> +{Math.round(savingsRate)}% dari bulan lalu
                                </p>
                            </div>
                            <div className="rounded-full bg-[#EEF8EA] p-3 text-finance-700">
                                <Sparkles className="h-5 w-5" />
                            </div>
                        </div>
                    </div>

                    <div className="finance-card p-6 relative overflow-hidden">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <p className="text-sm text-zinc-500">{t('avg_expense')}</p>
                                <h2 className="mt-3 text-3xl font-extrabold text-zinc-900">{formatCurrency(totals.count ? totals.expense / totals.count : 0)}<span className="text-base font-medium text-zinc-400">/hari</span></h2>
                                <p className="mt-3 flex items-center gap-1 text-sm font-semibold text-[#D1496F]">
                                    <TrendingDown className="h-4 w-4" /> -5% dari bulan lalu
                                </p>
                            </div>
                            <div className="rounded-full bg-[#FBE5EA] p-3 text-[#D1496F]">
                                <TrendingDown className="h-5 w-5" />
                            </div>
                        </div>
                    </div>

                    <div className="rounded-[30px] bg-gradient-to-br from-finance-700 to-finance-500 p-6 text-white shadow-soft">
                        <div className="mb-4 flex items-center justify-between">
                            <p className="text-sm text-white/70">{t('savings_rate')}</p>
                            <Target className="h-5 w-5 text-white/80" />
                        </div>
                        <h2 className="text-4xl font-extrabold">{Math.round(savingsRate)}%</h2>
                        <div className="mt-4 h-2 rounded-full bg-white/20">
                            <div className="h-2 rounded-full bg-[#8EF0A2]" style={{ width: `${Math.min(100, savingsRate)}%` }} />
                        </div>
                        <p className="mt-3 text-sm text-white/70">Target bulanan: 20%</p>
                    </div>
                </div>

                <div className="finance-card p-6 md:p-8">
                    <div className="mb-6 flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-extrabold text-zinc-900">{t('income_vs_expense')}</h3>
                            <p className="mt-1 text-sm text-zinc-500">Oktober 2023</p>
                        </div>
                        <div className="flex items-center gap-4 text-xs font-semibold text-zinc-500">
                            <span className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-finance-700" />{t('filter_income')}</span>
                            <span className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-[#D1496F]" />{t('filter_expense')}</span>
                        </div>
                    </div>

                    <div className="h-[340px] md:h-[420px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData} margin={{ top: 10, right: 0, left: -10, bottom: 0 }} barGap={10}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EDF2E9" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} tickFormatter={(val) => `${val / 1000000}M`} />
                                <Tooltip
                                    cursor={{ fill: '#F7FBF3' }}
                                    contentStyle={{ borderRadius: '18px', border: 'none', boxShadow: '0 18px 50px rgba(16,24,40,0.12)' }}
                                />
                                <Bar dataKey="income" fill="#0D8A3B" radius={[8, 8, 0, 0]} barSize={24} />
                                <Bar dataKey="expense" fill="#D1496F" radius={[8, 8, 0, 0]} barSize={24} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <div className="mt-4 finance-card p-6 md:p-8">
                <div className="mb-6 flex items-center justify-between">
                    <h3 className="text-lg font-extrabold text-zinc-900">{t('transaction_history')}</h3>
                    <button className="text-sm font-bold text-finance-700">{t('see_all')}</button>
                </div>
                <div className="space-y-5">
                    {transactions.slice(0, 3).map((tx, index) => {
                        const Icon = tx.category?.toLowerCase().includes('makan') ? Utensils : tx.category?.toLowerCase().includes('transport') ? Car : Wallet;
                        const amount = Number(tx.amount ?? 0);
                        const isIncome = tx.type === 'income' || amount > 0;

                        return (
                            <div key={tx.id ?? index} className="flex items-center justify-between gap-4 rounded-[22px] bg-[#FAFCF7] px-4 py-4">
                                <div className="flex items-center gap-4">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#7CF38E] text-zinc-900">
                                        <Icon className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-zinc-900">{tx.label || tx.description || t('transaction')}</h4>
                                        <p className="text-[11px] text-zinc-500">{tx.category || t('category')} • {tx.date || 'Hari ini'}</p>
                                    </div>
                                </div>
                                <p className={cn('text-sm font-bold md:text-base', isIncome ? 'text-finance-700' : 'text-[#D1496F]')}>
                                    {isIncome ? '+' : '-'} {formatCurrency(Math.abs(amount))}
                                </p>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="mt-4 finance-card p-6 md:p-8">
                <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-lg font-extrabold text-zinc-900">Insight Backend</h3>
                    <span className="text-xs font-semibold uppercase tracking-[0.22em] text-zinc-400">
                        {primaryWalletId ? 'Aktif' : 'Belum ada wallet'}
                    </span>
                </div>
                <p className="text-sm leading-7 text-zinc-600">
                    {insightData || 'Tambahkan wallet dan transaksi agar endpoint /insights dari backend bisa menghasilkan analisis.'}
                </p>
            </div>

            <div className="mt-4 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
                <div className="finance-card p-6 md:p-8">
                    <h3 className="text-lg font-extrabold text-zinc-900">{t('category_summary')}</h3>
                    <div className="mt-6 space-y-4">
                        {transactions.length > 0 ? transactions.slice(0, 4).map((tx, index) => {
                            const amount = Math.abs(Number(tx.amount ?? 0));
                            return (
                                <div key={tx.id ?? index} className="flex items-center justify-between rounded-[20px] border border-[#E8F1E3] px-4 py-4">
                                    <div>
                                        <p className="text-sm font-bold text-zinc-900">{tx.category || t('category')}</p>
                                        <p className="text-xs text-zinc-500">{tx.type === 'income' ? 'Pemasukan' : 'Pengeluaran'}</p>
                                    </div>
                                    <p className="text-sm font-bold text-finance-700">{formatCurrency(amount)}</p>
                                </div>
                            );
                        }) : (
                            <div className="rounded-[20px] border border-dashed border-zinc-200 p-8 text-center text-sm text-zinc-500">
                                {t('transactions_data_unavailable')}
                            </div>
                        )}
                    </div>
                </div>

                <div className="rounded-[30px] bg-[#0D8A3B] p-6 text-white shadow-soft md:p-8">
                    <div className="mb-4 flex items-center justify-between">
                        <p className="text-sm text-white/75">{t('budget_overview')}</p>
                        <Sparkles className="h-5 w-5 text-white/75" />
                    </div>
                    <h3 className="text-4xl font-extrabold">{Math.round(budgetProgress)}%</h3>
                    <div className="mt-4 h-2 rounded-full bg-white/20">
                        <div className="h-2 rounded-full bg-[#8EF0A2]" style={{ width: `${budgetProgress}%` }} />
                    </div>
                    <p className="mt-3 text-sm text-white/75">Target bulanan: {formatCurrency(budgetTarget || totalBalance)}</p>
                    <div className="mt-8 rounded-[22px] bg-white/10 p-5 backdrop-blur-sm">
                        <p className="text-xs uppercase tracking-[0.24em] text-white/70">Spent / Target</p>
                        <p className="mt-2 text-xl font-bold">{formatCurrency(budgetSpent)} / {formatCurrency(budgetTarget)}</p>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default Reports;
