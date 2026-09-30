const fs = require('fs');
const path = require('path');

const files = {
  'src/api/client.ts': `export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export interface NameObj {
  id: number;
  name: string;
}

export interface HospitalCapacity {
  total_beds: number;
  available_beds: number;
  icu_total: number;
  icu_available: number;
  emergency_beds: number;
  emergency_available: number;
  ventilators_total: number;
  ventilators_available: number;
  updated_at?: string;
}

export interface Equipment {
  id: number;
  equipment_name: string;
  total_quantity: number;
  available_quantity: number;
  status: string;
}

export interface Hospital {
  id: number;
  name: string;
  hospital_code: string;
  registration_number: string | null;
  description: string | null;
  address: string;
  city: string;
  state: string;
  pincode: string;
  latitude: number | null;
  longitude: number | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  emergency_available: boolean;
  operational_status: string;
  is_active: boolean;
  capacity: HospitalCapacity | null;
  specialties: NameObj[];
  services: NameObj[];
  equipment: Equipment[];
  created_at: string;
  updated_at: string;
  freshness: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  role: string;
  is_active: boolean;
  hospital_id: number | null;
  department: string | null;
  specialization: string | null;
  created_at: string;
}

// Hospitals
export const fetchHospitals = async (params: Record<string, string> = {}): Promise<Hospital[]> => {
  const query = new URLSearchParams(params).toString();
  const url = query ? \\\`\\\${API_BASE_URL}/hospitals?\\\${query}\\\` : \\\`\\\${API_BASE_URL}/hospitals\\\`;
  const response = await fetch(url);
  if (!response.ok) throw new Error('Failed to fetch hospitals');
  return response.json();
};

export const fetchHospital = async (id: number | string): Promise<Hospital> => {
  const response = await fetch(\\\`\\\${API_BASE_URL}/hospitals/\\\${id}\\\`);
  if (!response.ok) throw new Error('Failed to fetch hospital');
  return response.json();
};

export const createHospital = async (data: any): Promise<Hospital> => {
  const response = await fetch(\\\`\\\${API_BASE_URL}/hospitals\\\`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to create hospital');
  return response.json();
};

export const updateHospital = async (id: number, data: any): Promise<Hospital> => {
  const response = await fetch(\\\`\\\${API_BASE_URL}/hospitals/\\\${id}\\\`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to update hospital');
  return response.json();
};

export const deleteHospital = async (id: number): Promise<void> => {
  const response = await fetch(\\\`\\\${API_BASE_URL}/hospitals/\\\${id}\\\`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Failed to delete hospital');
};

// Users
export const fetchUsers = async (): Promise<User[]> => {
  const response = await fetch(\\\`\\\${API_BASE_URL}/users\\\`);
  if (!response.ok) throw new Error('Failed to fetch users');
  return response.json();
};

export const createUser = async (data: any): Promise<User> => {
  const response = await fetch(\\\`\\\${API_BASE_URL}/users\\\`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to create user');
  return response.json();
};

export const deleteUser = async (id: number): Promise<void> => {
  const response = await fetch(\\\`\\\${API_BASE_URL}/users/\\\${id}\\\`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Failed to delete user');
};

// Facilities
export const fetchSpecialties = async (): Promise<NameObj[]> => {
  const response = await fetch(\\\`\\\${API_BASE_URL}/specialties\\\`);
  if (!response.ok) throw new Error('Failed to fetch specialties');
  return response.json();
};

export const fetchServices = async (): Promise<NameObj[]> => {
  const response = await fetch(\\\`\\\${API_BASE_URL}/services\\\`);
  if (!response.ok) throw new Error('Failed to fetch services');
  return response.json();
};
`,

  'src/App.tsx': `import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { Layout } from './components/layout/Layout';
import { Dashboard } from './pages/Dashboard';
import { Hospitals } from './pages/Hospitals';
import { HospitalDetail } from './pages/HospitalDetail';
import { Users } from './pages/Users';
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
            <Route path="users" element={<Users />} />
            <Route path="settings" element={<Settings />} />
            <Route path="*" element={<ComingSoon title="Page Not Found" />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
`,

  'src/components/layout/Sidebar.tsx': `import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, FileText, Building2, Ambulance, Files, Settings, HeartPulse, Users } from 'lucide-react';
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
    { section: 'System', items: [
      { label: 'Users', path: '/users', icon: Users },
      { label: 'Settings', path: '/settings', icon: Settings }
    ] },
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
`
};

for (const [filepath, content] of Object.entries(files)) {
  const fullpath = path.join(__dirname, filepath);
  const dir = path.dirname(fullpath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(fullpath, content, 'utf8');
}
console.log('Frontend setup script 1 completed.');
