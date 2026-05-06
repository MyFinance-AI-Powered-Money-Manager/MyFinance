import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, BookOpen, CheckCircle2, Clock3, Layers3, ScanLine, ShieldCheck, Sparkles, Workflow } from 'lucide-react';
import { motion } from 'motion/react';
import { PageHeader } from '../components/PageHeader';
import { PageFooter } from '../components/PageFooter';

const featureCards = [
    {
        icon: ScanLine,
        title: 'Otomatisasi serba cepat',
        description: 'Unggah struk, baca data, dan simpan transaksi dalam hitungan detik tanpa input manual yang berulang.',
    },
    {
        icon: Workflow,
        title: 'Alur kerja yang rapi',
        description: 'MyFinance memetakan pemasukan, pengeluaran, dan kategori dengan struktur yang mudah dibaca saat dibutuhkan.',
    },
    {
        icon: ShieldCheck,
        title: 'Privasi yang diprioritaskan',
        description: 'Data keuangan dirancang untuk tetap aman, sehingga pengalaman pengguna tetap nyaman dan profesional.',
    },
];

const steps = [
    {
        title: 'Ambil foto struk',
        description: 'Satu foto saja cukup untuk memulai pencatatan tanpa pengisian form yang panjang.',
    },
    {
        title: 'Sistem mengelompokkan data',
        description: 'AI membantu menandai nominal, kategori, dan ringkasan transaksi secara terstruktur.',
    },
    {
        title: 'Lihat insight yang relevan',
        description: 'Dashboard dan laporan memudahkan kamu membaca pola pengeluaran dari waktu ke waktu.',
    },
];

