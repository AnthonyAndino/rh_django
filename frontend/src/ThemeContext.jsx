/* eslint-disable react-refresh/only-export-components */
// Theme context — manages light/dark mode.
// Persists choice to localStorage('theme') and sets data-theme on <html>.
import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
    const [tema, setTema] = useState(() => {
        return localStorage.getItem('theme') || 'light';
    });

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', tema);
        localStorage.setItem('theme', tema);
    }, [tema]);

    const toggleTema = () => {
        setTema(prev => prev === 'light' ? 'dark' : 'light');
    };

    return (
        <ThemeContext.Provider value={{ tema, toggleTema }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    return useContext(ThemeContext);
}
