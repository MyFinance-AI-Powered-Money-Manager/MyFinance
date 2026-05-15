import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, History, BarChart3, Scan, UserCircle2 } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { resolveMediaUrl } from '../../lib/utils';
import { cn } from '../../lib/utils';

export const Sidebar = () => {
    const { t } = useLanguage();
    const { user } = useAuth();
    const avatarUrl = resolveMediaUrl(user?.profile_picture);
    const initial = user?.full_name?.trim()?.charAt(0)?.toUpperCase() || 'U';

    const navItems = [
        { icon: LayoutDashboard, label: t('home'), path: '/dashboard' },
        { icon: History, label: t('transactions'), path: '/transactions' },
        { icon: Scan, label: t('scan'), path: '/scan' },
        { icon: BarChart3, label: t('reports'), path: '/reports' },
        { icon: UserCircle2, label: t('profile'), path: '/profile' },
    ];

    return (
        <aside className="fixed left-0 top-0 hidden h-full w-[270px] flex-col border-r border-[#E3EAD8] bg-[#EDF4E4]/95 backdrop-blur md:flex dark:border-[#2D3748] dark:bg-[#1A1F2E]/95">
            <div className="p-6">
                <div className="flex items-center gap-2 text-finance-700 dark:text-[#7CF38E]">
                    <img src="/images/logo.png" alt="MyFinance" className="h-7 w-7 rounded-full object-cover shadow-sm" />
                    <span className="text-lg font-extrabold tracking-tight dark:text-[#E8EAED]">MyFinance</span>
                </div>
                <div className="mt-6 rounded-[24px] border border-[#D9E5CF] bg-white/80 p-4 shadow-sm dark:border-[#3F4959] dark:bg-[#1F2733]/80">
                    <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-[#DDF4E2] text-sm font-bold text-finance-700 dark:bg-[#243225] dark:text-[#7CF38E]">
                            {avatarUrl ? (
                                <img src={avatarUrl} alt={user?.full_name || 'Profil'} className="h-full w-full object-cover" onError={(e) => { e.target.style.display = 'none'; }} />
                            ) : (
                                initial
                            )}
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-zinc-900 dark:text-[#F0F1F3]">{user?.full_name || 'User'}</p>
                            <p className="text-xs text-zinc-500 dark:text-[#8B92A9]">{user?.email || 'user@email.com'}</p>
                        </div>
                    </div>
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
                                    ? 'bg-[#DDF4E2] text-finance-700 shadow-sm border border-finance-200 dark:bg-[#2D3748] dark:text-[#7CF38E] dark:border-[#3F4959]'
                                    : 'text-zinc-500 hover:bg-white/70 hover:text-finance-700 dark:text-[#9CA3AF] dark:hover:bg-[#2D3748] dark:hover:text-[#7CF38E]'
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
        { icon: History, label: t('transactions'), path: '/transactions' },
        { icon: Scan, label: t('scan'), path: '/scan' },
        { icon: BarChart3, label: t('reports'), path: '/reports' },
        { icon: UserCircle2, label: t('profile'), path: '/profile' },
    ];

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-[#E2E8D9] bg-white/95 px-4 py-3 backdrop-blur md:hidden dark:border-[#2D3748] dark:bg-[#1A1F2E]/95">
            <div className="mx-auto grid max-w-md grid-cols-5 gap-2">
            {navItems.map((item) => (
                <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                        cn(
                            'flex flex-col items-center justify-center gap-1 rounded-[18px] px-3 py-2 text-[11px] font-medium transition-all',
                            isActive ? 'bg-[#DDF4E2] text-finance-700 dark:bg-[#2D3748] dark:text-[#7CF38E]' : 'text-zinc-500 dark:text-[#9CA3AF]'
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
    return (
        <footer className="mt-12 md:mt-16 border-t border-[#E3EAD8] bg-[#EDF4E4]/70 px-6 py-6 text-xs text-zinc-500 dark:border-[#2D3748] dark:bg-[#1A1F2E]/70 dark:text-[#9CA3AF]">
            <div className="mx-auto flex max-w-7xl flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <p className="md:max-w-[65%] md:text-sm leading-6">© 2026 MyFinance. Perlindungan Terpandu untuk kekayaan Anda.</p>
                <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-finance-500"></div>
                    <span>Layanan Beroperasi Normal.</span>
                </div>
            </div>
        </footer>
    )
}

export const Layout = ({ children }) => {
    return (
        <div className="finance-shell">
            <Sidebar />
            <main className="min-h-screen pb-28 md:ml-[270px] md:pb-0 flex flex-col">
                <div className="flex-1 mx-auto w-full max-w-[1240px] px-4 py-5 md:px-6 lg:px-8 lg:py-6">
                    {children}
                </div>
                <Footer />
            </main>
            <MobileNav />
        </div>
    );
};
