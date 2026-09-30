import React, { useState, useEffect } from 'react';
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
