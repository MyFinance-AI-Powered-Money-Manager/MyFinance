import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Globe, Mail, Phone } from 'lucide-react';

export const PageFooter = () => {
  const navigate = useNavigate();

  return (
    <footer className="bg-white py-20 px-6 lg:px-12 max-w-7xl mx-auto border-t border-zinc-100">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2 mb-6">
            <img src="/images/logo.png" alt="MyFinance" className="h-8 w-8 rounded-lg object-cover" />
            <span className="text-2xl font-bold text-[#008744]">MyFinance</span>
          </div>
          <p className="text-zinc-500 max-w-sm italic mb-8">
            Ruang yang rapi untuk mengelola keuangan dengan cepat, jelas, dan aman.
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
            <li><button type="button" onClick={() => navigate('/learn-more')} className="hover:text-[#008744]">Pelajari Produk</button></li>
            <li><button type="button" onClick={() => navigate('/investment-insights')} className="hover:text-[#008744]">Wawasan Investasi</button></li>
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
      <div className="mt-20 flex flex-col items-center justify-between gap-3 border-t border-zinc-100 pt-8 text-zinc-400 md:flex-row md:text-sm">
        <p className="whitespace-nowrap text-[11px] leading-5 sm:text-xs md:text-sm">© 2026 MyFinance. Pengelolaan keuangan yang cepat dan efisien.</p>
        <div className="hidden items-center gap-2 md:flex">
          <div className="h-2 w-2 rounded-full bg-[#008744]"></div>
          <p className="whitespace-nowrap text-[11px] leading-5 sm:text-xs md:text-sm">Layanan beroperasi normal</p>
        </div>
      </div>
    </footer>
  );
};
