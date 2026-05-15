import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, Eye, EyeOff, Mail, Lock, User } from 'lucide-react';
import { motion } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { registerSchema, validateData } from '../lib/validation';
import { showError, showSuccess } from '../lib/toast';

const Register = () => {
    const navigate = useNavigate();
    const { register, loading } = useAuth();
    const [showPassword, setShowPassword] = React.useState(false);
    const [formError, setFormError] = React.useState('');
    const [formData, setFormData] = React.useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        agree: false,
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormError('');

        if (!formData.agree) {
            const message = 'Anda harus menyetujui syarat dan ketentuan';
            setFormError(message);
            showError(message);
            return;
        }

        const { data, error: validationError } = validateData(registerSchema, formData);
        if (validationError) {
            setFormError(validationError);
            showError(validationError);
            return;
        }

        try {
            await register({
                full_name: data.name,
                email: data.email,
                password: data.password,
                confirm_password: data.confirmPassword,
            });
            showSuccess('Registrasi berhasil! Silakan login.');
            navigate('/login');
        } catch (authError) {
            const message = authError.response?.data?.message || authError.message || 'Registrasi gagal';
            setFormError(message);
            showError(message);
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
                            src="https://images.unsplash.com/photo-1554224155-6726b3ff858f?q=80&w=1600&auto=format&fit=crop"
                            alt="Financial quote background"
                            className="h-full w-full object-cover opacity-55 mix-blend-screen"
                        />
                    </div>
                    <div className="absolute inset-0 flex items-end p-10 lg:p-12">
                        <div className="max-w-md rounded-[28px] bg-black/40 p-8 text-white backdrop-blur-md ring-1 ring-white/10">
                            <h2 className="text-3xl font-extrabold leading-tight lg:text-4xl">
                                “Satu akun untuk scan, catat, dan baca ringkasan keuangan.”
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
                        <div className="mb-3 flex items-center justify-center gap-2 text-finance-700 md:justify-start dark:text-[#7CF38E]">
                            <img src="/images/logo.png" alt="MyFinance" className="h-6 w-6 rounded-full object-cover" />
                            <span className="text-base font-extrabold tracking-tight dark:text-[#E8EAED]">MyFinance</span>
                        </div>
                        <h1 className="text-xl font-extrabold leading-snug text-zinc-900 md:text-2xl dark:text-[#F0F1F3]">Buat akun MyFinance</h1>
                        <p className="mt-1.5 text-[12px] leading-5 text-zinc-600 dark:text-[#B0B8CC]">Daftar untuk mulai mencatat transaksi dan membaca insight dengan lebih cepat.</p>

                        {formError ? (
                            <div className="mt-4 flex items-start gap-3 rounded-[18px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                                <p className="leading-6">{formError}</p>
                            </div>
                        ) : null}

                        <form className="mt-4 space-y-1" onSubmit={handleSubmit}>
                            <div className="space-y-0.5">
                                <label className="text-[11px] font-semibold text-zinc-800 dark:text-[#D9DCE3]">Nama lengkap</label>
                                <div className="relative group">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 transition-colors group-focus-within:text-finance-700">
                                        <User className="h-3.5 w-3.5" />
                                    </span>
                                    <input
                                        type="text"
                                        placeholder="Nama lengkap"
                                        value={formData.name}
                                        onChange={(e) => {
                                            setFormError('');
                                            setFormData((prev) => ({ ...prev, name: e.target.value }));
                                        }}
                                        className="finance-input pl-10 text-xs py-0.5 border-2 border-zinc-200 focus:border-finance-700"
                                    />
                                </div>
                            </div>

                            <div className="space-y-0.5">
                                <label className="text-[11px] font-semibold text-zinc-800">Email</label>
                                <div className="relative group">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 transition-colors group-focus-within:text-finance-700">
                                        <Mail className="h-3.5 w-3.5" />
                                    </span>
                                    <input
                                        type="email"
                                        placeholder="email@example.com"
                                        value={formData.email}
                                        onChange={(e) => {
                                            setFormError('');
                                            setFormData((prev) => ({ ...prev, email: e.target.value }));
                                        }}
                                        className="finance-input pl-10 text-xs py-0.5 border-2 border-zinc-200 focus:border-finance-700"
                                    />
                                </div>
                            </div>

                            <div className="space-y-0.5">
                                <label className="text-[11px] font-semibold text-zinc-800">Password</label>
                                <div className="relative group">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 transition-colors group-focus-within:text-finance-700">
                                        <Lock className="h-3.5 w-3.5" />
                                    </span>
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="••••••"
                                        value={formData.password}
                                        onChange={(e) => {
                                            setFormError('');
                                            setFormData((prev) => ({ ...prev, password: e.target.value }));
                                        }}
                                        className="finance-input pl-10 pr-10 text-xs py-0.5 border-2 border-zinc-200 focus:border-finance-700"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                                    >
                                        {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-0.5">
                                <label className="text-[11px] font-semibold text-zinc-800">Konfirmasi kata sandi</label>
                                <div className="relative group">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 transition-colors group-focus-within:text-finance-700">
                                        <Lock className="h-3.5 w-3.5" />
                                    </span>
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="••••••"
                                        value={formData.confirmPassword}
                                        onChange={(e) => {
                                            setFormError('');
                                            setFormData((prev) => ({ ...prev, confirmPassword: e.target.value }));
                                        }}
                                        className="finance-input pl-10 pr-10 text-xs py-0.5 border-2 border-zinc-200 focus:border-finance-700"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                                    >
                                        {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                                    </button>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 py-1">
                                <div className="flex-shrink-0">
                                    <input
                                        type="checkbox"
                                        checked={formData.agree}
                                        onChange={(e) => setFormData((prev) => ({ ...prev, agree: e.target.checked }))}
                                        className="h-3.5 w-3.5 rounded-md accent-finance-700 cursor-pointer"
                                    />
                                </div>
                                <p className="text-[9px] leading-tight text-zinc-600">
                                    Saya setuju dengan <span className="font-bold text-finance-700">Syarat</span> dan <span className="font-bold text-finance-700">Privasi</span>
                                </p>
                            </div>

                            <button disabled={loading} className="flex h-10 w-full items-center justify-center rounded-[20px] bg-gradient-to-r from-finance-700 to-finance-800 text-xs font-bold text-white shadow-md hover:shadow-lg transition hover:from-finance-800 hover:to-finance-900 disabled:cursor-not-allowed disabled:opacity-60">
                                {loading ? 'Memproses...' : 'Buat akun'}
                            </button>

                        </form>

                        <p className="mt-2 text-center text-[9px] text-zinc-500">
                            Sudah punya akun? <button onClick={() => navigate('/login')} className="font-bold text-finance-700">Masuk</button>
                        </p>

                        <div className="mt-3 hidden justify-between border-t border-[#E7EEDF] pt-2 text-[6px] font-bold uppercase tracking-[0.1em] text-zinc-400 md:flex">
                            <span>Syarat & Ketentuan</span>
                            <span>Privasi</span>
                            <span>© MyFinance</span>
                        </div>
                        <div className="mt-2 flex items-center justify-center gap-1.5 text-[6px] font-semibold uppercase tracking-[0.1em] text-zinc-400 md:hidden">
                            <span>Syarat</span>
                            <span>Privasi</span>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default Register;
