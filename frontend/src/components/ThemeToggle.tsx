import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

export const ThemeToggle: React.FC = () => {
 const { theme, toggleTheme } = useTheme();

 return (
 <button
 onClick={toggleTheme}
 className="p-2 rounded-full hover:bg-muted :bg-card transition-colors"
 aria-label="Toggle theme"
 >
 {theme === 'light' ? <Moon size={20} className="text-muted-foreground" /> : <Sun size={20} className="text-slate-300" />}
 </button>
 );
};
