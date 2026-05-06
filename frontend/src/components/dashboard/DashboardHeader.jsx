import React from 'react';
import { Moon, Sun, Globe } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';

export const DashboardHeader = () => {
    const { t, language, setLanguage } = useLanguage();
    const { theme, toggleTheme } = useTheme();

    return (
        <header className="mb-8 flex items-center justify-between gap-4">
            <div>
                <h1 className="text-xl font-extrabold leading-tight text-finance-700 md:text-3xl lg:text-4xl dark:text-[#7CF38E]">{t('welcome')}</h1>
                <p className="mt-1 text-sm text-zinc-500 dark:text-[#B0B8CC]">{t('sub_welcome')}</p>
            </div>
            <div className="flex items-center gap-3">
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
