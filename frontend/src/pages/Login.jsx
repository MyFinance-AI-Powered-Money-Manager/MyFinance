import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { motion } from 'motion/react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { loginSchema, validateData } from '../lib/validation';
import { showError } from '../lib/toast';

const Login = () => {
    const navigate = useNavigate();
    const { t } = useLanguage();
    const { login, loading } = useAuth();
    const [showPassword, setShowPassword] = React.useState(false);
    const [formData, setFormData] = React.useState({ email: '', password: '' });
    const [formError, setFormError] = React.useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormError('');

        const { data, error: validationError } = validateData(loginSchema, formData);
        if (validationError) {
            setFormError(validationError);
            showError(validationError);
            return;
        }

        try {
            await login(data.email, data.password);
            navigate('/dashboard');
        } catch (authError) {
            const errorMsg = authError?.response?.data?.message || authError?.message || 'Login gagal';
            setFormError(errorMsg);
            showError(errorMsg);
        }
    };

    return (
        <div className="light-mode-only min-h-screen bg-[#F3F8EE] px-3 py-3 md:px-8 md:py-6">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mx-auto flex w-full max-w-7xl overflow-hidden rounded-[36px] bg-[#F7FBF3] shadow-[0_24px_90px_rgba(16,24,40,0.12)] ring-1 ring-white/70 md:min-h-[calc(100vh-3rem)] md:flex-row"
            >
                <div className="relative hidden md:block md:w-[52%]">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(33,177,75,0.32),_transparent_34%),radial-gradient(circle_at_bottom_right,_rgba(6,95,70,0.42),_transparent_38%),linear-gradient(180deg,_#0c1e13_0%,_#114c2f_100%)]">
                        <img
                            src="https://images.unsplash.com/photo-1544213456-b5de24ef0b27?q=80&w=1600&auto=format&fit=crop"
                            alt="Financial quote background"
                            className="h-full w-full object-cover opacity-55 mix-blend-screen"
                        />
                    </div>
                    <div className="absolute inset-0 flex items-end p-10 lg:p-12">
                        <div className="max-w-md rounded-[28px] bg-black/40 p-8 text-white backdrop-blur-md ring-1 ring-white/10">
                                <h2 className="text-3xl font-extrabold leading-tight lg:text-4xl">
                                “Cek transaksi, baca laporan, lalu lanjutkan hari dengan lebih rapi.”
                            </h2>
                            <div className="mt-6 flex items-center gap-3">
                                <div className="h-0.5 w-12 bg-[#7AF19E]" />
                                <span className="text-xs font-semibold tracking-[0.24em] text-[#B7F5C7]">MYFINANCE</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex w-full items-center justify-center px-3 py-2 md:w-[48%] md:px-6 md:py-4 lg:px-10">
                    <div className="w-full max-w-[350px]">
                        <div className="mb-2 flex items-center justify-center gap-2 text-finance-700 md:justify-start dark:text-[#7CF38E]">
                            <img src="/images/logo.png" alt="MyFinance" className="h-6 w-6 rounded-full object-cover" />
                            <span className="text-base font-extrabold tracking-tight dark:text-[#E8EAED]">MyFinance</span>
                        </div>
                        <h1 className="text-xl font-extrabold leading-snug text-zinc-900 md:text-2xl dark:text-[#F0F1F3]">Masuk ke MyFinance</h1>
                        <p className="mt-1 text-[12px] leading-5 text-zinc-600 dark:text-[#B0B8CC]">
                            Lanjutkan ke dashboard untuk melihat transaksi, laporan, dan insight kamu.
                        </p>

                        {formError ? (
                            <div className="mt-4 flex items-start gap-3 rounded-[18px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                                <p className="leading-6">{formError}</p>
                            </div>
                        ) : null}

                        <form className="mt-4 space-y-2" onSubmit={handleSubmit}>
                        <div className="space-y-0.5">
                            <label className="text-[11px] font-semibold text-zinc-700 dark:text-[#D9DCE3]">{t('email')}</label>
                            <div className="relative group">
                                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400 transition-colors group-focus-within:text-finance-700">
                                    <Mail className="h-3 w-3" />
                                </span>
                                <input
                                    type="email"
                                    placeholder="nama@email.com"
                                    value={formData.email}
                                    onChange={(e) => {
                                        setFormError('');
                                        setFormData((prev) => ({ ...prev, email: e.target.value }));
                                    }}
                                    className="finance-input pl-9 text-xs py-1.5"
                                />
                            </div>
                        </div>

                        <div className="space-y-0.5">
                             <div className="flex items-center justify-between">
                                <label className="text-[11px] font-semibold text-zinc-700 dark:text-[#D9DCE3]">{t('password')}</label>
                                <button type="button" className="text-[10px] font-semibold text-finance-700">Lupa kata sandi?</button>
                            </div>
                            <div className="relative group">
                                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400 transition-colors group-focus-within:text-finance-700">
                                    <Lock className="h-3 w-3" />
                                </span>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={(e) => {
                                        setFormError('');
                                        setFormData((prev) => ({ ...prev, password: e.target.value }));
                                    }}
                                    className="finance-input pl-9 pr-9 text-xs py-1.5"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400"
                                >
                                    {showPassword ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                                </button>
                            </div>
                        </div>

                        <button disabled={loading} className="flex h-10 w-full items-center justify-center rounded-[22px] bg-finance-700 text-xs font-bold text-white shadow-soft transition hover:bg-finance-800 disabled:cursor-not-allowed disabled:opacity-60">
                            {loading ? 'Memproses...' : 'Masuk'}
                        </button>

                        </form>

                        <p className="mt-3 text-center text-[10px] text-zinc-500">
                            Belum punya akun? <button onClick={() => navigate('/register')} className="font-bold text-finance-700">Daftar</button>
                        </p>

                        <div className="mt-4 hidden justify-between border-t border-[#E7EEDF] pt-3 text-[7px] font-bold uppercase tracking-[0.15em] text-zinc-400 md:flex">
                            <span>SYARAT & KETENTUAN</span>
                            <span>KEBIJAKAN PRIVASI</span>
                            <span>© 2026 MYFINANCE</span>
                        </div>
                        <div className="mt-3 flex items-center justify-center gap-2 text-[7px] font-semibold uppercase tracking-[0.15em] text-zinc-400 md:hidden">
                            <span>SYARAT</span>
                            <span>PRIVASI</span>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default Login;
