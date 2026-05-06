import React from 'react';
import { useNavigate } from 'react-router-dom';

export const PageHeader = () => {
  const navigate = useNavigate();

  return (
    <header className="fixed top-0 z-50 flex h-auto w-full items-center justify-between gap-3 bg-white/80 px-4 py-3 backdrop-blur-md sm:h-20 sm:px-6 lg:px-12">
      <button onClick={() => navigate('/')} className="flex items-center gap-2">
        <img src="/images/logo.png" alt="MyFinance" className="h-8 w-8 rounded-lg object-cover" />
        <span className="text-xl font-bold text-[#008744]">MyFinance</span>
      </button>
      <div className="flex items-center gap-2 sm:gap-4">
        <button onClick={() => navigate('/login')} className="hidden whitespace-nowrap text-sm font-bold text-[#008744] sm:inline-flex">Masuk</button>
        <button onClick={() => navigate('/register')} className="whitespace-nowrap rounded-full bg-[#008744] px-4 py-2 text-[13px] font-bold text-white transition-all hover:bg-[#007038] sm:px-6 sm:py-2.5 sm:text-sm">
          <span className="sm:hidden">Mulai</span>
          <span className="hidden sm:inline">Mulai Sekarang</span>
        </button>
      </div>
    </header>
  );
};
