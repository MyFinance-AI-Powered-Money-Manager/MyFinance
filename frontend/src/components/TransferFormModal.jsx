import React from 'react';
import { ArrowRight, X } from 'lucide-react';
import { useTransferWallet, useWallets } from '../hooks/useFinance';
import { showError } from '../lib/toast';
import { formatCurrency } from '../lib/utils';

export const TransferFormModal = ({ open, onClose }) => {
    const { data: walletsData } = useWallets();
    const transferWallet = useTransferWallet();
    const [sourceId, setSourceId] = React.useState('');
    const [destId, setDestId] = React.useState('');
    const [amount, setAmount] = React.useState('');

    const wallets = React.useMemo(() => {
        const raw = Array.isArray(walletsData) ? walletsData : walletsData?.data ?? [];
        return raw;
    }, [walletsData]);

    React.useEffect(() => {
        if (!open) return;
        setSourceId('');
        setDestId('');
        setAmount('');
    }, [open]);

    if (!open) return null;

    const sourceWallet = wallets.find((w) => String(w.id) === sourceId);

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!sourceId) {
            showError('Pilih Dompet Asal');
            return;
        }
        if (!destId) {
            showError('Pilih Dompet Tujuan');
            return;
        }
        if (sourceId === destId) {
            showError('Dompet Asal dan Tujuan tidak boleh sama');
            return;
        }

        const numericAmount = Number(amount);
        if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
            showError('Jumlah Transfer harus lebih dari 0');
            return;
        }

        try {
            await transferWallet.mutateAsync({
                source_wallet_id: sourceId,
                destination_wallet_id: destId,
                amount: numericAmount,
            });
            onClose();
        } catch {
            // Error already handled by the mutation callback.
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/45 p-3 backdrop-blur-sm md:items-center md:p-4">
            <div className="w-full max-w-lg rounded-[32px] bg-white p-6 shadow-2xl md:p-7">
                <div className="mb-6 flex items-center justify-between">
                    <h3 className="text-xl font-extrabold text-zinc-900">Transfer Antar Dompet</h3>
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-full p-2 text-zinc-500 transition hover:bg-zinc-100"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {wallets.length < 2 ? (
                    <div className="rounded-[22px] bg-[#FFF8E1] p-5 text-center">
                        <p className="text-sm font-semibold text-amber-700">
                            Kamu membutuhkan minimal 2 dompet untuk melakukan transfer.
                        </p>
                    </div>
                ) : (
                    <form className="space-y-4" onSubmit={handleSubmit}>
                        <div>
                            <label className="mb-1 block text-sm font-semibold text-zinc-700">Dari Dompet</label>
                            <select
                                value={sourceId}
                                onChange={(e) => setSourceId(e.target.value)}
                                className="finance-input"
                                required
                            >
                                <option value="">Pilih Dompet Asal</option>
                                {wallets.map((w) => (
                                    <option key={w.id} value={String(w.id)}>
                                        {w.name} ({formatCurrency(w.balance)})
                                    </option>
                                ))}
                            </select>
                        </div>

                        {sourceId && (
                            <div className="flex items-center justify-center py-1">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-finance-700 text-white">
                                    <ArrowRight className="h-5 w-5" />
                                </div>
                            </div>
                        )}

                        <div>
                            <label className="mb-1 block text-sm font-semibold text-zinc-700">Ke Dompet</label>
                            <select
                                value={destId}
                                onChange={(e) => setDestId(e.target.value)}
                                className="finance-input"
                                required
                            >
                                <option value="">Pilih Dompet Tujuan</option>
                                {wallets
                                    .filter((w) => String(w.id) !== sourceId)
                                    .map((w) => (
                                        <option key={w.id} value={String(w.id)}>
                                            {w.name} ({formatCurrency(w.balance)})
                                        </option>
                                    ))}
                            </select>
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-semibold text-zinc-700">Jumlah Transfer (Rp)</label>
                            <input
                                type="number"
                                min="1"
                                step="any"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className="finance-input"
                                placeholder="Contoh: 500000"
                                required
                            />
                            {sourceWallet && (
                                <p className="mt-1 text-xs text-zinc-500">
                                    Saldo tersedia: {formatCurrency(sourceWallet.balance)}
                                </p>
                            )}
                        </div>

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={transferWallet.isPending}
                                className="flex h-12 w-full items-center justify-center rounded-[20px] bg-finance-700 font-semibold text-white transition hover:bg-finance-800 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {transferWallet.isPending ? 'Memproses...' : 'Transfer Sekarang'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};
