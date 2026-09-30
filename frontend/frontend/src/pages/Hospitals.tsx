import React, { useState, useEffect } from 'react';
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
              onClick={() => navigate(`/hospitals/${hospital.id}`)}
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
