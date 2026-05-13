import React from 'react';
import { Moon, Sun, Globe } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { resolveMediaUrl } from '../../lib/utils';

export const DashboardHeader = ({ onProfileClick, user }) => {
    const { t, language, setLanguage } = useLanguage();
    const { theme, toggleTheme } = useTheme();
    const [avatarLoadFailed, setAvatarLoadFailed] = React.useState(false);
    const avatarUrl = resolveMediaUrl(user?.profile_picture);
    const initial = user?.full_name?.trim()?.charAt(0)?.toUpperCase() || 'U';

    React.useEffect(() => {
        setAvatarLoadFailed(false);
    }, [avatarUrl]);

    return (
        <header className="mb-8 flex items-center justify-between gap-4">
            <div>
                <h1 className="text-xl font-extrabold leading-tight text-finance-700 md:text-3xl lg:text-4xl dark:text-[#7CF38E]">{t('welcome', { name: user?.full_name || 'User' })}</h1>
                <p className="mt-1 text-sm text-zinc-500 dark:text-[#B0B8CC]">{t('sub_welcome')}</p>
            </div>
            <div className="flex items-center gap-3">
                <button
                    onClick={onProfileClick}
                    className="flex h-10 items-center gap-3 rounded-full border border-[#D9E5CF] bg-white px-2 pr-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-finance-300 dark:border-[#3F4959] dark:bg-[#1F2733]"
                    aria-label="Kelola Profil"
                    title="Kelola Profil"
                >
                    <span className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-[#DDF4E2] text-sm font-bold text-finance-700 dark:bg-[#243225] dark:text-[#7CF38E]">
                        {avatarUrl && !avatarLoadFailed ? (
                            <img
                                src={avatarUrl}
                                alt={user?.full_name || 'Profil'}
                                className="h-full w-full object-cover"
                                onError={() => setAvatarLoadFailed(true)}
                            />
                        ) : (
                            initial
                        )}
                    </span>
                    <span className="hidden max-w-[9rem] truncate text-sm font-semibold text-zinc-700 dark:text-[#F0F1F3] sm:block">
                        {user?.full_name || 'Profil'}
                    </span>
                </button>
                <button
                    onClick={toggleTheme}
                    className="finance-icon-btn"
                    aria-label={theme === 'light' ? t('switch_to_dark') : t('switch_to_light')}
                >
                    {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                </button>
                <button
                    onClick={() => setLanguage(language === 'id' ? 'en' : 'id')}
                    className="finance-icon-btn"
                    aria-label={t('change_language')}
                >
                    <Globe className="h-4 w-4" />
                </button>
            </div>
        </header>
    );
};
