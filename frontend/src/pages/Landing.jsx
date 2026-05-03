import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Zap, Shield, BarChart3, Globe, Mail, Phone, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

const Landing = () => {
    const navigate = useNavigate();
    const featuresRef = React.useRef(null);
    const testimonialsRef = React.useRef(null);
    const faqRef = React.useRef(null);

    const scrollToSection = (ref) => {
        ref?.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    const features = [
        { icon: Shield, title: 'Aman & Terpercaya', desc: 'Data Anda dienkripsi dengan standar keamanan tinggi. Privasi Anda adalah prioritas kami.', color: 'bg-green-50 text-green-600' },
        { icon: Zap, title: 'Cepat & Otomatis', desc: 'AI kami membaca struk dalam hitungan detik. Tidak perlu input manual yang memakan waktu.', color: 'bg-green-50 text-green-600' },
        { icon: BarChart3, title: 'Analisis Mendalam', desc: 'Dapatkan insight tentang pola pengeluaran dan rekomendasi untuk menghemat lebih banyak.', color: 'bg-green-50 text-green-600' },
    ];

    return (
        <div className="min-h-screen bg-white font-sans text-zinc-900">
            {/* Header */}
            <header className="fixed top-0 z-50 flex h-auto w-full items-center justify-between gap-3 bg-white/80 px-4 py-3 backdrop-blur-md sm:h-20 sm:px-6 lg:px-12">
                <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#008744]">
                        <span className="text-sm font-bold text-white">MF</span>
                    </div>
                    <span className="text-xl font-bold text-[#008744]">MyFinance</span>
                </div>
                <nav className="hidden items-center gap-8 text-sm font-medium text-zinc-600 lg:flex">
                    <button type="button" onClick={() => scrollToSection(featuresRef)} className="hover:text-[#008744]">Fitur</button>
                    <button type="button" onClick={() => scrollToSection(testimonialsRef)} className="hover:text-[#008744]">Testimoni</button>
                    <button type="button" onClick={() => scrollToSection(faqRef)} className="hover:text-[#008744]">FAQ</button>
                </nav>
                <div className="flex items-center gap-2 sm:gap-4">
                    <button onClick={() => navigate('/login')} className="hidden whitespace-nowrap text-sm font-bold text-[#008744] sm:inline-flex">Masuk</button>
                    <button onClick={() => navigate('/register')} className="whitespace-nowrap rounded-full bg-[#008744] px-4 py-2 text-[13px] font-bold text-white transition-all hover:bg-[#007038] sm:px-6 sm:py-2.5 sm:text-sm">
                        <span className="sm:hidden">Mulai</span>
                        <span className="hidden sm:inline">Mulai Sekarang</span>
                    </button>
                </div>
            </header>

            {/* Hero Section */}
            <section className="pt-40 lg:pt-52 px-6 lg:px-12 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <div className="inline-flex items-center gap-2 rounded-full bg-green-50 px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[#008744] mb-6">
                        <Zap className="h-3 w-3" /> AI-powered Finance Management
                    </div>
                    <h1 className="text-5xl lg:text-7xl font-bold leading-[1.1] mb-8">
                        Kelola Keuangan Anda dengan <span className="text-[#008744]">Cerdas.</span>
                    </h1>
                    <p className="text-lg text-zinc-500 mb-10 max-w-lg leading-relaxed">
                        MyFinance menggunakan teknologi AI untuk membaca struk belanja Anda secara otomatis. Hemat waktu, pantau pengeluaran, dan capai tujuan finansial dengan mudah.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <button onClick={() => navigate('/register')} className="flex items-center justify-center gap-2 rounded-full bg-[#008744] px-8 py-4 text-lg font-bold text-white hover:bg-[#007038] transition-all group">
                            Mulai Sekarang <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                        </button>
                        <button className="flex items-center justify-center gap-2 rounded-full border border-zinc-200 bg-white px-8 py-4 text-lg font-bold text-zinc-600 hover:bg-zinc-50 transition-all">
                            Pelajari Lebih Lanjut
                        </button>
                    </div>
                </motion.div>
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8 }}
                    className="relative"
                >
                    <div className="relative rounded-[40px] overflow-hidden shadow-2xl border-8 border-white">
                        <img src="public/images/dashboard-preview.png" alt="Dashboard Preview" className="w-full h-auto" />
                        {/* Receipt Overlay (as seen in screenshot) */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 bg-white/95 backdrop-blur-md rounded-2xl p-4 shadow-2xl border border-white/50 animate-bounce-slow">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-[10px] font-bold text-zinc-400">RECEIPT</span>
                                <span className="text-[10px] text-zinc-400">01-02-2024</span>
                            </div>
                            <div className="space-y-1.5 border-b border-zinc-100 pb-3 mb-3">
                                <div className="flex justify-between text-xs font-medium"><span>T-Shirt</span><span>$25.00</span></div>
                                <div className="flex justify-between text-xs font-medium"><span>Watches</span><span>$299.00</span></div>
                            </div>
                            <div className="flex justify-between text-sm font-bold text-[#008744]">
                                <span>TOTAL</span>
                                <span>$324.00</span>
                            </div>
                            <div className="mt-4 flex items-center gap-2 rounded-full bg-[#C8E6C9]/30 px-3 py-2">
                                <CheckCircle2 className="h-4 w-4 text-[#008744]" />
                                <span className="text-[10px] font-bold text-[#008744]">STRUK BERHASIL DICATAT</span>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </section>

            {/* Why MyFinance section */}
            <section ref={featuresRef} id="features" className="scroll-mt-28 py-24 px-6 lg:px-12 max-w-7xl mx-auto mt-24">
                <div className="text-center mb-16">
                    <h2 className="text-4xl font-bold mb-4">Mengapa Memilih <span className="text-[#008744]">MyFinance?</span></h2>
                    <p className="text-zinc-500 max-w-2xl mx-auto italic">Tiga pilar manajemen kekayaan modern.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {features.map((f, i) => (
                        <div key={i} className="p-10 rounded-[40px] bg-white border border-zinc-100 shadow-sm hover:shadow-md transition-all group">
                            <div className={cn("h-14 w-14 rounded-2xl flex items-center justify-center mb-8", f.color)}>
                                <f.icon className="h-7 w-7" />
                            </div>
                            <h3 className="text-xl font-bold mb-4">{f.title}</h3>
                            <p className="text-zinc-500 leading-relaxed italic">{f.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Intelligence Section */}
            <section ref={testimonialsRef} id="testimonials" className="scroll-mt-28 py-24 px-6 lg:px-12 bg-[#F9FBF9]">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold mb-4">Kecerdasan di ujung jari Anda.</h2>
                        <p className="text-zinc-500 max-w-2xl mx-auto">Lebih dari sekadar dompet digital, MyFinance adalah penasihat keuangan AI pribadi Anda.</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 rounded-[40px] overflow-hidden relative h-[450px]">
                            <img src="https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?q=80&w=2000&auto=format&fit=crop" className="w-full h-full object-cover" alt="parsing" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-12 flex flex-col justify-end">
                                <span className="text-[10px] font-bold text-green-400 uppercase tracking-widest mb-2">MESIN UTAMA</span>
                                <h3 className="text-4xl font-bold text-white mb-4">Parsing Struk Neural</h3>
                                <p className="text-zinc-300 max-w-md italic">Cukup ambil foto. AI kami mengidentifikasi item, pajak, dan bahkan memprediksi kategori pajak untuk pelaporan akhir tahun Anda.</p>
                                <div className="flex gap-4 mt-8">
                                    <div className="bg-white/20 backdrop-blur-md rounded-2xl p-4 flex-1 border border-white/10 text-center">
                                        <p className="text-white font-bold text-sm">Instan</p>
                                        <p className="text-white/60 text-[10px] uppercase">KECEPATAN PARSING</p>
                                    </div>
                                    <div className="bg-white/20 backdrop-blur-md rounded-2xl p-4 flex-1 border border-white/10 text-center">
                                        <p className="text-white font-bold text-sm">Otomatis</p>
                                        <p className="text-white/60 text-[10px] uppercase">KATEGORISASI</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-[40px] bg-[#004D2A] p-10 flex flex-col justify-between overflow-hidden relative group">
                            <div>
                                <h3 className="text-2xl font-bold text-white mb-4">Penganggaran Prediktif</h3>
                                <p className="text-green-200/80 italic text-sm leading-relaxed">
                                    Kami tidak hanya melacak apa yang Anda belanjakan; kami memprediksi pengeluaran Anda bulan depan berdasarkan tren musiman.
                                </p>
                            </div>
                            <div className="mt-8">
                                <div className="flex items-end gap-2 h-32">
                                    {[40, 70, 45, 90, 60, 80].map((h, i) => (
                                        <div key={i} className="flex-1 bg-green-500 rounded-t-lg transition-all group-hover:bg-green-400" style={{ height: `${h}%` }}></div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="rounded-[40px] bg-[#F1F8E9] p-10 flex flex-col justify-between overflow-hidden relative md:h-[400px]">
                            <div>
                                <div className="h-12 w-12 rounded-xl bg-[#008744] flex items-center justify-center text-white mb-6">
                                    <BarChart3 className="h-6 w-6" />
                                </div>
                                <h3 className="text-2xl font-bold text-zinc-900 mb-4">Wawasan Investasi</h3>
                                <p className="text-zinc-500 italic text-sm leading-relaxed">
                                    Kurasi personal dari tren pasar yang secara spesifik memengaruhi aset portofolio Anda.
                                </p>
                            </div>
                            <button className="flex items-center gap-2 text-[#008744] font-bold group">
                                Jelajahi Wawasan <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>

                        <div className="lg:col-span-2 rounded-[40px] bg-[#216148] p-10 flex items-center justify-between overflow-hidden relative">
                            <div className="max-w-md">
                                <h3 className="text-3xl font-bold text-white mb-4">Brankas Data</h3>
                                <p className="text-green-100/80 italic text-sm leading-relaxed">
                                    Identitas finansial Anda terkunci dalam brankas terdesentralisasi yang aman. Kami menggunakan zero-knowledge proofs untuk memastikan bahkan kami tidak bisa melihat data Anda tanpa izin.
                                </p>
                            </div>
                            <div className="hidden md:block">
                                <Shield className="h-32 w-32 text-white/10" />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Get Started */}
            <section ref={faqRef} id="faq" className="scroll-mt-28 py-24 px-6 lg:px-12 max-w-7xl mx-auto">
                <div className="rounded-[60px] bg-[#004D2A] p-12 lg:p-24 text-center relative overflow-hidden shadow-2xl">
                    <h2 className="text-4xl lg:text-6xl font-bold text-white mb-8 relative z-10">Mulai Kelola Uang Anda Hari Ini</h2>
                    <p className="text-green-100 text-lg mb-12 max-w-2xl mx-auto relative z-10 italic">Bergabunglah dengan lebih dari 50.000 pengguna yang telah menemukan sanctuary finansial mereka.</p>
                    <button onClick={() => navigate('/register')} className="rounded-full bg-white px-12 py-5 text-xl font-bold text-[#004D2A] hover:bg-green-50 transition-all relative z-10">
                        Ayo Mulai Sekarang!
                    </button>
                    {/* Background decorations */}
                    <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                        <div className="absolute -top-20 -left-20 h-64 w-64 rounded-full border-[40px] border-white"></div>
                        <div className="absolute -bottom-20 -right-20 h-96 w-96 rounded-full border-[60px] border-white"></div>
                    </div>
                </div>
            </section>

            {/* Footer Reuse or similar structure */}
            <footer className="bg-white py-20 px-6 lg:px-12 max-w-7xl mx-auto border-t border-zinc-100">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
                    <div className="md:col-span-2">
                        <div className="flex items-center gap-2 mb-6">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#008744]">
                                <span className="text-sm font-bold text-white">MF</span>
                            </div>
                            <span className="text-2xl font-bold text-[#008744]">MyFinance</span>
                        </div>
                        <p className="text-zinc-500 max-w-sm italic mb-8">
                            Sanctuary Terpandu untuk kekayaan Anda. Kami mendefinisikan ulang manajemen kekayaan melalui estetika editorial dan kecerdasan buatan.
                        </p>
                        <div className="flex gap-6">
                            <Globe className="h-6 w-6 text-zinc-400 hover:text-[#008744] cursor-pointer" />
                            <Mail className="h-6 w-6 text-zinc-400 hover:text-[#008744] cursor-pointer" />
                            <Phone className="h-6 w-6 text-zinc-400 hover:text-[#008744] cursor-pointer" />
                        </div>
                    </div>
                    <div>
                        <h4 className="font-bold mb-6">PLATFORM</h4>
                        <ul className="space-y-4 text-zinc-500">
                            <li className="hover:text-[#008744] cursor-pointer">Fitur</li>
                            <li className="hover:text-[#008744] cursor-pointer">Keamanan</li>
                            <li className="hover:text-[#008744] cursor-pointer">Dokumentasi API</li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold mb-6">LEGAL</h4>
                        <ul className="space-y-4 text-zinc-500">
                            <li className="hover:text-[#008744] cursor-pointer">Kebijakan Privasi</li>
                            <li className="hover:text-[#008744] cursor-pointer">Syarat Layanan</li>
                            <li className="hover:text-[#008744] cursor-pointer">Keamanan</li>
                            <li className="hover:text-[#008744] cursor-pointer">Kontak</li>
                        </ul>
                    </div>
                </div>
                <div className="mt-20 pt-8 border-t border-zinc-100 flex flex-col md:flex-row justify-between items-center text-sm text-zinc-400">
                    <p>© 2024 MyFinance. Perlindungan Terpandu untuk kekayaan Anda.</p>
                    <div className="flex items-center gap-2 mt-4 md:mt-0">
                        <div className="h-2 w-2 rounded-full bg-[#008744]"></div>
                        <span>Layanan Beroperasi Normal</span>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Landing;
