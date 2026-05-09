import React from 'react';
import { X } from 'lucide-react';
import { useWallets } from '../hooks/useFinance';
import { showError } from '../lib/toast';

const incomeCategories = ['bank', 'e-wallet', 'tabungan', 'investasi', 'lainnya'];
const expenseCategories = ['makanan', 'transport', 'belanja', 'tagihan', 'lainnya'];

const todayDate = () => new Date().toISOString().slice(0, 10);

export const TransactionFormModal = ({
    open,
    type,
    wallets,
    onClose,
    onSubmit,
    isSubmitting,
}) => {
    const [amount, setAmount] = React.useState('');
    const [category, setCategory] = React.useState('');
    const [description, setDescription] = React.useState('');
    const [date, setDate] = React.useState(todayDate());
    // Wallet selection removed to allow creating transactions without selecting a source

    const { data: walletsData } = useWallets();

    React.useEffect(() => {
        if (!open) {
            return;
        }

        setAmount('');
        setCategory('');
        setDescription('');
        setDate(todayDate());
        // no-op: wallet selection removed
    }, [open, type, wallets]);

    const availableWallets = (Array.isArray(wallets) && wallets.length > 0)
        ? wallets
        : (Array.isArray(walletsData) ? walletsData : walletsData?.data ?? []);

    if (!open) {
        return null;
    }

    const categories = type === 'income' ? incomeCategories : expenseCategories;

    const handleSubmit = async (event) => {
        event.preventDefault();

        const numericAmount = Number(amount);
        if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
            showError('Jumlah harus lebih dari 0');
            return;
        }

        if (!category) {
            showError('Kategori wajib dipilih');
            return;
        }

        // wallet selection removed: backend will handle wallet assignment if needed

        const defaultWalletId = availableWallets?.[0]?.id ?? availableWallets?.[0]?.walletId ?? availableWallets?.[0]?._id ?? null;

        const payload = {
            amount: numericAmount,
            type,
            category,
            date,
            description,
            ...(defaultWalletId ? { wallet_id: defaultWalletId, walletId: defaultWalletId } : {}),
        };

        // Debug: log payload to help trace wallet_id issues
        // Remove this log after debugging
        // eslint-disable-next-line no-console
        console.log('Submitting transaction payload:', payload);

        await onSubmit(payload);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/45 p-3 backdrop-blur-sm md:items-center md:p-4">
            <div className="w-full max-w-lg rounded-[32px] bg-white p-6 shadow-2xl md:p-7">
                <div className="mb-6 flex items-center justify-between">
                    <h3 className="text-xl font-extrabold text-zinc-900 dark:text-[#F0F1F3]">
                        {type === 'income' ? 'Catat Pemasukan' : 'Catat Pengeluaran'}
                    </h3>
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-full p-2 text-zinc-500 transition hover:bg-zinc-100 dark:text-[#8B92A9] dark:hover:bg-[#2D3748]"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <form className="space-y-4" onSubmit={handleSubmit}>
                    <div>
                        <label className="mb-1 block text-sm font-semibold text-zinc-700 dark:text-[#D9DCE3]">Jumlah</label>
                        <input
                            type="number"
                            min="1"
                            step="any"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="finance-input"
                            placeholder="Contoh: 250000"
                            required
                        />
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-semibold text-zinc-700 dark:text-[#D9DCE3]">Kategori</label>
                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="finance-input"
                            required
                        >
                            <option value="">Pilih kategori</option>
                            {categories.map((item) => (
                                <option key={item} value={item}>
                                    {item}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Sumber Dana removed to allow saving transactions without selecting a wallet */}

                    <div>
                        <label className="mb-1 block text-sm font-semibold text-zinc-700 dark:text-[#D9DCE3]">Tanggal</label>
                        <input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="finance-input"
                            required
                        />
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-semibold text-zinc-700 dark:text-[#D9DCE3]">Catatan</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={3}
                            className="finance-input min-h-[100px] py-3"
                            placeholder="Contoh: Gaji bulanan / Belanja kebutuhan rumah"
                        />
                    </div>

                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex h-12 w-full items-center justify-center rounded-[20px] bg-finance-700 font-semibold text-white transition hover:bg-finance-800 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {isSubmitting ? 'Menyimpan...' : 'Simpan Transaksi'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
