const fs = require('fs');
const path = require('path');

const files = {
  'frontend/src/api/client.ts': `export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

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
  updated_at: string;
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
  latitude: float | null;
  longitude: float | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  emergency_available: boolean;
  operational_status: string;
  is_active: boolean;
  capacity: HospitalCapacity;
  specialties: NameObj[];
  services: NameObj[];
  equipment: NameObj[];
  created_at: string;
  updated_at: string;
}

export const fetchHospitals = async (): Promise<Hospital[]> => {
  const response = await fetch(\`\${API_BASE_URL}/hospitals\`);
  if (!response.ok) throw new Error('Failed to fetch hospitals');
  return response.json();
};

export const fetchHospital = async (id: number | string): Promise<Hospital> => {
  const response = await fetch(\`\${API_BASE_URL}/hospitals/\${id}\`);
  if (!response.ok) throw new Error('Failed to fetch hospital');
  return response.json();
};
`,

  'frontend/src/pages/Dashboard.tsx': `import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FilePlus, Map, Ambulance, Activity, Building, Clock, CheckCircle, RefreshCcw } from 'lucide-react';
import { StatCard } from '../components/ui/StatCard';
import { StatusBadge } from '../components/ui/StatusBadge';
import { PriorityBadge } from '../components/ui/PriorityBadge';
import { mockReferrals } from '../data/mockReferrals';
import { fetchHospitals, Hospital } from '../api/client';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchHospitals();
        setHospitals(data);
        setError(null);
      } catch (err) {
        setError('Failed to connect to the backend API.');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const stats = {
    totalReferrals: 128,
    pendingReview: 18,
    activeTransfers: 7,
    completed: 103,
    connectedHospitals: hospitals.length,
    availableHospitals: hospitals.filter(h => h.operational_status === 'Available').length,
    limitedCapacityHospitals: hospitals.filter(h => h.operational_status === 'Limited Capacity').length,
    needsUpdateHospitals: hospitals.filter(h => h.operational_status === 'Data Needs Update').length,
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="bg-primary/5 border border-primary/20 rounded-xl p-6">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Good morning, Dr. Faizan</h1>
        <p className="text-slate-600 dark:text-slate-400 mt-2">Monitor patient referrals and hospital coordination from one place.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Referrals" value={stats.totalReferrals} icon={<Activity size={20} />} />
        <StatCard title="Pending Review" value={stats.pendingReview} icon={<Clock size={20} />} />
        <StatCard title="Active Transfers" value={stats.activeTransfers} icon={<Ambulance size={20} />} />
        <StatCard title="Completed" value={stats.completed} icon={<CheckCircle size={20} />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-bold">Recent Referrals (Mock)</h2>
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
            <h2 className="text-xl font-bold">Facility Network (Live API)</h2>
            <div className="bg-card border border-border rounded-xl shadow-sm p-5 space-y-4">
              {loading ? (
                <div className="flex justify-center p-4"><RefreshCcw className="animate-spin text-slate-400" /></div>
              ) : error ? (
                <div className="text-red-500 text-sm p-2 bg-red-50 dark:bg-red-900/20 rounded">{error}</div>
              ) : (
                <>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-medium">Connected Hospitals</span>
                    <span className="font-bold text-lg">{stats.connectedHospitals}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-medium flex items-center"><span className="w-2 h-2 rounded-full bg-green-500 mr-2"></span>Available</span>
                    <span className="font-bold">{stats.availableHospitals}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-medium flex items-center"><span className="w-2 h-2 rounded-full bg-amber-500 mr-2"></span>Limited Capacity</span>
                    <span className="font-bold">{stats.limitedCapacityHospitals}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-medium flex items-center"><span className="w-2 h-2 rounded-full bg-red-500 mr-2"></span>Needs Update</span>
                    <span className="font-bold">{stats.needsUpdateHospitals}</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
`,

  'frontend/src/pages/Hospitals.tsx': `import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, MapPin, RefreshCcw } from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { StatusBadge } from '../components/ui/StatusBadge';
import { fetchHospitals, Hospital } from '../api/client';

export const Hospitals: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchHospitals();
        setHospitals(data);
        setError(null);
      } catch (err) {
        setError('Failed to connect to the backend API.');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const filteredHospitals = hospitals.filter((hospital) => {
    const matchesSearch = hospital.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          hospital.city.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || hospital.operational_status === statusFilter;
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
            placeholder="Search hospitals by name or city..."
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

      {loading ? (
        <div className="flex justify-center items-center py-20 text-slate-500">
          <RefreshCcw className="animate-spin mr-2" /> Loading hospitals...
        </div>
      ) : error ? (
        <div className="text-center py-12 border border-dashed border-red-300 rounded-xl bg-red-50 dark:bg-red-900/10">
          <p className="text-red-500 font-medium">{error}</p>
        </div>
      ) : (
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
                    {hospital.city}, {hospital.state}
                  </p>
                </div>
                <StatusBadge status={hospital.operational_status} />
              </div>
              
              <div className="mt-auto space-y-3">
                <div>
                  <p className="text-xs text-slate-500 uppercase font-semibold">Specialties</p>
                  <p className="text-sm truncate">
                    {hospital.specialties.map(s => s.name).join(', ') || 'N/A'}
                  </p>
                </div>
                <div className="flex justify-between items-center text-xs text-slate-500 border-t border-border pt-3 mt-3">
                  <span className="truncate max-w-[60%]">
                    {hospital.services.map(s => s.name).join(' • ') || 'N/A'}
                  </span>
                  <span className="shrink-0">Updated recently</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {!loading && !error && filteredHospitals.length === 0 && (
        <div className="text-center py-12 border border-dashed border-border rounded-xl bg-card">
          <p className="text-slate-500">No hospitals found matching your criteria.</p>
        </div>
      )}
    </div>
  );
};
`,

  'frontend/src/pages/HospitalDetail.tsx': `import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, AlertCircle, CheckCircle2, Clock, RefreshCcw } from 'lucide-react';
import { StatusBadge } from '../components/ui/StatusBadge';
import { fetchHospital, Hospital } from '../api/client';

export const HospitalDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [hospital, setHospital] = useState<Hospital | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        if (id) {
          const data = await fetchHospital(id);
          setHospital(data);
        }
      } catch (err) {
        setError('Hospital not found or failed to load.');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20 text-slate-500">
        <RefreshCcw className="animate-spin mr-2" /> Loading details...
      </div>
    );
  }

  if (error || !hospital) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold mb-2">Hospital Not Found</h2>
        <p className="text-slate-500 mb-4">{error}</p>
        <button onClick={() => navigate('/hospitals')} className="text-primary hover:underline">Return to Hospitals</button>
      </div>
    );
  }

  const getFreshnessIcon = () => {
    if (hospital.operational_status === 'Available') return <CheckCircle2 size={16} className="text-green-500 mr-2" />;
    if (hospital.operational_status === 'Limited Capacity') return <Clock size={16} className="text-amber-500 mr-2" />;
    return <AlertCircle size={16} className="text-red-500 mr-2" />;
  };

  const updatedDate = new Date(hospital.capacity?.updated_at || hospital.updated_at).toLocaleString();

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
            <p className="text-sm font-mono text-slate-400 mt-1">{hospital.hospital_code}</p>
            <div className="flex items-center mt-2 text-slate-500">
              <MapPin size={18} className="mr-1" />
              <span className="mr-4">{hospital.address}, {hospital.city}, {hospital.state} - {hospital.pincode}</span>
            </div>
          </div>
          <div className="flex flex-col items-end">
            <StatusBadge status={hospital.operational_status} />
            <div className="flex items-center mt-3 text-sm font-medium text-slate-600 dark:text-slate-300">
              {getFreshnessIcon()}
              Updated {updatedDate}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold border-b border-border pb-2 mb-3">Capacity Status</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg border border-border">
                  <p className="text-sm text-slate-500 mb-1">Available Beds (Total)</p>
                  <p className="text-2xl font-bold">{hospital.capacity?.available_beds} <span className="text-sm font-normal text-slate-400">/ {hospital.capacity?.total_beds}</span></p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg border border-border">
                  <p className="text-sm text-slate-500 mb-1">Available ICU</p>
                  <p className="text-2xl font-bold">{hospital.capacity?.icu_available} <span className="text-sm font-normal text-slate-400">/ {hospital.capacity?.icu_total}</span></p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg border border-border col-span-2">
                  <p className="text-sm text-slate-500 mb-1">Emergency Care</p>
                  <p className="text-lg font-semibold flex items-center">
                    {hospital.emergency_available ? 
                      <><span className="w-3 h-3 rounded-full bg-green-500 mr-2"></span> Accepting Patients ({hospital.capacity?.emergency_available} open)</> : 
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
                  {hospital.specialties.length > 0 ? hospital.specialties.map(spec => (
                    <span key={spec.id} className="px-3 py-1 bg-primary/10 text-primary text-sm rounded-full font-medium">{spec.name}</span>
                  )) : <span className="text-sm text-slate-400">None listed</span>}
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-2">Services</h4>
                <div className="flex flex-wrap gap-2">
                  {hospital.services.length > 0 ? hospital.services.map(srv => (
                    <span key={srv.id} className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm rounded-full">{srv.name}</span>
                  )) : <span className="text-sm text-slate-400">None listed</span>}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
`
};

for (const [filepath, content] of Object.entries(files)) {
  const dir = path.dirname(filepath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(filepath, content, 'utf8');
}
console.log('Frontend API integration completed.');