const LearnMore = () => {
    const navigate = useNavigate();

    return (
        <div className="light-mode-only min-h-screen bg-white font-sans text-zinc-900">
            <div className="absolute inset-x-0 top-0 -z-10 h-[460px] bg-gradient-to-b from-[#F3F8EE] via-[#F9FBF9] to-transparent" />
            <PageHeader />

            <main className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8 lg:py-28">
                <motion.section
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.55 }}
                    className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center"
                >
                    <div>
                        <div className="finance-pill mb-6 bg-white text-finance-700 shadow-card">
                            <BookOpen className="h-4 w-4" /> Panduan produk
                        </div>
                        <h1 className="max-w-3xl text-4xl font-extrabold leading-[1.05] tracking-tight text-zinc-900 sm:text-5xl lg:text-7xl">
                            MyFinance membantu kamu mengelola keuangan dengan lebih terarah.
                        </h1>
                        <p className="mt-6 max-w-2xl text-base leading-8 text-zinc-600 sm:text-lg">
                            Halaman ini menjelaskan bagaimana aplikasi membaca transaksi, menyusun data, dan mengubah aktivitas harian menjadi insight yang mudah dipahami. Fokusnya adalah efisiensi, kejelasan, dan pengalaman yang terasa profesional sejak awal.
                        </p>

                        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                            <button onClick={() => navigate('/register')} className="inline-flex items-center justify-center gap-2 rounded-full bg-finance-700 px-8 py-4 text-lg font-bold text-white transition hover:bg-[#007038] group">
                                Mulai Sekarang <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>

                        <div className="mt-10 grid gap-4 sm:grid-cols-3">
                            {[
                                { value: 'Cepat', label: 'Pencatatan transaksi' },
                                { value: 'Aman', label: 'Standar perlindungan data' },
                                { value: 'Jelas', label: 'Insight yang mudah dibaca' },
                            ].map((item) => (
                                <div key={item.label} className="finance-card-soft p-5">
                                    <p className="text-2xl font-extrabold text-finance-700">{item.value}</p>
                                    <p className="mt-2 text-sm leading-6 text-zinc-500">{item.label}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.96 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.65, delay: 0.1 }}
                        className="relative"
                    >
                        <div className="absolute -left-6 top-12 h-28 w-28 rounded-full bg-[#7CF38E]/30 blur-3xl" />
                        <div className="absolute -right-8 bottom-8 h-36 w-36 rounded-full bg-[#0D8A3B]/15 blur-3xl" />

                        <div className="finance-card relative overflow-hidden p-6 sm:p-8">
                            <div className="flex items-center justify-between gap-4">
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-zinc-400">Ringkasan aplikasi</p>
                                    <h2 className="mt-3 text-2xl font-extrabold text-zinc-900">Didesain untuk pencatatan yang cepat dan rapi.</h2>
                                </div>
                                <div className="rounded-full bg-[#EDF8F0] p-3 text-finance-700">
                                    <Sparkles className="h-5 w-5" />
                                </div>
                            </div>

                            <div className="mt-8 grid gap-4 sm:grid-cols-2">
                                {featureCards.map((card) => (
                                    <div key={card.title} className="rounded-[24px] border border-[#E8F1E3] bg-[#FAFCF7] p-5">
                                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#DDF4E2] text-finance-700">
                                            <card.icon className="h-5 w-5" />
                                        </div>
                                        <h3 className="mt-4 text-lg font-bold text-zinc-900">{card.title}</h3>
                                        <p className="mt-3 text-sm leading-7 text-zinc-500">{card.description}</p>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-6 rounded-[24px] bg-[#004D2A] p-5 text-white">
                                <div className="flex items-start gap-3">
                                    <CheckCircle2 className="mt-0.5 h-5 w-5 text-[#7CF38E]" />
                                    <div>
                                        <p className="font-semibold">Semua alur dibuat untuk meminimalkan friksi.</p>
                                        <p className="mt-2 text-sm leading-7 text-green-100/80">Pengguna dapat berpindah dari input ke insight tanpa navigasi yang membingungkan atau tampilan yang berisik.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </motion.section>

                <section className="mt-8 grid gap-4 lg:grid-cols-3">
                    {steps.map((step, index) => (
                        <motion.article
                            key={step.title}
                            initial={{ opacity: 0, y: 18 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: '-60px' }}
                            transition={{ duration: 0.45, delay: index * 0.08 }}
                            className="finance-card p-6"
                        >
                            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#EDF8F0] text-finance-700">
                                <Clock3 className="h-5 w-5" />
                            </div>
                            <h3 className="mt-5 text-xl font-bold text-zinc-900">{step.title}</h3>
                            <p className="mt-3 text-sm leading-7 text-zinc-500">{step.description}</p>
                        </motion.article>
                    ))}
                </section>

                <section className="mt-8 grid gap-4 lg:grid-cols-[0.92fr_1.08fr]">
                    <div className="finance-card p-6 sm:p-8">
                        <div className="flex items-center gap-3 text-finance-700">
                            <Layers3 className="h-5 w-5" />
                            <p className="text-xs font-semibold uppercase tracking-[0.24em]">Apa yang kamu dapatkan</p>
                        </div>
                        <h2 className="mt-4 text-3xl font-extrabold text-zinc-900">Satu tempat untuk memahami keuangan pribadi.</h2>
                        <p className="mt-4 text-sm leading-7 text-zinc-500">MyFinance menggabungkan pencatatan transaksi, ringkasan pengeluaran, dan tampilan insight dalam satu pengalaman yang konsisten. Hasilnya: keputusan finansial lebih cepat diambil dan lebih mudah dipertanggungjawabkan.</p>

                        <div className="mt-6 space-y-3">
                            {[
                                'Transaksi tercatat tanpa proses berulang.',
                                'Pengeluaran lebih mudah dipantau per kategori.',
                                'Laporan membantu melihat tren dalam periode tertentu.',
                            ].map((item) => (
                                <div key={item} className="flex items-start gap-3 rounded-[20px] border border-[#E8F1E3] bg-[#FAFCF7] px-4 py-4">
                                    <CheckCircle2 className="mt-0.5 h-5 w-5 text-finance-700" />
                                    <p className="text-sm leading-7 text-zinc-600">{item}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="finance-card overflow-hidden p-0">
                        <div className="grid h-full gap-0 lg:grid-cols-[1fr_0.9fr]">
                            <div className="bg-gradient-to-br from-finance-700 via-finance-600 to-finance-500 p-6 text-white sm:p-8">
                                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/70">Prinsip desain</p>
                                <h3 className="mt-4 text-3xl font-extrabold leading-tight">Profesional, tenang, dan fokus ke hasil.</h3>
                                <p className="mt-4 text-sm leading-7 text-white/80">Setiap elemen dibuat supaya pengguna tidak perlu belajar ulang. Informasi tampil ringkas, hierarkinya jelas, dan tindakan utama selalu terlihat.</p>
                                <button onClick={() => navigate('/investment-insights')} className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-finance-700 transition hover:-translate-y-0.5">
                                    Lihat Wawasan Investasi <ArrowRight className="h-4 w-4" />
                                </button>
                            </div>
                            <div className="flex flex-col justify-between bg-white p-6 sm:p-8">
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-zinc-400">Rute berikutnya</p>
                                    <h3 className="mt-3 text-2xl font-bold text-zinc-900">Jelajahi lebih banyak</h3>
                                    <p className="mt-4 text-sm leading-7 text-zinc-500">Setelah memahami cara kerja aplikasi, Anda dapat melanjutkan ke bagian insight investasi atau langsung mulai menggunakan MyFinance.</p>
                                </div>
                                <div className="mt-8 rounded-[24px] bg-[#FAFCF7] p-5">
                                    <div className="flex items-center gap-3 text-finance-700">
                                        <BookOpen className="h-5 w-5" />
                                        <p className="text-sm font-semibold">Siap memulai perjalanan finansial Anda?</p>
                                    </div>
                                    <p className="mt-3 text-sm leading-7 text-zinc-500">Bergabunglah dengan ribuan pengguna yang telah mempercayai MyFinance untuk mengelola keuangan mereka.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
            <PageFooter />
        </div>
    );
};

export default LearnMore;