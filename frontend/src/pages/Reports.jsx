import React from 'react';
import { ChevronDown, Sparkles, TrendingDown, TrendingUp, Target, Car, Utensils, Wallet, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Layout } from '../components/layout/Layout';
import { LoadingScreen } from '../components/LoadingScreen';
import { useTransactions } from '../hooks/useFinance';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { formatCurrency } from '../lib/utils';

const dashboardDetailBaseUrl = 'https://myfinance-dashboard-cp.streamlit.app/';

const formatStreamlitDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}_${month}_${day}`;
};

const buildDashboardDetailLink = (userId) => {
    if (userId === null || userId === undefined || userId === '') {
        return '';
    }

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const encodedUserId = encodeURIComponent(String(userId));

    return `${dashboardDetailBaseUrl}?USERID=${encodedUserId}&START=${formatStreamlitDate(startOfMonth)}&END=${formatStreamlitDate(now)}`;
};

const emptyChartData = [
    { name: 'W1', income: 0, expense: 0 },
    { name: 'W2', income: 0, expense: 0 },
    { name: 'W3', income: 0, expense: 0 },
    { name: 'W4', income: 0, expense: 0 },
];

const getDateValue = (tx) => {
    const rawDate = tx.date || tx.createdAt;
    if (!rawDate) {
        return null;
    }

    const parsedDate = new Date(rawDate);
    return Number.isNaN(parsedDate.getTime()) ? null : parsedDate;
};

const getMonthKey = (value) => {
    const date = value ? new Date(value) : null;

    if (!date || Number.isNaN(date.getTime())) {
        return null;
    }

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
};

const getCurrentMonthKey = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
};

const getPreviousMonthKey = (monthKey) => {
    const [year, month] = monthKey.split('-').map(Number);
    const previousDate = new Date(year, month - 2, 1);
    const previousYear = previousDate.getFullYear();
    const previousMonth = String(previousDate.getMonth() + 1).padStart(2, '0');
    return `${previousYear}-${previousMonth}`;
};

const getTransactionMonthKey = (tx) => getMonthKey(tx.date || tx.createdAt);

const calculatePercentageChange = (currentValue, previousValue) => {
    if (previousValue <= 0) {
        return currentValue > 0 ? 100 : 0;
    }

    return ((currentValue - previousValue) / previousValue) * 100;
};

const formatTrend = (value, language) => {
    const roundedValue = Math.round(Math.abs(value));

    if (value > 0) {
        return language === 'id' ? `+${roundedValue}% dari bulan lalu` : `+${roundedValue}% from last month`;
    }

    if (value < 0) {
        return language === 'id' ? `-${roundedValue}% dari bulan lalu` : `-${roundedValue}% from last month`;
    }

    return language === 'id' ? '0% dari bulan lalu' : '0% from last month';
};

const formatAxisValue = (value) => {
    if (value >= 1000000) {
        const millions = value / 1000000;
        return `${Number.isInteger(millions) ? millions : millions.toFixed(1)}M`;
    }

    if (value >= 1000) {
        const thousands = value / 1000;
        return `${Number.isInteger(thousands) ? thousands : thousands.toFixed(1)}K`;
    }

    return value;
};

const buildChartData = (transactions) => {
    if (!transactions.length) {
        return emptyChartData;
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

    return buckets.some((bucket) => bucket.income > 0 || bucket.expense > 0) ? buckets : emptyChartData;
};

const Reports = () => {
    const { t, language } = useLanguage();
    const navigate = useNavigate();
    const { user: authUser } = useAuth();
    const { data: transactionsData, isLoading, error } = useTransactions();

    const transactions = Array.isArray(transactionsData) ? transactionsData : transactionsData?.data ?? [];
    const currentMonthKey = getCurrentMonthKey();
    const previousMonthKey = getPreviousMonthKey(currentMonthKey);
    const dashboardDetailLink = buildDashboardDetailLink(authUser?.id ?? authUser?.user_id ?? authUser?._id);

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

    const currentMonthTransactions = sortedTransactions.filter((tx) => getTransactionMonthKey(tx) === currentMonthKey);
    const previousMonthTransactions = sortedTransactions.filter((tx) => getTransactionMonthKey(tx) === previousMonthKey);

    const currentTotals = currentMonthTransactions.reduce(
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

    const previousTotals = previousMonthTransactions.reduce(
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

    const currentActiveDays = Math.max(1, currentTotals.days.size || 1);
    const previousActiveDays = Math.max(1, previousTotals.days.size || 1);
    const savingsRate = currentTotals.income > 0 ? Math.max(0, ((currentTotals.income - currentTotals.expense) / currentTotals.income) * 100) : 0;
    const averageExpense = currentTotals.expense / currentActiveDays;
    const previousAverageExpense = previousTotals.expense / previousActiveDays;
    const transactionTrend = calculatePercentageChange(currentTotals.count, previousTotals.count);
    const expenseTrend = calculatePercentageChange(averageExpense, previousAverageExpense);
    const chartData = buildChartData(currentMonthTransactions);
    const hasCurrentMonthData = currentMonthTransactions.length > 0;

    const handleOpenDetail = () => {
        if (!dashboardDetailLink) {
            return;
        }

        if (/^https?:\/\//i.test(dashboardDetailLink)) {
            window.open(dashboardDetailLink, '_blank', 'noopener,noreferrer');
            return;
        }

        navigate(dashboardDetailLink);
    };

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
                        <button
                            type="button"
                            onClick={handleOpenDetail}
                            className="finance-pill bg-[#7CF38E] text-finance-800 transition hover:-translate-y-0.5 dark:bg-[#7CF38E] dark:text-finance-800"
                        >
                            <ArrowRight className="h-4 w-4" /> {t('detail')}
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
                                    <h2 className="mt-4 text-3xl font-extrabold text-zinc-900 dark:text-[#F0F1F3]">{currentTotals.count}</h2>
                                    <p className="mt-3 flex items-center gap-1 text-sm font-semibold text-finance-700">
                                        <TrendingUp className="h-4 w-4" /> {formatTrend(transactionTrend, language)}
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
                                        <TrendingDown className="h-4 w-4" /> {formatTrend(expenseTrend, language)}
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

                    <div className="finance-card min-w-0 p-5 sm:p-6 md:p-8">
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

                        <div className="h-[330px] min-h-[330px] min-w-0 md:h-[360px]">
                            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={330}>
                                <BarChart data={chartData} margin={{ top: 20, right: 0, left: -12, bottom: 0 }} barGap={12}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EDF2E9" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#6B7280' }} />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 11, fill: '#6B7280' }}
                                        tickFormatter={formatAxisValue}
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
                        {!hasCurrentMonthData && (
                            <p className="mt-4 text-sm text-zinc-500 dark:text-[#8B92A9]">
                                Belum ada transaksi bulan ini, jadi grafik menampilkan nilai 0.
                            </p>
                        )}
                    </div>
                </div>

            </div>
        </Layout>
    );
};

export default Reports;
