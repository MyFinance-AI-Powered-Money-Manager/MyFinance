import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

export const ConfirmDialog = ({
    open,
    title,
    description,
    confirmLabel = 'Hapus',
    cancelLabel = 'Batal',
    pending = false,
    pendingLabel = 'Memproses...',
    onConfirm,
    onCancel,
}) => {
    if (!open) {
        return null;
    }

    const handleBackdropClick = () => {
        if (!pending) {
            onCancel();
        }
    };

    return (
        <div
            className="fixed inset-0 z-[110] flex items-center justify-center bg-black/55 p-4 backdrop-blur-sm"
            onClick={handleBackdropClick}
            role="presentation"
        >
            <div
                className="w-full max-w-md rounded-[28px] border border-white/10 bg-white p-6 shadow-2xl md:p-8 dark:border-[#364152] dark:bg-[#1F2733]"
                onClick={(event) => event.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-labelledby="confirm-dialog-title"
                aria-describedby="confirm-dialog-description"
            >
                <div className="flex items-start justify-between gap-4">
                    <div className="flex min-w-0 items-start gap-3">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400">
                            <AlertTriangle className="h-6 w-6" />
                        </div>
                        <div className="min-w-0">
                            <h3
                                id="confirm-dialog-title"
                                className="text-lg font-extrabold text-zinc-900 dark:text-[#F0F1F3]"
                            >
                                {title}
                            </h3>
                            <p
                                id="confirm-dialog-description"
                                className="mt-1 text-sm leading-6 text-zinc-500 dark:text-[#B0B8CC]"
                            >
                                {description}
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={pending}
                        className="rounded-full p-2 text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-700 disabled:cursor-not-allowed disabled:opacity-40 dark:hover:bg-[#2D3748]"
                        aria-label="Tutup dialog"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="mt-6 flex gap-3">
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={pending}
                        className="flex h-12 flex-1 items-center justify-center rounded-[20px] border border-zinc-200 bg-white font-semibold text-zinc-700 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-[#3F4959] dark:bg-[#2D3748] dark:text-[#B0B8CC] dark:hover:bg-[#3F4959]"
                    >
                        {cancelLabel}
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={pending}
                        className="flex h-12 flex-1 items-center justify-center rounded-[20px] bg-red-600 font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {pending ? pendingLabel : confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
};