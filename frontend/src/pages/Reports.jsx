import React from 'react';
import { Download, ChevronDown, Sparkles, TrendingDown, TrendingUp, Target, Car, Utensils, Wallet } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Layout } from '../components/layout/Layout';
import { LoadingScreen } from '../components/LoadingScreen';
import { useTransactions } from '../hooks/useFinance';
import { useLanguage } from '../context/LanguageContext';
import { cn, formatCurrency } from '../lib/utils';

const fallbackChartData = [
    { name: 'W1', income: 5600000, expense: 4600000 },
    { name: 'W2', income: 7800000, expense: 3900000 },
    { name: 'W3', income: 5100000, expense: 5600000 },
    { name: 'W4', income: 9200000, expense: 2800000 },
];

const getDateValue = (tx) => {
    const rawDate = tx.date || tx.createdAt;
    if (!rawDate) {
        return null;
    }

    const parsedDate = new Date(rawDate);
    return Number.isNaN(parsedDate.getTime()) ? null : parsedDate;
};

const formatRelativeDate = (value, language) => {
    const date = value ? new Date(value) : null;

    if (!date || Number.isNaN(date.getTime())) {
        return language === 'id' ? 'Hari ini' : 'Today';
    }

    const diffInDays = Math.floor((Date.now() - date.getTime()) / 86400000);

    if (diffInDays <= 0) {
        return language === 'id' ? 'Hari ini' : 'Today';
    }

    if (diffInDays === 1) {
        return language === 'id' ? 'Kemarin' : 'Yesterday';
    }

    if (diffInDays < 7) {
        return language === 'id' ? `${diffInDays} Hari lalu` : `${diffInDays} days ago`;
    }

    return date.toLocaleDateString(language === 'id' ? 'id-ID' : 'en-US', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });
};

const getCategoryIcon = (category) => {
    const normalizedCategory = String(category || '').toLowerCase();

    if (normalizedCategory.includes('makan') || normalizedCategory.includes('food') || normalizedCategory.includes('meal')) {
        return Utensils;
    }

    if (normalizedCategory.includes('transport') || normalizedCategory.includes('car') || normalizedCategory.includes('jalan')) {
        return Car;
    }

    return Wallet;
};

const buildChartData = (transactions) => {
    if (!transactions.length) {
        return fallbackChartData;
    }

    const buckets = [
        { name: 'W1', income: 0, expense: 0 },
        { name: 'W2', income: 0, expense: 0 },
        { name: 'W3', income: 0, expense: 0 },
        { name: 'W4', income: 0, expense: 0 },
    ];

    transactions.forEach((tx, index) => {
        const amount = Number(tx.amount ?? 0);
        const type = String(tx.type || '').toUpperCase() || (amount >= 0 ? 'INCOME' : 'EXPENSE');
        const date = getDateValue(tx);
        const bucketIndex = date ? Math.min(3, Math.max(0, Math.ceil(date.getDate() / 7) - 1)) : index % 4;
        const bucket = buckets[bucketIndex];

        if (type === 'INCOME') {
            bucket.income += Math.abs(amount);
        } else {
            bucket.expense += Math.abs(amount);
        }
    });

    return buckets.some((bucket) => bucket.income > 0 || bucket.expense > 0) ? buckets : fallbackChartData;
};

