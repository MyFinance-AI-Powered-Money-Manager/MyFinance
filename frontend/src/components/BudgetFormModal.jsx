import React from 'react';
import { X } from 'lucide-react';
import { formatCurrency } from '../lib/utils';
import { useLanguage } from '../context/LanguageContext';

const BUDGET_CATEGORIES = ['NEEDS', 'WANTS', 'OTHER'];

const getCurrentMonthPeriod = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
};

export const BudgetFormModal = ({ open, onClose, onSubmit, isSubmitting, editingBudget = null }) => {
    const { t } = useLanguage();
    const [category, setCategory] = React.useState('NEEDS');
    const [limitAmount, setLimitAmount] = React.useState('');
    const [monthPeriod, setMonthPeriod] = React.useState(getCurrentMonthPeriod());

    React.useEffect(() => {
        if (editingBudget) {
            setCategory(editingBudget.category || 'NEEDS');
            setLimitAmount(String(editingBudget.limit_amount || editingBudget.limit || ''));
            setMonthPeriod(editingBudget.month_period || editingBudget.monthPeriod || getCurrentMonthPeriod());
        } else {
            setCategory('NEEDS');
            setLimitAmount('');
            setMonthPeriod(getCurrentMonthPeriod());
        }
    }, [editingBudget, open]);

    if (!open) return null;

    const isEditing = Boolean(editingBudget?.id);

    const handleSubmit = (e) => {
        e.preventDefault();
        const amount = Number(limitAmount);
        if (!amount || amount <= 0) return;

        const payload = isEditing
            ? { id: editingBudget.id, data: { limit_amount: amount } }
            : { category, limit_amount: amount, month_period: monthPeriod };

        onSubmit(payload);
    };

    return (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-[28px] bg-white p-6 shadow-2xl dark:bg-[#1F2733] md:p-8">
                <div className="mb-6 flex items-center justify-between">
                    <h2 className="text-xl font-extrabold text-zinc-900 dark:text-[#F0F1F3]">
                        {isEditing ? t('edit_budget') : t('new_budget')}
                    </h2>
                    <button onClick={onClose} className="rounded-full p-2 text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-[#2D3748]">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {!isEditing && (
                        <>
                            <div>
                                <label className="mb-1 block text-sm font-semibold text-zinc-700 dark:text-[#D9DCE3]">{t('category')}</label>
                                <select
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                    className="finance-input"
                                >
                                    {BUDGET_CATEGORIES.map((cat) => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-semibold text-zinc-700 dark:text-[#D9DCE3]">{t('budget_period')}</label>
                                <input
                                    type="month"
                                    value={monthPeriod}
                                    onChange={(e) => setMonthPeriod(e.target.value)}
                                    className="finance-input"
                                    required
                                />
                            </div>
                        </>
                    )}

                    <div>
                        <label className="mb-1 block text-sm font-semibold text-zinc-700 dark:text-[#D9DCE3]">{t('budget_limit')}</label>
                        <input
                            type="number"
                            value={limitAmount}
                            onChange={(e) => setLimitAmount(e.target.value)}
                            placeholder="1500000"
                            className="finance-input text-lg font-bold"
                            min="1"
                            required
                        />
                        {limitAmount && Number(limitAmount) > 0 && (
                            <p className="mt-1 text-xs text-finance-700">{formatCurrency(Number(limitAmount))}</p>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting || !limitAmount || Number(limitAmount) <= 0}
                        className="flex h-12 w-full items-center justify-center rounded-[20px] bg-finance-700 font-semibold text-white transition hover:bg-finance-800 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {isSubmitting 
                            ? (isEditing ? t('updating_budget') : t('creating_budget')) 
                            : t('save_budget')}
                    </button>
                </form>
            </div>
        </div>
    );
};
