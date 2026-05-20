import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Home, SearchX, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import { PageHeader } from '../components/PageHeader';

const quickLinks = [
  { label: 'Beranda', href: '/' },
  { label: 'Pelajari Lebih Lanjut', href: '/learn-more' },
  { label: 'Wawasan Investasi', href: '/investment-insights' },
  { label: 'Masuk', href: '/login' },
];

export default function NotFound() {
  return (
    <div className="light-mode-only min-h-screen bg-white font-sans text-zinc-900">
      <div className="absolute inset-x-0 top-0 -z-10 h-[460px] bg-gradient-to-b from-[#F3F8EE] via-[#F9FBF9] to-transparent" />
      <PageHeader />

      <main className="mx-auto flex min-h-[calc(100vh-160px)] max-w-7xl items-center px-4 py-24 sm:px-6 lg:px-8 lg:py-28">
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="grid w-full gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center"
        >
          <div>
            <div className="finance-pill mb-6 bg-white text-finance-700 shadow-card">
              <SearchX className="h-4 w-4" /> Halaman tidak ditemukan
            </div>
            <h1 className="max-w-3xl text-4xl font-extrabold leading-[1.05] tracking-tight text-zinc-900 sm:text-5xl lg:text-7xl">
              Sepertinya alamat ini tidak tersedia.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-zinc-600 sm:text-lg">
              Kami tidak menemukan halaman yang kamu cari. Gunakan navigasi berikut untuk kembali ke alur yang benar dan lanjutkan menjelajahi MyFinance tanpa gangguan.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link to="/" className="inline-flex items-center justify-center gap-2 rounded-full bg-finance-700 px-8 py-4 text-lg font-bold text-white transition hover:bg-[#007038]">
                <Home className="h-5 w-5" /> Kembali ke Beranda
              </Link>
              <Link to="/learn-more" className="inline-flex items-center justify-center gap-2 rounded-full border border-zinc-200 bg-white px-8 py-4 text-lg font-bold text-zinc-600 transition hover:border-finance-700 hover:bg-[#F3FBF5] hover:text-finance-700">
                <ArrowLeft className="h-5 w-5" /> Jelajahi Produk
              </Link>
            </div>

            <div className="mt-10 grid gap-3 sm:grid-cols-2">
              {quickLinks.map((item) => (
                <Link key={item.href} to={item.href} className="finance-card-soft flex items-center justify-between p-4 transition hover:-translate-y-0.5">
                  <span className="text-sm font-semibold text-zinc-700">{item.label}</span>
                  <Sparkles className="h-4 w-4 text-finance-700" />
                </Link>
              ))}
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.55, delay: 0.05 }}
            className="relative"
          >
            <div className="absolute -left-6 top-12 h-28 w-28 rounded-full bg-[#7CF38E]/30 blur-3xl" />
            <div className="absolute -right-8 bottom-8 h-36 w-36 rounded-full bg-[#0D8A3B]/15 blur-3xl" />

            <div className="finance-card overflow-hidden p-6 sm:p-8">
              <div className="rounded-[28px] bg-[#004D2A] p-6 text-white sm:p-8">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/70">404</p>
                <h2 className="mt-4 text-3xl font-extrabold leading-tight">Link mungkin salah, atau halaman sudah dipindahkan.</h2>
                <p className="mt-4 text-sm leading-7 text-white/80">
                  Halaman ini tidak tersedia. Gunakan tautan di bawah untuk kembali ke beranda, membuka penjelasan produk, atau masuk ke akun.
                </p>

                <div className="mt-6 rounded-[24px] bg-white/10 p-4 backdrop-blur-sm">
                  <p className="text-sm font-semibold">Saran cepat</p>
                  <p className="mt-2 text-sm leading-7 text-white/80">
                    Coba kembali ke beranda, buka Learn More, atau masuk ke dashboard setelah login.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.section>
      </main>
    </div>
  );
}