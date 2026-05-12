import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, BarChart3, BadgeInfo, CheckCircle2, Compass, LineChart, PieChart, ShieldCheck, Sparkles, TrendingUp } from 'lucide-react';
import { motion } from 'motion/react';
import { PageHeader } from '../components/PageHeader';
import { PageFooter } from '../components/PageFooter';

const insightCards = [
  {
    icon: TrendingUp,
    title: 'Tren portofolio',
    description: 'Wawasan investasi menyajikan pergerakan dan arah perubahan agar pengguna lebih cepat memahami konteks portofolio.',
  },
  {
    icon: PieChart,
    title: 'Komposisi aset',
    description: 'Distribusi aset dapat ditampilkan secara jelas sehingga pengguna tahu porsi risiko dan peluang yang dimiliki.',
  },
  {
    icon: ShieldCheck,
    title: 'Peringatan yang relevan',
    description: 'Sinyal penting ditampilkan secara ringkas supaya fokus tetap pada keputusan yang paling berdampak.',
  },
];

const signals = [
  'Ringkasan performa portofolio mingguan atau bulanan.',
  'Kategorisasi aset berdasarkan profil risiko dan tujuan.',
  'Rekomendasi pembacaan data, bukan sekadar angka mentah.',
];

const InvestmentInsights = () => {
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
          className="grid gap-8 lg:grid-cols-[1.04fr_0.96fr] lg:items-center"
        >
          <div>
            <div className="finance-pill mb-6 bg-white text-finance-700 shadow-card">
              <BarChart3 className="h-4 w-4" /> Insight investasi
            </div>
            <h1 className="max-w-3xl text-4xl font-extrabold leading-[1.05] tracking-tight text-zinc-900 sm:text-5xl lg:text-7xl">
              Wawasan investasi yang membantu membaca portofolio dengan lebih jelas.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-zinc-600 sm:text-lg">
              Halaman ini menjelaskan bagaimana MyFinance mempresentasikan tren, komposisi aset, dan sinyal penting agar pengguna bisa membaca kondisi investasi tanpa harus menebak-nebak dari angka mentah.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button onClick={() => navigate('/register')} className="inline-flex items-center justify-center gap-2 rounded-full bg-finance-700 px-8 py-4 text-lg font-bold text-white transition hover:bg-[#007038] group">
                Mulai Sekarang <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {[
                { value: 'Kontekstual', label: 'Insight berbasis data' },
                { value: 'Terukur', label: 'Sinyal lebih mudah dibaca' },
                { value: 'Aktif', label: 'Mendorong keputusan yang lebih cepat' },
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
            <div className="absolute -left-6 top-10 h-28 w-28 rounded-full bg-[#7CF38E]/30 blur-3xl" />
            <div className="absolute -right-8 bottom-8 h-36 w-36 rounded-full bg-[#0D8A3B]/15 blur-3xl" />

            <div className="finance-card overflow-hidden p-6 sm:p-8">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-zinc-400">Visual ringkasan</p>
                  <h2 className="mt-3 text-2xl font-extrabold text-zinc-900">Ringkasan investasi dibuat singkat, jelas, dan mudah ditindaklanjuti.</h2>
                </div>
                <div className="rounded-full bg-[#EDF8F0] p-3 text-finance-700">
                  <Sparkles className="h-5 w-5" />
                </div>
              </div>

              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                {insightCards.map((card) => (
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
                  <BadgeInfo className="mt-0.5 h-5 w-5 text-[#7CF38E]" />
                  <div>
                    <p className="font-semibold">Fokus utamanya adalah membantu pengguna membaca arah, bukan menebak pasar.</p>
                    <p className="mt-2 text-sm leading-7 text-green-100/80">Pendekatan ini membuat wawasan lebih layak dipakai sebagai referensi awal sebelum mengambil tindakan lanjutan.</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.section>

        <section className="mt-8 grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="finance-card p-6 sm:p-8">
            <div className="flex items-center gap-3 text-finance-700">
              <Compass className="h-5 w-5" />
              <p className="text-xs font-semibold uppercase tracking-[0.24em]">Apa yang ditampilkan</p>
            </div>
            <h2 className="mt-4 text-3xl font-extrabold text-zinc-900">Semua komponen disusun untuk mempercepat pembacaan investasi.</h2>
            <p className="mt-4 text-sm leading-7 text-zinc-500">Pengguna mendapatkan tampilan yang menyorot arah perubahan, komposisi aset, dan rangkuman performa. Dengan begitu, aplikasi tetap sederhana tetapi terasa bernilai untuk perencanaan keuangan jangka panjang.</p>

            <div className="mt-6 space-y-3">
              {signals.map((item) => (
                <div key={item} className="flex items-start gap-3 rounded-[20px] border border-[#E8F1E3] bg-[#FAFCF7] px-4 py-4">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 text-finance-700" />
                  <p className="text-sm leading-7 text-zinc-600">{item}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="finance-card p-6 sm:p-7">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#EDF8F0] text-finance-700">
                <LineChart className="h-5 w-5" />
              </div>
              <h3 className="mt-5 text-xl font-bold text-zinc-900">Analisis pergerakan</h3>
              <p className="mt-3 text-sm leading-7 text-zinc-500">Membantu membaca apakah nilai bergerak stabil, melambat, atau menunjukkan momentum tertentu.</p>
            </div>

            <div className="finance-card p-6 sm:p-7">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#EDF8F0] text-finance-700">
                <PieChart className="h-5 w-5" />
              </div>
              <h3 className="mt-5 text-xl font-bold text-zinc-900">Komposisi portofolio</h3>
              <p className="mt-3 text-sm leading-7 text-zinc-500">Pengguna dapat melihat porsi aset untuk memahami distribusi risiko dengan cepat.</p>
            </div>

            <div className="finance-card p-6 sm:p-7">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#EDF8F0] text-finance-700">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h3 className="mt-5 text-xl font-bold text-zinc-900">Sinyal yang aman dibaca</h3>
              <p className="mt-3 text-sm leading-7 text-zinc-500">Informasi disusun agar pengguna tidak kewalahan oleh data yang terlalu teknis.</p>
            </div>

            <div className="finance-card p-6 sm:p-7">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#EDF8F0] text-finance-700">
                <TrendingUp className="h-5 w-5" />
              </div>
              <h3 className="mt-5 text-xl font-bold text-zinc-900">Arah berikutnya</h3>
              <p className="mt-3 text-sm leading-7 text-zinc-500">Membantu menyiapkan langkah lanjutan, baik untuk evaluasi portofolio maupun tindak lanjut laporan.</p>
            </div>
          </div>
        </section>

        <section className="mt-8 grid gap-4 lg:grid-cols-[1.08fr_0.92fr]">
          <div className="finance-card overflow-hidden p-0">
            <div className="grid gap-0 lg:grid-cols-[0.95fr_1.05fr]">
              <div className="bg-gradient-to-br from-finance-700 via-finance-600 to-finance-500 p-6 text-white sm:p-8">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/70">Cara pakai</p>
                <h3 className="mt-4 text-3xl font-extrabold leading-tight">Gabungkan wawasan ini dengan laporan transaksi.</h3>
                <p className="mt-4 text-sm leading-7 text-white/80">Kombinasi dua halaman ini memberi pengguna konteks yang cukup untuk memahami pengeluaran, tabungan, dan area yang perlu diperbaiki.</p>
                <button onClick={() => navigate('/reports')} className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-finance-700 transition hover:-translate-y-0.5">
                  Buka Laporan <ArrowRight className="h-4 w-4" />
                </button>
              </div>
              <div className="flex flex-col justify-between bg-white p-6 sm:p-8">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-zinc-400">Catatan penting</p>
                  <h3 className="mt-3 text-2xl font-bold text-zinc-900">Insight tetap perlu divalidasi oleh konteks pengguna.</h3>
                  <p className="mt-4 text-sm leading-7 text-zinc-500">Halaman ini dirancang sebagai penjelas produk dan bukan nasihat investasi final. Tujuannya adalah memberi arahan yang lebih jelas sebelum pengguna membuat keputusan.</p>
                </div>
                <div className="mt-8 rounded-[24px] bg-[#FAFCF7] p-5">
                  <div className="flex items-center gap-3 text-finance-700">
                    <Sparkles className="h-5 w-5" />
                    <p className="text-sm font-semibold">Navigasi langsung ke laporan dan pendaftaran</p>
                  </div>
                  <p className="mt-3 text-sm leading-7 text-zinc-500">Dari sini pengguna bisa melanjutkan ke insight, laporan, atau proses registrasi tanpa hambatan.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="finance-card p-6 sm:p-8">
            <div className="flex items-center gap-3 text-finance-700">
              <BarChart3 className="h-5 w-5" />
              <p className="text-xs font-semibold uppercase tracking-[0.24em]">Saran penggunaan</p>
            </div>
            <h3 className="mt-4 text-2xl font-bold text-zinc-900">Gunakan halaman ini sebagai jembatan ke pemahaman produk.</h3>
            <p className="mt-4 text-sm leading-7 text-zinc-500">Wawasan investasi bekerja paling baik ketika dipasangkan dengan penjelasan umum mengenai cara kerja aplikasi. Karena itu, kedua page baru ini saling terhubung dan berperan sebagai alur onboarding yang lebih matang.</p>
            <div className="mt-6 flex">
              <button onClick={() => navigate('/register')} className="inline-flex items-center justify-center gap-2 rounded-full bg-finance-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-finance-600">
                Mulai Sekarang <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </section>
      </main>
      <PageFooter />
    </div>
  );
};

export default InvestmentInsights;