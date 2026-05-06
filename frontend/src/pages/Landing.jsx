import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Zap, Shield, BarChart3, CheckCircle2, BookOpen } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';
import { PageHeader } from '../components/PageHeader';
import { PageFooter } from '../components/PageFooter';

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
        <div className="light-mode-only min-h-screen bg-white font-sans text-zinc-900">
            <PageHeader />
            {/* Landing Navigation Overlay */}
            <nav className="fixed top-0 z-40 hidden lg:flex items-center gap-8 text-sm font-medium text-zinc-600 w-full justify-center pt-5">
                <button type="button" onClick={() => scrollToSection(featuresRef)} className="hover:text-[#008744]">Fitur</button>
                <button type="button" onClick={() => scrollToSection(testimonialsRef)} className="hover:text-[#008744]">Testimoni</button>
                <button type="button" onClick={() => scrollToSection(faqRef)} className="hover:text-[#008744]">FAQ</button>
            </nav>

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
                        <button onClick={() => navigate('/learn-more')} className="flex items-center justify-center gap-2 rounded-full border border-zinc-200 bg-white px-8 py-4 text-lg font-bold text-zinc-600 hover:border-[#008744] hover:bg-[#F3FBF5] transition-all">
                            <BookOpen className="h-5 w-5" /> Pelajari Lebih Lanjut
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
                        <img src="/images/dashboard-preview.png" alt="Dashboard Preview" className="w-full h-auto" />
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
                        {/* Left: Parsing Struk Neural card */}
                        <div className="rounded-[40px] bg-white p-8 border border-zinc-100 shadow-sm flex flex-col justify-between">
                            <div>
                                <span className="inline-block text-[10px] font-bold text-[#008744] uppercase tracking-wider bg-[#F0FFF4] px-3 py-1 rounded-full">Mesin Utama</span>
                                <h3 className="text-3xl font-bold text-zinc-900 mt-6 mb-4">Parsing Struk Neural</h3>
                                <p className="text-zinc-500 italic mb-6">Cukup ambil foto. AI kami mengidentifikasi item, pajak, dan memprediksi kategori untuk memudahkan pelaporan dan analisis.</p>
                            </div>
                            <div className="flex gap-3 mt-4">
                                <div className="flex-1 rounded-2xl border border-zinc-100 bg-[#F7FFF6] p-4 text-center">
                                    <p className="font-bold text-sm text-[#008744]">Instan</p>
                                    <p className="text-[10px] text-zinc-500 uppercase mt-1">Kecepatan Parsing</p>
                                </div>
                                <div className="flex-1 rounded-2xl border border-zinc-100 bg-[#F7FFF6] p-4 text-center">
                                    <p className="font-bold text-sm text-[#008744]">Otomatis</p>
                                    <p className="text-[10px] text-zinc-500 uppercase mt-1">Kategorisasi</p>
                                </div>
                            </div>
                        </div>

                        {/* Middle: Image */}
                        <div className="rounded-[40px] overflow-hidden shadow-2xl border-8 border-white">
                            <img src="https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?q=80&w=2000&auto=format&fit=crop" className="w-full h-full object-cover" alt="parsing" />
                        </div>

                        {/* Right: Predictive budget card */}
                        <div className="rounded-[40px] bg-[#004D2A] p-10 flex flex-col justify-between text-white">
                            <div>
                                <h3 className="text-2xl font-bold mb-4">Penganggaran Prediktif</h3>
                                <p className="text-green-200/80 italic text-sm leading-relaxed">Kami tidak hanya melacak apa yang Anda belanjakan; kami memprediksi pengeluaran Anda bulan depan berdasarkan tren musiman.</p>
                            </div>
                            <div className="mt-8">
                                <div className="flex items-end gap-2 h-32">
                                    {[40, 70, 45, 90, 60, 80].map((h, i) => (
                                        <div key={i} className="flex-1 bg-green-500 rounded-t-lg" style={{ height: `${h}%` }}></div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Bottom left: Wawasan Investasi */}
                        <div className="rounded-[40px] bg-[#F1F8E9] p-10 flex flex-col justify-between">
                            <div>
                                <div className="h-12 w-12 rounded-xl bg-[#008744] flex items-center justify-center text-white mb-6">
                                    <BarChart3 className="h-6 w-6" />
                                </div>
                                <h3 className="text-2xl font-bold text-zinc-900 mb-4">Wawasan Investasi</h3>
                                <p className="text-zinc-500 italic text-sm leading-relaxed">Kurasi personal dari tren pasar yang secara spesifik memengaruhi aset portofolio Anda.</p>
                            </div>
                            <button onClick={() => navigate('/investment-insights')} className="flex items-center gap-2 text-[#008744] font-bold group mt-6">
                                Jelajahi Wawasan <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>

                        {/* Bottom right: Brankas Data */}
                        <div className="lg:col-span-2 rounded-[40px] bg-[#216148] p-10 flex items-center justify-between overflow-hidden relative">
                            <div className="max-w-md">
                                <h3 className="text-3xl font-bold text-white mb-4">Brankas Data</h3>
                                <p className="text-green-100/80 italic text-sm leading-relaxed">Identitas finansial Anda terkunci dalam brankas terdesentralisasi yang aman. Kami menggunakan zero-knowledge proofs untuk memastikan bahkan kami tidak bisa melihat data Anda tanpa izin.</p>
                            </div>
                            <div className="hidden md:block">
                                <Shield className="h-32 w-32 text-white/10" />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Dipercaya & FAQ */}
            <section className="scroll-mt-28 py-20 px-6 lg:px-12 max-w-7xl mx-auto">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold">Dipercaya oleh Ribuan Pengguna</h2>
                    <p className="text-zinc-500 mt-2">Kisah nyata dari pengguna kami.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
                    <div className="rounded-[20px] p-6 bg-white border border-zinc-100 shadow-sm">
                        <div className="flex items-start gap-4">
                            <div className="h-12 w-12 rounded-full bg-[#E8F9EE] flex items-center justify-center text-[#008744] font-bold">DC</div>
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-sm font-bold">David Chen</span>
                                    <span className="text-xs text-zinc-400">Pengusaha Teknologi</span>
                                </div>
                                <p className="text-zinc-600 italic">"MyFinance mengubah kecemasan saya menjadi kejelasan. Pemindaian struk AI-nya sangat rapi—menghemat 10 jam waktu saya selama musim pajak."</p>
                            </div>
                        </div>
                    </div>
                    <div className="rounded-[20px] p-6 bg-white border border-zinc-100 shadow-sm">
                        <div className="flex items-start gap-4">
                            <div className="h-12 w-12 rounded-full bg-[#E8F9EE] flex items-center justify-center text-[#008744] font-bold">SJ</div>
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-sm font-bold">Sarah Jenkins</span>
                                    <span className="text-xs text-zinc-400">Direktur Kreatif</span>
                                </div>
                                <p className="text-zinc-600 italic">"Antarmuka yang intuitif dan laporan investasinya memudahkan saya memonitor portofolio setiap pagi."</p>
                            </div>
                        </div>
                    </div>
                    <div className="rounded-[20px] p-6 bg-white border border-zinc-100 shadow-sm">
                        <div className="flex items-start gap-4">
                            <div className="h-12 w-12 rounded-full bg-[#E8F9EE] flex items-center justify-center text-[#008744] font-bold">MT</div>
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-sm font-bold">Marcus Thorne</span>
                                    <span className="text-xs text-zinc-400">Analis Keuangan</span>
                                </div>
                                <p className="text-zinc-600 italic">"Fitur prediksi penganggaran membantu klien saya merencanakan kas dengan lebih baik. Hasilnya nyata."</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* FAQ Section */}
                <div ref={faqRef} id="faq" className="max-w-4xl mx-auto">
                    <h3 className="text-2xl font-bold mb-6">Pertanyaan Umum</h3>
                    <div className="space-y-3">
                        <details className="rounded-xl border border-zinc-100 bg-white p-4">
                            <summary className="cursor-pointer font-semibold">Seberapa aman data saya?</summary>
                            <div className="mt-2 text-zinc-600 text-sm">Data Anda sangat aman bersama kami. Kami menggunakan HTTPS untuk mengamankan jalur komunikasi, enkripsi, dan kebijakan privasi yang ketat.</div>
                        </details>
                        <details className="rounded-xl border border-zinc-100 bg-white p-4">
                            <summary className="cursor-pointer font-semibold">Apakah AI ini berfungsi untuk struk tulisan tangan?</summary>
                            <div className="mt-2 text-zinc-600 text-sm">AI kami paling akurat pada struk cetak; dukungan tulisan tangan sedang dalam pengembangan dan akan diperbarui seiring waktu.</div>
                        </details>
                        <details className="rounded-xl border border-zinc-100 bg-white p-4">
                            <summary className="cursor-pointer font-semibold">Bisakah saya mengekspor data untuk akuntan saya?</summary>
                            <div className="mt-2 text-zinc-600 text-sm">Ya — ekspor CSV dan integrasi akuntansi tersedia pada paket tertentu.</div>
                        </details>
                        <details className="rounded-xl border border-zinc-100 bg-white p-4">
                            <summary className="cursor-pointer font-semibold">Apa yang membuat MyFinance berbeda dari yang lain?</summary>
                            <div className="mt-2 text-zinc-600 text-sm">Kombinasi parsing struk neural, privasi tingkat tinggi, dan prediksi penganggaran membuat MyFinance unik.</div>
                        </details>
                    </div>
                </div>
            </section>

            {/* Get Started */}
            <section id="get-started" className="scroll-mt-28 py-24 px-6 lg:px-12 max-w-7xl mx-auto">
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

            <PageFooter />
        </div>
    );
};

export default Landing;
