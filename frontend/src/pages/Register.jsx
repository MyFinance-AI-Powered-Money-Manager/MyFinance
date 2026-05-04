import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, User } from 'lucide-react';
import { motion } from 'motion/react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { registerSchema, validateData } from '../lib/validation';
import { showError, showSuccess } from '../lib/toast';

const Register = () => {
    const navigate = useNavigate();
    const { t } = useLanguage();
    const { register, loading, error } = useAuth();
    const [showPassword, setShowPassword] = React.useState(false);
    const [formData, setFormData] = React.useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        agree: false,
    });

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.agree) {
            showError('Anda harus menyetujui syarat dan ketentuan');
            return;
        }

        const { data, error: validationError } = validateData(registerSchema, formData);
        if (validationError) {
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
            showError(authError.response?.data?.message || error || 'Registrasi gagal');
        }
    };

    return (
        <div className="min-h-screen bg-[#F3F8EE] px-4 py-4 md:px-8 md:py-8">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mx-auto flex w-full max-w-7xl overflow-hidden rounded-[36px] bg-[#F7FBF3] shadow-[0_24px_90px_rgba(16,24,40,0.12)] ring-1 ring-white/70 md:min-h-[calc(100vh-4rem)] md:flex-row"
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
                                “Kelola keuanganmu atau ia akan meninggalkanmu!”
                            </h2>
                            <div className="mt-6 flex items-center gap-3">
                                <div className="h-0.5 w-12 bg-[#7AF19E]" />
                                <span className="text-xs font-semibold tracking-[0.24em] text-[#B7F5C7]">ROBERT KIYOSAKI</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex w-full items-center justify-center px-5 py-8 md:w-[48%] md:px-12 md:py-10 lg:px-16">
                    <div className="w-full max-w-[430px]">
                        <div className="mb-8 flex items-center justify-center gap-2 text-finance-700 md:justify-start">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-finance-700 text-[11px] font-bold text-white">MF</div>
                            <span className="text-xl font-extrabold tracking-tight">MyFinance</span>
                        </div>
                        <h1 className="text-3xl font-extrabold leading-tight text-zinc-900 md:text-4xl">{t('register')}</h1>
                        <p className="mt-3 text-[15px] leading-7 text-zinc-600">{t('register_sub')}</p>

                        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-zinc-700">Nama Lengkap</label>
                                <div className="relative group">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 transition-colors group-focus-within:text-finance-700">
                                        <User className="h-4 w-4" />
                                    </span>
                                    <input
                                        type="text"
                                        placeholder="Masukan nama lengkap Anda"
                                        value={formData.name}
                                        onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                                        className="finance-input pl-12"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-zinc-700">Email</label>
                                <div className="relative group">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 transition-colors group-focus-within:text-finance-700">
                                        <Mail className="h-4 w-4" />
                                    </span>
                                    <input
                                        type="email"
                                        placeholder="nama@email.com"
                                        value={formData.email}
                                        onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                                        className="finance-input pl-12"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-zinc-700">Password</label>
                                <div className="relative group">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 transition-colors group-focus-within:text-finance-700">
                                        <Lock className="h-4 w-4" />
                                    </span>
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="••••••••"
                                        value={formData.password}
                                        onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
                                        className="finance-input pl-12 pr-12"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400"
                                    >
                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-zinc-700">Konfirmasi Password</label>
                                <div className="relative group">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 transition-colors group-focus-within:text-finance-700">
                                        <Lock className="h-4 w-4" />
                                    </span>
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="••••••••"
                                        value={formData.confirmPassword}
                                        onChange={(e) => setFormData((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                                        className="finance-input pl-12 pr-12"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400"
                                    >
                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                            </div>

                            <div className="flex items-start gap-3 py-2">
                                <div className="mt-1 flex-shrink-0">
                                    <input
                                        type="checkbox"
                                        checked={formData.agree}
                                        onChange={(e) => setFormData((prev) => ({ ...prev, agree: e.target.checked }))}
                                        className="h-4 w-4 rounded-md accent-finance-700"
                                    />
                                </div>
                                <p className="text-[11px] leading-relaxed text-zinc-500">
                                    Saya setuju dengan <span className="font-bold text-finance-700">Syarat dan Ketentuan</span> serta <span className="font-bold text-finance-700">Kebijakan Privasi</span> MyFinance.
                                </p>
                            </div>

                            <button disabled={loading} className="flex h-14 w-full items-center justify-center rounded-[22px] bg-finance-700 text-[17px] font-bold text-white shadow-soft transition hover:bg-finance-800 disabled:cursor-not-allowed disabled:opacity-60">
                                {loading ? 'Memproses...' : 'Daftar'}
                            </button>

                            <div className="relative py-2">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-zinc-200" />
                                </div>
                                <div className="relative flex justify-center text-[11px] uppercase tracking-[0.24em] text-zinc-400">
                                    <span className="bg-[#F7FBF3] px-4 font-bold">Atau daftar dengan</span>
                                </div>
                            </div>

                            <button type="button" className="flex h-14 w-full items-center justify-center gap-3 rounded-[22px] border border-[#E7EEDF] bg-white text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50">
                                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="h-5 w-5" />
                                Daftar dengan Google
                            </button>
                        </form>

                        <p className="mt-8 text-center text-sm text-zinc-500">
                            Sudah punya akun? <button onClick={() => navigate('/login')} className="font-bold text-finance-700">Masuk</button>
                        </p>

                        <div className="mt-10 hidden justify-between border-t border-[#E7EEDF] pt-6 text-[10px] font-bold uppercase tracking-[0.28em] text-zinc-400 md:flex">
                            <span>Syarat & Ketentuan</span>
                            <span>Kebijakan Privasi</span>
                            <span>© 2026 MyFinance</span>
                        </div>
                        <div className="mt-8 flex items-center justify-center gap-4 text-[10px] font-semibold uppercase tracking-[0.24em] text-zinc-400 md:hidden">
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
