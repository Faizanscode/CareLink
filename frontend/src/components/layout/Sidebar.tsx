import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, FileText, Building2, Ambulance, Files, Settings, HeartPulse, Users, LogOut } from 'lucide-react';
import clsx from 'clsx';
import { useAuth } from '../../contexts/AuthContext';

export const Sidebar: React.FC = () => {
 const { user, logout } = useAuth();
 const navigate = useNavigate();
 const navItems = [
 { section: 'Main', items: [{ label: 'Dashboard', path: '/', icon: LayoutDashboard }] },
 { section: 'Patient Coordination', items: [
 { label: 'Referrals (Sent)', path: '/referrals', icon: FileText },
 { label: 'Inbox (Receiving)', path: '/receiving-referrals', icon: FileText },
 { label: 'Transfers', path: '/transfers', icon: Ambulance }
 ]},
 { section: 'Facilities', items: [{ label: 'Hospitals', path: '/hospitals', icon: Building2 }] },
 { section: 'Records', items: [{ label: 'Documents', path: '/documents', icon: Files }] },
 { section: 'System', items: [
 { label: 'Users', path: '/users', icon: Users },
 { label: 'Settings', path: '/settings', icon: Settings }
 ] },
 ];

 return (
 <aside className="w-64 bg-sidebar-bg text-sidebar-fg flex-shrink-0 hidden lg:flex flex-col h-screen sticky top-0 rounded-r-[32px] overflow-hidden shadow-2xl relative z-20">
 <div className="absolute inset-0 sidebar-gradient opacity-50 pointer-events-none"></div>
 <div className="h-20 flex items-center px-8 relative z-10">
 <div className="bg-primary/20 p-2 rounded-xl mr-3">
 <HeartPulse className="text-primary" size={24} />
 </div>
 <div>
 <h1 className="text-2xl font-bold tracking-tight text-white">CareLink</h1>
 </div>
 </div>
 
 <div className="flex-1 overflow-y-auto py-6 px-4 space-y-8 relative z-10">
 {navItems.map((group, idx) => (
 <div key={idx}>
 <p className="px-4 text-[11px] font-semibold text-white/40 uppercase tracking-widest mb-3">
 {group.section}
 </p>
 <div className="space-y-1">
 {group.items.map((item) => (
 <NavLink
 key={item.path}
 to={item.path}
 className={({ isActive }) => clsx(
 "flex items-center px-4 py-3 text-sm font-medium rounded-2xl transition-all duration-300",
 isActive 
 ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" 
 : "text-white/60 hover:bg-white/5 hover:text-white"
 )}
 >
 <item.icon className={clsx("mr-3 h-5 w-5", ({ isActive }: any) => isActive ? "text-primary-foreground" : "")} />
 {item.label}
 </NavLink>
 ))}
 </div>
 </div>
 ))}
 </div>

 <div className="p-4 relative z-10">
 <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center justify-between">
 <div className="flex items-center space-x-3 overflow-hidden">
 <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold shrink-0">
 {user?.name?.[0] || 'U'}
 </div>
 <div className="truncate">
 <p className="text-sm font-medium text-white truncate">{user?.name}</p>
 <p className="text-xs text-white/50 truncate">{user?.role?.replace('_', ' ')}</p>
 </div>
 </div>
 <button onClick={() => { logout(); navigate('/login'); }} className="text-white/40 hover:text-white transition-colors shrink-0 p-1">
 <LogOut size={18} />
 </button>
 </div>
 </div>
 </aside>
 );
};