const Reports = () => {
    const { t, language } = useLanguage();
    const { data: transactionsData, isLoading, error } = useTransactions();

    const transactions = Array.isArray(transactionsData) ? transactionsData : transactionsData?.data ?? [];

    if (isLoading) {
        return <LoadingScreen />;
    }

    if (error) {
        return (
            <Layout>
                <div className="finance-card p-8 text-center md:p-10">
                    <h2 className="text-2xl font-extrabold text-red-600">{t('report_load_failed')}</h2>
                    <p className="mt-2 text-sm text-zinc-500 dark:text-[#B0B8CC]">{t('report_load_hint')}</p>
                </div>
            </Layout>
        );
    }

    const sortedTransactions = [...transactions].sort((left, right) => {
        const leftDate = getDateValue(left)?.getTime() ?? 0;
        const rightDate = getDateValue(right)?.getTime() ?? 0;
        return rightDate - leftDate;
    });

    const totals = transactions.reduce(
        (accumulator, tx) => {
            const amount = Number(tx.amount ?? 0);
            const type = String(tx.type || '').toUpperCase() || (amount >= 0 ? 'INCOME' : 'EXPENSE');

            if (type === 'INCOME') {
                accumulator.income += Math.abs(amount);
            } else {
                accumulator.expense += Math.abs(amount);
            }

            accumulator.count += 1;

            const dateKey = getDateValue(tx)?.toDateString();
            if (dateKey) {
                accumulator.days.add(dateKey);
            }

            return accumulator;
        },
        { income: 0, expense: 0, count: 0, days: new Set() }
    );

    const activeDays = Math.max(1, totals.days.size || 1);
    const savingsRate = totals.income > 0 ? Math.max(0, ((totals.income - totals.expense) / totals.income) * 100) : 0;
    const averageExpense = totals.expense / activeDays;
    const chartData = buildChartData(sortedTransactions);
    const recentTransactions = sortedTransactions.slice(0, 3);

    return (
        <Layout>
            <div className="space-y-4 md:space-y-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                        <h1 className="text-[clamp(2.5rem,4vw,4.5rem)] font-extrabold leading-[0.92] tracking-tight text-finance-700 dark:text-[#7CF38E]">
                            {t('financial_reports')}
                        </h1>
                        <p className="mt-2 text-sm text-zinc-500 dark:text-[#B0B8CC]">Ikhtisar transaksi dan pengeluaran kamu</p>
                    </div>

                    <div className="flex items-center gap-3">
                        <button className="finance-pill border border-white/60 bg-white text-zinc-700 shadow-card dark:border-[#3F4959] dark:bg-[#2D3748] dark:text-[#E8EAED]">
                            Bulan ini <ChevronDown className="h-4 w-4" />
                        </button>
                        <button className="finance-pill bg-[#7CF38E] text-finance-800 transition hover:-translate-y-0.5 dark:bg-[#7CF38E] dark:text-finance-800">
                            <Download className="h-4 w-4" /> {t('export')}
                        </button>
                    </div>
                </div>

                <div className="grid gap-4 xl:grid-cols-[0.86fr_1.14fr] xl:items-start">
                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
                        <div className="finance-card relative overflow-hidden p-5 sm:p-6">
                            <div className="absolute right-0 top-0 h-20 w-20 rounded-bl-[40px] bg-[#EFF7EA]" />
                            <div className="relative flex items-start justify-between gap-4">
                                <div>
                                    <p className="text-sm text-zinc-500 dark:text-[#B0B8CC]">{t('total_transactions')}</p>
                                    <h2 className="mt-4 text-3xl font-extrabold text-zinc-900 dark:text-[#F0F1F3]">{totals.count}</h2>
                                    <p className="mt-3 flex items-center gap-1 text-sm font-semibold text-finance-700">
                                        <TrendingUp className="h-4 w-4" /> +12% dari bulan lalu
                                    </p>
                                </div>
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#E5F6E8] text-finance-700">
                                    <Sparkles className="h-5 w-5" />
                                </div>
                            </div>
                        </div>

                        <div className="finance-card relative overflow-hidden p-5 sm:p-6">
                            <div className="absolute right-0 top-0 h-20 w-20 rounded-bl-[40px] bg-[#FCE7EC]" />
                            <div className="relative flex items-start justify-between gap-4">
                                <div>
                                    <p className="text-sm text-zinc-500 dark:text-[#B0B8CC]">{t('avg_expense')}</p>
                                    <h2 className="mt-4 text-2xl font-extrabold text-zinc-900 dark:text-[#F0F1F3]">
                                        {formatCurrency(averageExpense)}<span className="text-base font-medium text-zinc-400 dark:text-[#8B92A9]">/hari</span>
                                    </h2>
                                    <p className="mt-3 flex items-center gap-1 text-sm font-semibold text-[#D1496F]">
                                        <TrendingDown className="h-4 w-4" /> -5% dari bulan lalu
                                    </p>
                                </div>
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FBE5EA] text-[#D1496F]">
                                    <TrendingDown className="h-5 w-5" />
                                </div>
                            </div>
                        </div>

                        <div className="rounded-[28px] bg-gradient-to-br from-finance-700 via-[#0F8F3D] to-[#0A6A2E] p-5 text-white shadow-soft sm:p-6">
                            <div className="flex items-center justify-between">
                                <p className="text-sm text-white/70">{t('savings_rate')}</p>
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/12 text-white/85">
                                    <Target className="h-5 w-5" />
                                </div>
                            </div>
                            <h2 className="mt-4 text-4xl font-extrabold">{Math.round(savingsRate)}%</h2>
                            <div className="mt-5 h-1.5 rounded-full bg-white/20">
                                <div className="h-1.5 rounded-full bg-[#8EF0A2]" style={{ width: `${Math.min(100, savingsRate)}%` }} />
                            </div>
                            <p className="mt-3 text-sm text-white/70">Target bulanan: 20%</p>
                        </div>
                    </div>

                    <div className="finance-card p-5 sm:p-6 md:p-8">
                        <div className="mb-6 flex items-start justify-between gap-4">
                            <div>
                                <h3 className="text-lg font-extrabold text-zinc-900 dark:text-[#F0F1F3]">{t('income_vs_expense')}</h3>
                                <p className="mt-1 text-sm text-zinc-500 dark:text-[#B0B8CC]">{t('this_month')}</p>
                            </div>
                            <div className="flex items-center gap-4 text-xs font-semibold text-zinc-500 dark:text-[#B0B8CC]">
                                <span className="flex items-center gap-2">
                                    <span className="h-2.5 w-2.5 rounded-full bg-finance-700" />
                                    {t('filter_income')}
                                </span>
                                <span className="flex items-center gap-2">
                                    <span className="h-2.5 w-2.5 rounded-full bg-[#D1496F]" />
                                    {t('filter_expense')}
                                </span>
                            </div>
                        </div>

                        <div className="h-[330px] md:h-[360px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData} margin={{ top: 20, right: 0, left: -12, bottom: 0 }} barGap={12}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EDF2E9" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#6B7280' }} />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 11, fill: '#6B7280' }}
                                        tickFormatter={(value) => {
                                            if (value >= 1000000) {
                                                return `${Math.round(value / 1000000)}M`;
                                            }

                                            if (value >= 1000) {
                                                return `${Math.round(value / 1000)}K`;
                                            }

                                            return value;
                                        }}
                                    />
                                    <Tooltip
                                        cursor={{ fill: '#F7FBF3' }}
                                        contentStyle={{ borderRadius: '18px', border: 'none', boxShadow: '0 18px 50px rgba(16,24,40,0.12)' }}
                                        formatter={(value) => formatCurrency(Number(value || 0))}
                                    />
                                    <Bar dataKey="income" fill="#0D8A3B" radius={[8, 8, 0, 0]} barSize={24} />
                                    <Bar dataKey="expense" fill="#D1496F" radius={[8, 8, 0, 0]} barSize={24} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                <div className="finance-card p-5 sm:p-6 md:p-8">
                    <div className="mb-6 flex items-center justify-between gap-4">
                        <h3 className="text-lg font-extrabold text-zinc-900 dark:text-[#F0F1F3]">{t('transaction_history')}</h3>
                        <button className="text-sm font-bold text-finance-700 transition hover:opacity-80">{t('see_all')}</button>
                    </div>

                    <div className="space-y-5">
                        {recentTransactions.length > 0 ? recentTransactions.map((tx, index) => {
                            const amount = Number(tx.amount ?? 0);
                            const isIncome = String(tx.type || '').toUpperCase() === 'INCOME';
                            const Icon = getCategoryIcon(tx.category);

                            return (
                                <div key={tx.id ?? index} className="flex items-center justify-between gap-4 rounded-[20px] px-1 py-1 sm:px-2 sm:py-2">
                                    <div className="flex items-center gap-4">
                                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#7CF38E] text-zinc-900 shadow-sm">
                                            <Icon className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-bold text-zinc-900 dark:text-[#F0F1F3]">{tx.label || tx.description || t('transaction')}</h4>
                                            <p className="text-[11px] text-zinc-500 dark:text-[#B0B8CC]">
                                                {tx.category || t('category')} • {formatRelativeDate(tx.date || tx.createdAt, language)}
                                            </p>
                                        </div>
                                    </div>
                                    <p className={cn('text-sm font-bold md:text-base', isIncome ? 'text-finance-700' : 'text-[#D1496F]')}>
                                        {isIncome ? '+' : '-'} {formatCurrency(Math.abs(amount))}
                                    </p>
                                </div>
                            );
                        }) : (
                            <div className="rounded-[20px] border border-dashed border-zinc-200 p-8 text-center text-sm text-zinc-500 dark:border-[#3F4959] dark:text-[#8B92A9]">
                                {t('transactions_data_unavailable')}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default Reports;
