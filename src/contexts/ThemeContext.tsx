import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
    theme: Theme;
    toggleTheme: () => void;
    setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

import { supabase } from '../lib/supabase';

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [theme, setThemeState] = useState<Theme>(() => {
        if (typeof window !== 'undefined' && localStorage.getItem('theme')) {
            return localStorage.getItem('theme') as Theme;
        }
        if (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            return 'dark';
        }
        return 'light';
    });

    const setTheme = (newTheme: Theme) => {
        setThemeState(newTheme);
        localStorage.setItem('theme', newTheme);

        // Sync with Supabase if logged in
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session?.user) {
                supabase.from('designers').update({ theme: newTheme }).eq('user_id', session.user.id).then(({ error }) => {
                    if (error) console.warn('Failed to sync theme to DB:', error.message);
                });
            }
        });
    };

    useEffect(() => {
        const root = window.document.documentElement;
        root.classList.remove('light', 'dark');
        root.classList.add(theme);
        // localStorage is set in setTheme, but for initial load handled by state init.
    }, [theme]);

    // Fetch theme from DB on mount - REMOVED to avoid redundant queries and 400 errors.
    // The theme is now synced via the user profile in App.tsx
    /*
    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session?.user) {
                supabase.from('designers').select('theme').eq('user_id', session.user.id).single().then(({ data }) => {
                    if (data?.theme && (data.theme === 'light' || data.theme === 'dark')) {
                        setThemeState(data.theme as Theme);
                        localStorage.setItem('theme', data.theme);
                    }
                });
            }
        });
    }, []);
    */

    const toggleTheme = () => {
        setTheme(theme === 'light' ? 'dark' : 'light');
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};
