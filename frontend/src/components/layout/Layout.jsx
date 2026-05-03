import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, History, BarChart3, Scan, Mail, Phone, Globe } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { cn } from '../../lib/utils';

export const Sidebar = () => {
    const { t } = useLanguage();

    const navItems = [
        { icon: LayoutDashboard, label: t('home'), path: '/dashboard' },
        { icon: Scan, label: t('scan'), path: '/scan' },
        { icon: History, label: t('transactions'), path: '/transactions' },
        { icon: BarChart3, label: t('reports'), path: '/reports' },
    ];

    return (
        <aside className="fixed left-0 top-0 hidden h-full w-[270px] flex-col border-r border-[#E3EAD8] bg-[#EDF4E4]/95 backdrop-blur md:flex">
            <div className="p-6">
                <div className="flex items-center gap-2 text-finance-700">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-finance-700 text-[10px] font-bold text-white shadow-sm">MF</div>
                    <span className="text-lg font-extrabold tracking-tight">MyFinance</span>
                </div>
            </div>

            <nav className="mt-8 flex-1 space-y-2 px-4">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                            cn(
                                'flex items-center gap-3 rounded-[16px] px-4 py-3.5 text-sm font-semibold transition-all',
                                isActive
                                    ? 'bg-[#DDF4E2] text-finance-700 shadow-sm border border-finance-200'
                                    : 'text-zinc-500 hover:bg-white/70 hover:text-finance-700'
                            )
                        }
                    >
                        <item.icon className="h-4 w-4" />
                        {item.label}
                    </NavLink>
                ))}
            </nav>
        </aside>
    );
};

export const MobileNav = () => {
    const { t } = useLanguage();
    const navItems = [
        { icon: LayoutDashboard, label: t('home'), path: '/dashboard' },
        { icon: Scan, label: t('scan'), path: '/scan' },
        { icon: History, label: t('transactions'), path: '/transactions' },
        { icon: BarChart3, label: t('reports'), path: '/reports' },
    ];

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-[#E2E8D9] bg-white/95 px-4 py-3 backdrop-blur md:hidden">
            <div className="mx-auto grid max-w-md grid-cols-4 gap-2">
            {navItems.map((item) => (
                <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                        cn(
                            'flex flex-col items-center justify-center gap-1 rounded-[18px] px-3 py-2 text-[11px] font-medium transition-all',
                            isActive ? 'bg-[#DDF4E2] text-finance-700' : 'text-zinc-500'
                        )
                    }
                >
                    <item.icon className="h-5 w-5" />
                    <span>{item.label}</span>
                </NavLink>
            ))}
            </div>
        </nav>
    );
};

export const Footer = () => {
    const { t } = useLanguage();
    return (
        <footer className="mt-16 border-t border-[#E3EAD8] bg-[#EDF4E4]/70 px-6 py-12">
            <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 md:grid-cols-4">
                <div className="md:col-span-2">
                    <div className="mb-4 flex items-center gap-2 text-finance-700">
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-finance-700 text-[10px] font-bold text-white">MF</div>
                        <span className="text-xl font-extrabold tracking-tight">MyFinance</span>
                    </div>
                    <p className="max-w-sm text-sm leading-6 text-zinc-500">
                        {t('footer_text')}
                    </p>
                    <div className="mt-6 flex gap-3">
                        <div className="finance-icon-btn h-10 w-10">
                            <Globe className="h-4 w-4" />
                        </div>
                        <div className="finance-icon-btn h-10 w-10">
                            <Mail className="h-4 w-4" />
                        </div>
                        <div className="finance-icon-btn h-10 w-10">
                            <Phone className="h-4 w-4" />
                        </div>
                    </div>
                </div>

                <div>
                    <h4 className="mb-4 text-xs font-bold uppercase tracking-[0.22em] text-zinc-700">PLATFORM</h4>
                    <ul className="space-y-3 text-sm text-zinc-500">
                        <li className="hover:text-[#008744] cursor-pointer">Fitur</li>
                        <li className="hover:text-[#008744] cursor-pointer">Keamanan</li>
                        <li className="hover:text-[#008744] cursor-pointer">Dokumentasi API</li>
                    </ul>
                </div>

                <div>
                    <h4 className="mb-4 text-xs font-bold uppercase tracking-[0.22em] text-zinc-700">LEGAL</h4>
                    <ul className="space-y-3 text-sm text-zinc-500">
                        <li className="hover:text-[#008744] cursor-pointer">Kebijakan Privasi</li>
                        <li className="hover:text-[#008744] cursor-pointer">Syarat Layanan</li>
                        <li className="hover:text-[#008744] cursor-pointer">Keamanan</li>
                        <li className="hover:text-[#008744] cursor-pointer">Kontak</li>
                    </ul>
                </div>
            </div>
            <div className="mx-auto mt-12 flex max-w-7xl flex-col items-center justify-between gap-4 border-t border-[#E3EAD8] pt-8 text-xs text-zinc-400 md:flex-row">
                <p>{t('copyright')}</p>
                <div className="flex items-center gap-2 mt-4 md:mt-0">
                    <div className="h-2 w-2 rounded-full bg-finance-500"></div>
                    <span>{t('service_status')}</span>
                </div>
            </div>
        </footer>
    )
}

export const Layout = ({ children }) => {
    return (
        <div className="finance-shell">
            <Sidebar />
            <main className="min-h-screen pb-28 md:ml-[270px] md:pb-0">
                <div className="mx-auto w-full max-w-[1240px] px-4 py-5 md:px-6 lg:px-8 lg:py-6">
                    {children}
                </div>
                <Footer />
            </main>
            <MobileNav />
        </div>
    );
};
