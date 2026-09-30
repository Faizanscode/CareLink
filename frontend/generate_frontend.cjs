const fs = require('fs');
const path = require('path');

const files = {
  'src/contexts/ThemeContext.tsx': `import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    const savedTheme = localStorage.getItem('theme');
    return (savedTheme as Theme) || 'light';
  });

  useEffect(() => {
    localStorage.setItem('theme', theme);
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));

  return <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
`,

  'src/data/mockReferrals.ts': `export interface Referral {
  id: string;
  patientName: string;
  priority: 'EMERGENCY' | 'URGENT' | 'ROUTINE';
  specialty: string;
  referringFacility: string;
  status: 'Pending' | 'Reviewing' | 'Accepted' | 'In Transit' | 'Completed';
  createdAt: string;
}

export const mockReferrals: Referral[] = [
  { id: 'REF-1024', patientName: 'Rahul Sharma', priority: 'URGENT', specialty: 'Cardiology', referringFacility: 'City General Hospital', status: 'Pending', createdAt: '10 mins ago' },
  { id: 'REF-1023', patientName: 'Aman Verma', priority: 'ROUTINE', specialty: 'Neurology', referringFacility: 'District Hospital', status: 'Accepted', createdAt: '1 hour ago' },
  { id: 'REF-1022', patientName: 'Neha Singh', priority: 'EMERGENCY', specialty: 'Trauma Care', referringFacility: 'Community Health Center', status: 'In Transit', createdAt: '2 hours ago' },
  { id: 'REF-1021', patientName: 'Priya Patel', priority: 'ROUTINE', specialty: 'Orthopedics', referringFacility: 'Northway Clinic', status: 'Completed', createdAt: '1 day ago' },
  { id: 'REF-1020', patientName: 'Vikas Kumar', priority: 'URGENT', specialty: 'Oncology', referringFacility: 'Eastside Medical', status: 'Reviewing', createdAt: '2 days ago' },
];
`,

  'src/data/mockHospitals.ts': `export interface Hospital {
  id: string;
  name: string;
  location: string;
  specialties: string[];
  services: string[];
  status: 'Available' | 'Limited Capacity' | 'Data Needs Update';
  lastUpdated: string;
  emergencyCare: boolean;
  icu: number;
  generalBeds: number;
}

export const mockHospitals: Hospital[] = [
  { id: 'HOSP-1', name: 'City General Hospital', location: 'Raipur', specialties: ['Cardiology', 'Neurology'], services: ['ICU', 'Emergency'], status: 'Available', lastUpdated: '5 min ago', emergencyCare: true, icu: 12, generalBeds: 150 },
  { id: 'HOSP-2', name: 'Metro Health Care', location: 'Bhilai', specialties: ['Trauma Care', 'Orthopedics'], services: ['Surgery', 'Emergency'], status: 'Limited Capacity', lastUpdated: '1 hour ago', emergencyCare: true, icu: 3, generalBeds: 45 },
  { id: 'HOSP-3', name: 'Sanjeevani Hospital', location: 'Bilaspur', specialties: ['Oncology', 'Pediatrics'], services: ['Outpatient', 'ICU'], status: 'Data Needs Update', lastUpdated: '3 days ago', emergencyCare: false, icu: 0, generalBeds: 80 },
  { id: 'HOSP-4', name: 'Apex Super Specialty', location: 'Raipur', specialties: ['Neurology', 'Nephrology'], services: ['Dialysis', 'ICU'], status: 'Available', lastUpdated: '10 min ago', emergencyCare: true, icu: 25, generalBeds: 200 },
];
`,

  'src/data/mockDashboard.ts': `export const mockDashboardStats = {
  totalReferrals: 128,
  pendingReview: 18,
  activeTransfers: 7,
  completed: 103,
  connectedHospitals: 12,
  availableHospitals: 7,
  limitedCapacityHospitals: 3,
  needsUpdateHospitals: 2,
};
`,
  'src/components/ThemeToggle.tsx': `import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

export const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
      aria-label="Toggle theme"
    >
      {theme === 'light' ? <Moon size={20} className="text-slate-600" /> : <Sun size={20} className="text-slate-300" />}
    </button>
  );
};
`,
  'src/components/ui/StatusBadge.tsx': `import React from 'react';

interface Props {
  status: string;
}

export const StatusBadge: React.FC<Props> = ({ status }) => {
  const getColors = () => {
    switch (status) {
      case 'Available':
      case 'Accepted':
      case 'Completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'Limited Capacity':
      case 'Reviewing':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200';
      case 'Pending':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
      case 'Data Needs Update':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'In Transit':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    }
  };

  return (
    <span className={\`px-2.5 py-0.5 rounded-full text-xs font-medium \${getColors()}\`}>
      {status}
    </span>
  );
};
`,
  'src/components/ui/PriorityBadge.tsx': `import React from 'react';

interface Props {
  priority: string;
}

export const PriorityBadge: React.FC<Props> = ({ priority }) => {
  const getColors = () => {
    switch (priority) {
      case 'EMERGENCY':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 border border-red-200 dark:border-red-800';
      case 'URGENT':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200 border border-orange-200 dark:border-orange-800';
      case 'ROUTINE':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 border border-green-200 dark:border-green-800';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700';
    }
  };

  return (
    <span className={\`px-2 py-0.5 rounded text-xs font-bold \${getColors()}\`}>
      {priority}
    </span>
  );
};
`,
  'src/components/ui/StatCard.tsx': `import React from 'react';

interface Props {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
}

export const StatCard: React.FC<Props> = ({ title, value, icon }) => {
  return (
    <div className="bg-card text-card-foreground border border-border p-6 rounded-xl shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</h3>
        {icon && <div className="text-primary">{icon}</div>}
      </div>
      <p className="text-3xl font-semibold mt-2">{value}</p>
    </div>
  );
};
`,
  'src/components/ui/PageHeader.tsx': `import React from 'react';

interface Props {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}

export const PageHeader: React.FC<Props> = ({ title, description, actions }) => {
  return (
    <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold">{title}</h1>
        {description && <p className="text-slate-500 dark:text-slate-400 mt-1">{description}</p>}
      </div>
      {actions && <div>{actions}</div>}
    </div>
  );
};
`,
  'src/components/ui/ComingSoon.tsx': `import React from 'react';
import { Clock } from 'lucide-react';
import { PageHeader } from './PageHeader';

export const ComingSoon: React.FC<{ title: string }> = ({ title }) => {
  return (
    <div className="p-6">
      <PageHeader title={title} />
      <div className="flex flex-col items-center justify-center py-20 bg-card border border-border rounded-xl">
        <Clock size={48} className="text-slate-300 mb-4" />
        <h2 className="text-xl font-semibold mb-2">Coming Soon</h2>
        <p className="text-slate-500 dark:text-slate-400 text-center max-w-md">
          This module will be implemented in a later phase. Stay tuned for updates!
        </p>
      </div>
    </div>
  );
};
`,
  'src/components/layout/Header.tsx': `import React from 'react';
import { Bell, User } from 'lucide-react';
import { ThemeToggle } from '../ThemeToggle';
import { useLocation } from 'react-router-dom';

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
  
  // Try to find the exact route, or get the first part of the path
  let title = 'CareLink';
  const path = location.pathname;
  if (routeNames[path]) {
    title = routeNames[path];
  } else if (path.startsWith('/hospitals/')) {
    title = 'Hospital Details';
  }

  return (
    <header className="h-16 border-b border-border bg-card flex items-center justify-between px-6 sticky top-0 z-10">
      <div className="flex items-center">
        <h2 className="text-lg font-semibold lg:hidden mr-4 text-primary">CareLink</h2>
        <span className="font-medium text-slate-700 dark:text-slate-200">{title}</span>
      </div>
      
      <div className="flex items-center space-x-4">
        <button className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative">
          <Bell size={20} className="text-slate-600 dark:text-slate-300" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>
        
        <ThemeToggle />
        
        <div className="flex items-center space-x-2 pl-4 border-l border-border">
          <div className="hidden sm:block text-right">
            <p className="text-sm font-medium">Dr. Faizan</p>
            <p className="text-xs text-slate-500">Care Coordinator</p>
          </div>
          <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
            <User size={16} />
          </div>
        </div>
      </div>
    </header>
  );
};
`,
  'src/components/layout/Sidebar.tsx': `import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileText, 
  Building2, 
  Ambulance, 
  Files, 
  Settings,
  HeartPulse
} from 'lucide-react';
import clsx from 'clsx';

export const Sidebar: React.FC = () => {
  const navItems = [
    { section: 'Main', items: [{ label: 'Dashboard', path: '/', icon: LayoutDashboard }] },
    { section: 'Patient Coordination', items: [
      { label: 'Referrals', path: '/referrals', icon: FileText },
      { label: 'Transfers', path: '/transfers', icon: Ambulance }
    ]},
    { section: 'Facilities', items: [{ label: 'Hospitals', path: '/hospitals', icon: Building2 }] },
    { section: 'Records', items: [{ label: 'Documents', path: '/documents', icon: Files }] },
    { section: 'System', items: [{ label: 'Settings', path: '/settings', icon: Settings }] },
  ];

  return (
    <aside className="w-64 bg-sidebar-bg text-sidebar-fg flex-shrink-0 hidden lg:flex flex-col border-r border-border h-screen sticky top-0">
      <div className="h-16 flex items-center px-6 border-b border-sidebar-hover/30">
        <HeartPulse className="text-teal-400 mr-2" size={24} />
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white">CareLink</h1>
          <p className="text-[10px] text-teal-200/70 font-medium uppercase tracking-wider">Digital Coordination</p>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto py-6 px-4 space-y-6">
        {navItems.map((group, idx) => (
          <div key={idx}>
            <p className="px-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              {group.section}
            </p>
            <div className="space-y-1">
              {group.items.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) => clsx(
                    "flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors",
                    isActive 
                      ? "bg-sidebar-hover text-white" 
                      : "text-slate-300 hover:bg-sidebar-hover/50 hover:text-white"
                  )}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.label}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
};
`,
  'src/components/layout/Layout.tsx': `import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

export const Layout: React.FC = () => {
  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
`,
  'src/pages/Dashboard.tsx': `import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FilePlus, Map, Ambulance, Activity, Building, Clock, CheckCircle } from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { StatCard } from '../components/ui/StatCard';
import { StatusBadge } from '../components/ui/StatusBadge';
import { PriorityBadge } from '../components/ui/PriorityBadge';
import { mockDashboardStats } from '../data/mockDashboard';
import { mockReferrals } from '../data/mockReferrals';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="bg-primary/5 border border-primary/20 rounded-xl p-6">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Good morning, Dr. Faizan</h1>
        <p className="text-slate-600 dark:text-slate-400 mt-2">Monitor patient referrals and hospital coordination from one place.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Referrals" value={mockDashboardStats.totalReferrals} icon={<Activity size={20} />} />
        <StatCard title="Pending Review" value={mockDashboardStats.pendingReview} icon={<Clock size={20} />} />
        <StatCard title="Active Transfers" value={mockDashboardStats.activeTransfers} icon={<Ambulance size={20} />} />
        <StatCard title="Completed" value={mockDashboardStats.completed} icon={<CheckCircle size={20} />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-bold">Recent Referrals</h2>
          <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-slate-50 dark:bg-slate-900 border-b border-border">
                  <tr>
                    <th className="px-6 py-3 font-medium">Referral ID</th>
                    <th className="px-6 py-3 font-medium">Patient</th>
                    <th className="px-6 py-3 font-medium">Priority</th>
                    <th className="px-6 py-3 font-medium">Specialty</th>
                    <th className="px-6 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {mockReferrals.slice(0, 4).map((ref) => (
                    <tr key={ref.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50">
                      <td className="px-6 py-4 font-medium">{ref.id}</td>
                      <td className="px-6 py-4">{ref.patientName}</td>
                      <td className="px-6 py-4"><PriorityBadge priority={ref.priority} /></td>
                      <td className="px-6 py-4 text-slate-500">{ref.specialty}</td>
                      <td className="px-6 py-4"><StatusBadge status={ref.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="p-4 border-t border-border bg-slate-50 dark:bg-slate-900/50">
              <Link to="/referrals" className="text-sm font-medium text-primary hover:underline">View all referrals &rarr;</Link>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="space-y-4">
            <h2 className="text-xl font-bold">Quick Actions</h2>
            <div className="grid grid-cols-1 gap-3">
              <button onClick={() => navigate('/referrals')} className="flex items-center p-4 bg-primary text-primary-foreground rounded-xl hover:bg-primary-700 transition-colors shadow-sm text-left">
                <FilePlus className="mr-3" size={20} />
                <span className="font-medium">Create Referral</span>
              </button>
              <button onClick={() => navigate('/hospitals')} className="flex items-center p-4 bg-card border border-border hover:bg-slate-50 dark:hover:bg-slate-900 rounded-xl transition-colors shadow-sm text-left">
                <Building className="mr-3 text-primary" size={20} />
                <span className="font-medium">View Hospitals</span>
              </button>
              <button onClick={() => navigate('/transfers')} className="flex items-center p-4 bg-card border border-border hover:bg-slate-50 dark:hover:bg-slate-900 rounded-xl transition-colors shadow-sm text-left">
                <Map className="mr-3 text-primary" size={20} />
                <span className="font-medium">Track Transfers</span>
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-bold">Facility Network</h2>
            <div className="bg-card border border-border rounded-xl shadow-sm p-5 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">Connected Hospitals</span>
                <span className="font-bold text-lg">{mockDashboardStats.connectedHospitals}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium flex items-center"><span className="w-2 h-2 rounded-full bg-green-500 mr-2"></span>Available</span>
                <span className="font-bold">{mockDashboardStats.availableHospitals}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium flex items-center"><span className="w-2 h-2 rounded-full bg-amber-500 mr-2"></span>Limited Capacity</span>
                <span className="font-bold">{mockDashboardStats.limitedCapacityHospitals}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium flex items-center"><span className="w-2 h-2 rounded-full bg-red-500 mr-2"></span>Needs Update</span>
                <span className="font-bold">{mockDashboardStats.needsUpdateHospitals}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
`,
  'src/pages/Hospitals.tsx': `import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, MapPin } from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { StatusBadge } from '../components/ui/StatusBadge';
import { mockHospitals, Hospital } from '../data/mockHospitals';

export const Hospitals: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const filteredHospitals = mockHospitals.filter((hospital) => {
    const matchesSearch = hospital.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          hospital.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || hospital.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <PageHeader 
        title="Hospitals" 
        description="Directory of connected healthcare facilities and current capacity."
      />

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={18} className="text-slate-400" />
          </div>
          <input
            type="text"
            placeholder="Search hospitals by name or location..."
            className="pl-10 pr-4 py-2 w-full bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="relative min-w-[200px]">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Filter size={18} className="text-slate-400" />
          </div>
          <select
            className="pl-10 pr-8 py-2 w-full bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 appearance-none"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">All Statuses</option>
            <option value="Available">Available</option>
            <option value="Limited Capacity">Limited Capacity</option>
            <option value="Data Needs Update">Data Needs Update</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredHospitals.map((hospital) => (
          <div 
            key={hospital.id}
            onClick={() => navigate(\`/hospitals/\${hospital.id}\`)}
            className="bg-card border border-border rounded-xl p-5 hover:border-primary/50 hover:shadow-md transition-all cursor-pointer flex flex-col"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-bold text-lg">{hospital.name}</h3>
                <p className="text-slate-500 text-sm flex items-center mt-1">
                  <MapPin size={14} className="mr-1" />
                  {hospital.location}
                </p>
              </div>
              <StatusBadge status={hospital.status} />
            </div>
            
            <div className="mt-auto space-y-3">
              <div>
                <p className="text-xs text-slate-500 uppercase font-semibold">Specialties</p>
                <p className="text-sm truncate">{hospital.specialties.join(', ')}</p>
              </div>
              <div className="flex justify-between items-center text-xs text-slate-500 border-t border-border pt-3 mt-3">
                <span>{hospital.services.join(' • ')}</span>
                <span>Updated {hospital.lastUpdated}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {filteredHospitals.length === 0 && (
        <div className="text-center py-12 border border-dashed border-border rounded-xl bg-card">
          <p className="text-slate-500">No hospitals found matching your criteria.</p>
        </div>
      )}
    </div>
  );
};
`,
  'src/pages/HospitalDetail.tsx': `import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Phone, AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import { StatusBadge } from '../components/ui/StatusBadge';
import { mockHospitals } from '../data/mockHospitals';

export const HospitalDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const hospital = mockHospitals.find(h => h.id === id);

  if (!hospital) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold mb-2">Hospital Not Found</h2>
        <button onClick={() => navigate('/hospitals')} className="text-primary hover:underline">Return to Hospitals</button>
      </div>
    );
  }

  const getFreshnessIcon = () => {
    if (hospital.status === 'Available') return <CheckCircle2 size={16} className="text-green-500 mr-2" />;
    if (hospital.status === 'Limited Capacity') return <Clock size={16} className="text-amber-500 mr-2" />;
    return <AlertCircle size={16} className="text-red-500 mr-2" />;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <button 
        onClick={() => navigate('/hospitals')}
        className="flex items-center text-sm font-medium text-slate-500 hover:text-primary transition-colors mb-4"
      >
        <ArrowLeft size={16} className="mr-1" /> Back to Directory
      </button>

      <div className="bg-card border border-border rounded-xl p-6 sm:p-8 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 w-2 h-full bg-primary"></div>
        
        <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold">{hospital.name}</h1>
            <div className="flex items-center mt-2 text-slate-500">
              <MapPin size={18} className="mr-1" />
              <span className="mr-4">{hospital.location}</span>
            </div>
          </div>
          <div className="flex flex-col items-end">
            <StatusBadge status={hospital.status} />
            <div className="flex items-center mt-3 text-sm font-medium text-slate-600 dark:text-slate-300">
              {getFreshnessIcon()}
              Updated {hospital.lastUpdated}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold border-b border-border pb-2 mb-3">Capacity Status</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg border border-border">
                  <p className="text-sm text-slate-500 mb-1">ICU Beds</p>
                  <p className="text-2xl font-bold">{hospital.icu}</p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg border border-border">
                  <p className="text-sm text-slate-500 mb-1">General Beds</p>
                  <p className="text-2xl font-bold">{hospital.generalBeds}</p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg border border-border col-span-2">
                  <p className="text-sm text-slate-500 mb-1">Emergency Care</p>
                  <p className="text-lg font-semibold flex items-center">
                    {hospital.emergencyCare ? 
                      <><span className="w-3 h-3 rounded-full bg-green-500 mr-2"></span> Accepting Patients</> : 
                      <><span className="w-3 h-3 rounded-full bg-red-500 mr-2"></span> Diverting</>
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold border-b border-border pb-2 mb-3">Capabilities</h3>
              <div className="mb-4">
                <h4 className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-2">Specialties</h4>
                <div className="flex flex-wrap gap-2">
                  {hospital.specialties.map(spec => (
                    <span key={spec} className="px-3 py-1 bg-primary/10 text-primary text-sm rounded-full font-medium">{spec}</span>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-2">Services</h4>
                <div className="flex flex-wrap gap-2">
                  {hospital.services.map(srv => (
                    <span key={srv} className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm rounded-full">{srv}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
`,
  'src/pages/Settings.tsx': `import React from 'react';
import { PageHeader } from '../components/ui/PageHeader';
import { ThemeToggle } from '../components/ThemeToggle';

export const Settings: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <PageHeader title="Settings" description="Manage your preferences and system settings." />

      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
        <div className="p-6 border-b border-border">
          <h2 className="text-lg font-semibold mb-4">Account Profile</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-500 mb-1">Full Name</label>
              <input type="text" disabled value="Dr. Faizan" className="w-full bg-slate-50 dark:bg-slate-900 border border-border rounded-md px-3 py-2 opacity-70" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-500 mb-1">Role</label>
              <input type="text" disabled value="Care Coordinator" className="w-full bg-slate-50 dark:bg-slate-900 border border-border rounded-md px-3 py-2 opacity-70" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-500 mb-1">Affiliated Hospital</label>
              <input type="text" disabled value="City General Hospital" className="w-full bg-slate-50 dark:bg-slate-900 border border-border rounded-md px-3 py-2 opacity-70" />
            </div>
          </div>
        </div>

        <div className="p-6 border-b border-border">
          <h2 className="text-lg font-semibold mb-4">Appearance</h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Theme Preference</p>
              <p className="text-sm text-slate-500">Toggle between light and dark mode</p>
            </div>
            <ThemeToggle />
          </div>
        </div>

        <div className="p-6">
          <h2 className="text-lg font-semibold mb-4">Notifications</h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">System Notifications</p>
              <p className="text-sm text-slate-500">Receive alerts for new referrals</p>
            </div>
            <div className="relative inline-block w-12 mr-2 align-middle select-none transition duration-200 ease-in">
              <input type="checkbox" name="toggle" id="toggle" defaultChecked className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer" />
              <label htmlFor="toggle" className="toggle-label block overflow-hidden h-6 rounded-full bg-primary cursor-pointer"></label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
`,
  'src/App.tsx': `import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { Layout } from './components/layout/Layout';
import { Dashboard } from './pages/Dashboard';
import { Hospitals } from './pages/Hospitals';
import { HospitalDetail } from './pages/HospitalDetail';
import { Settings } from './pages/Settings';
import { ComingSoon } from './components/ui/ComingSoon';

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="referrals" element={<ComingSoon title="Patient Referrals" />} />
            <Route path="transfers" element={<ComingSoon title="Transfer Tracking" />} />
            <Route path="hospitals" element={<Hospitals />} />
            <Route path="hospitals/:id" element={<HospitalDetail />} />
            <Route path="documents" element={<ComingSoon title="Medical Records" />} />
            <Route path="settings" element={<Settings />} />
            <Route path="*" element={<ComingSoon title="Page Not Found" />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
`
};

for (const [filepath, content] of Object.entries(files)) {
  const dir = path.dirname(filepath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(filepath, content, 'utf8');
}
console.log('Frontend generated successfully.');
