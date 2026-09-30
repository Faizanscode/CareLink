import React, { useState, useRef, useEffect } from 'react';
import { Bell, LogOut, Mail, Shield, Search, ChevronDown } from 'lucide-react';
import { ThemeToggle } from '../ThemeToggle';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const routeNames: Record<string, string> = {
 '/': 'Dashboard',
 '/referrals': 'Referrals',
 '/hospitals': 'Hospitals',
 '/transfers': 'Transfers',
 '/documents': 'Documents',
 '/settings': 'Settings',
};

export const Header: React.FC = () => {
 const location = useLocation();
 const { user, logout } = useAuth();
 const [showProfileMenu, setShowProfileMenu] = useState(false);
 const menuRef = useRef<HTMLDivElement>(null);

 useEffect(() => {
   const handleClickOutside = (event: MouseEvent) => {
     if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
       setShowProfileMenu(false);
     }
   };
   document.addEventListener('mousedown', handleClickOutside);
   return () => document.removeEventListener('mousedown', handleClickOutside);
 }, []);
 
 let title = 'CareLink';
 const path = location.pathname;
 if (routeNames[path]) {
 title = routeNames[path];
 } else if (path.startsWith('/hospitals/')) {
 title = 'Hospital Details';
 }

 return (
 <header className="h-24 bg-background flex items-center justify-between px-8 sticky top-0 z-10">
 <div className="flex items-center flex-1">
 <h2 className="text-lg font-semibold lg:hidden mr-4 text-primary">CareLink</h2>
 <span className="font-medium text-foreground hidden lg:block mr-4">{title}</span>
 <div className="relative w-96 max-w-md hidden md:block">
 <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
 <input type="text" placeholder="Search..." className="w-full pl-12 pr-16 py-3 bg-card border border-border shadow-sm rounded-2xl focus:ring-2 focus:ring-primary outline-none text-sm font-medium" />
 <div className="absolute right-3 top-1/2 -translate-y-1/2 bg-muted px-2 py-1 rounded text-xs font-medium text-muted-foreground flex items-center space-x-1">
 <span>⌘</span><span>Space</span>
 </div>
 </div>
 </div>
 
 <div className="flex items-center space-x-4">
 <div className="flex bg-card p-1 rounded-2xl shadow-sm border border-border">
 <ThemeToggle />
 </div>
 
 <button className="p-3 rounded-2xl bg-card shadow-sm border border-border hover:shadow-md transition-shadow relative text-muted-foreground">
 <Bell size={20} />
 <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-card"></span>
 </button>
 
 <div className="relative" ref={menuRef}>
 <div className="flex items-center space-x-3 bg-card py-2 pl-2 pr-4 rounded-2xl shadow-sm border border-border cursor-pointer hover:shadow-md transition-shadow" onClick={() => setShowProfileMenu(!showProfileMenu)}>
 <div className="w-10 h-10 rounded-full bg-primary/20 text-primary-foreground flex items-center justify-center font-bold">
 {user?.name?.[0] || 'U'}
 </div>
 <div className="hidden sm:block text-left mr-2">
 <p className="text-sm font-semibold text-foreground">{user?.name}</p>
 <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">{user?.role?.replace('_', ' ')}</p>
 </div>
 <ChevronDown size={16} className="text-muted-foreground" />
 </div>
 
 {showProfileMenu && (
 <div className="absolute right-0 mt-3 w-64 bg-card border border-border rounded-2xl shadow-xl py-2 z-50 overflow-hidden">
 <div className="px-4 py-4 border-b border-border bg-muted/30">
 <p className="text-sm font-semibold text-foreground">{user?.name}</p>
 <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
 </div>
       <div className="px-4 py-2">
         <div className="flex items-center space-x-3 text-sm text-foreground py-2">
           <Shield size={16} className="text-muted-foreground" />
           <span className="capitalize">{user?.role?.replace('_', ' ').toLowerCase()}</span>
         </div>
         <div className="flex items-center space-x-3 text-sm text-foreground py-2">
           <Mail size={16} className="text-muted-foreground" />
           <span className="truncate">{user?.email}</span>
         </div>
       </div>
       <div className="border-t border-border mt-2 pt-2">
         <button 
           onClick={() => {
             setShowProfileMenu(false);
             logout();
           }}
           className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center space-x-2 transition-colors"
         >
           <LogOut size={16} />
           <span>Log out</span>
         </button>
       </div>
     </div>
   )}
 </div>
 </div>
 </header>
 );
};
