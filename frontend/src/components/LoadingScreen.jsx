import { Loader } from 'lucide-react';

export const LoadingScreen = () => {
    return (
        <div className="flex min-h-screen items-center justify-center bg-[#F3F8EE]">
            <div className="rounded-[28px] border border-white/80 bg-white/90 px-8 py-7 text-center shadow-card">
                <Loader className="mx-auto mb-4 h-11 w-11 animate-spin text-finance-700" />
                <p className="text-sm font-semibold text-zinc-600">Loading...</p>
            </div>
        </div>
    );
};
