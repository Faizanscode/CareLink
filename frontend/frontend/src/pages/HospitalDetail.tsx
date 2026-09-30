import React, { useState, useEffect } from 'react';
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
