import React from 'react';
import { X } from 'lucide-react';
import { useCreateWallet } from '../hooks/useFinance';
import { showError } from '../lib/toast';

const walletTypes = [
    { value: 'BANK', label: 'Bank' },
    { value: 'E-WALLET', label: 'E-Wallet' },
    { value: 'CASH', label: 'Cash' },
];

export const WalletFormModal = ({ open, required = false, onClose, onCreated }) => {
    const createWallet = useCreateWallet();
    const [name, setName] = React.useState('');
    const [type, setType] = React.useState('BANK');
    const [balance, setBalance] = React.useState('0');

    React.useEffect(() => {
        if (!open) {
            return;
        }

        setName('');
        setType('BANK');
        setBalance('0');
    }, [open]);

    if (!open) {
        return null;
    }

    const handleSubmit = async (event) => {
        event.preventDefault();

        const numericBalance = Number(balance);
        if (!name.trim()) {
            showError('Nama dompet wajib diisi');
            return;
        }

        if (!Number.isFinite(numericBalance) || numericBalance < 0) {
            showError('Saldo awal tidak valid');
            return;
        }

        await createWallet.mutateAsync({
            name: name.trim(),
            type,
            balance: numericBalance,
        });

        if (onCreated) {
            onCreated();
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/45 p-3 backdrop-blur-sm">
            <div className="w-full max-w-lg rounded-[32px] bg-white p-6 shadow-2xl md:p-7">
                <div className="mb-6 flex items-center justify-between">
                    <h3 className="text-xl font-extrabold text-zinc-900 dark:text-[#F0F1F3]">
                        {required ? 'Buat Dompet Utama' : 'Tambah Dompet Baru'}
                    </h3>
                    {!required ? (
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-full p-2 text-zinc-500 transition hover:bg-zinc-100 dark:text-[#8B92A9] dark:hover:bg-[#2D3748]"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    ) : null}
                </div>

                <form className="space-y-4" onSubmit={handleSubmit}>
                    {required ? (
                        <p className="mb-4 text-sm text-zinc-600 dark:text-[#B0B8CC]">
                            Sebelum mencatat transaksi, kamu perlu membuat dompet terlebih dahulu.
                        </p>
                    ) : null}

                    <div>
                        <label className="mb-1 block text-sm font-semibold text-zinc-700 dark:text-[#D9DCE3]">Nama Dompet</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="finance-input"
                            placeholder="Contoh: BCA Utama"
                            required
                        />
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-semibold text-zinc-700 dark:text-[#D9DCE3]">Tipe Dompet</label>
                        <select value={type} onChange={(e) => setType(e.target.value)} className="finance-input" required>
                            {walletTypes.map((item) => (
                                <option key={item.value} value={item.value}>
                                    {item.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-semibold text-zinc-700 dark:text-[#D9DCE3]">Saldo Awal</label>
                        <input
                            type="number"
                            min="0"
                            step="any"
                            value={balance}
                            onChange={(e) => setBalance(e.target.value)}
                            className="finance-input"
                            placeholder="0"
                        />
                    </div>

                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={createWallet.isPending}
                            className="flex h-12 w-full items-center justify-center rounded-[20px] bg-finance-700 font-semibold text-white transition hover:bg-finance-800 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {createWallet.isPending ? 'Menyimpan...' : 'Buat Dompet'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};