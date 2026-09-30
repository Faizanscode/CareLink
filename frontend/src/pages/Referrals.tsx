import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Plus, Activity, Clock, CheckCircle } from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { StatusBadge } from '../components/ui/StatusBadge';
import { getReferrals, type Referral } from '../api/client';

export const Referrals: React.FC = () => {
 const navigate = useNavigate();
 const [searchTerm, setSearchTerm] = useState('');
 const [statusFilter, setStatusFilter] = useState('All');
 const [priorityFilter, setPriorityFilter] = useState('All');
 const [referrals, setReferrals] = useState<Referral[]>([]);
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState<string | null>(null);

 const loadData = async () => {
 setLoading(true);
 try {
 const queryParams: any = {};
 if (statusFilter !== 'All') queryParams.status = statusFilter;
 if (priorityFilter !== 'All') queryParams.priority = priorityFilter;
 // Note: For a real app, search term would be handled by backend query param `q`.
 // For this prototype, we'll do client-side filtering below if needed, or assume backend doesn't support generic q yet.

 const data = await getReferrals(queryParams);
 let filtered = Array.isArray(data) ? data : [];
 
 if (searchTerm) {
 const lowerSearch = searchTerm.toLowerCase();
 filtered = filtered.filter(r => 
 r.referral_code.toLowerCase().includes(lowerSearch) ||
 r.patient_code.toLowerCase().includes(lowerSearch) ||
 r.receiving_hospital.toLowerCase().includes(lowerSearch) ||
 r.specialty.toLowerCase().includes(lowerSearch)
 );
 }
 
 setReferrals(filtered);
 setError(null);
 } catch (err) {
 setError('Failed to fetch referrals.');
 setReferrals([]);
 } finally {
 setLoading(false);
 }
 };

 useEffect(() => {
 loadData();
 }, [statusFilter, priorityFilter, searchTerm]);

 // Statistics
 const pendingReview = referrals.filter(r => r.status === 'SUBMITTED').length;
 const urgent = referrals.filter(r => r.priority === 'URGENT').length;
 const accepted = referrals.filter(r => r.status === 'ACCEPTED').length;

 return (
 <div className="space-y-6">
 <div className="flex justify-between items-center">
 <PageHeader 
 title="Patient Referrals" 
 description="Manage incoming and outgoing patient transfers and referrals."
 />
 <button 
 onClick={() => navigate('/referrals/new')}
 className="flex items-center space-x-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-xl hover:shadow-lg hover:-translate-y-0.5 transition-all font-semibold"
 >
 <Plus size={20} />
 <span>New Referral</span>
 </button>
 </div>

 {/* Summary Cards */}
 <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
 <div className="bg-card p-5 rounded-2xl shadow-sm border border-border flex items-center space-x-4 transition-shadow hover:shadow-md">
 <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
 <Activity size={24} />
 </div>
 <div>
 <p className="text-sm text-muted-foreground font-medium">Total Referrals</p>
 <p className="text-2xl font-bold text-foreground">{referrals.length}</p>
 </div>
 </div>
 
 <div className="bg-card p-5 rounded-2xl shadow-sm border border-border flex items-center space-x-4 transition-shadow hover:shadow-md">
 <div className="p-3 bg-yellow-50 text-yellow-600 rounded-xl">
 <Clock size={24} />
 </div>
 <div>
 <p className="text-sm text-muted-foreground font-medium">Pending Review</p>
 <p className="text-2xl font-bold text-foreground">{pendingReview}</p>
 </div>
 </div>
 
 <div className="bg-card p-5 rounded-2xl shadow-sm border border-border flex items-center space-x-4 transition-shadow hover:shadow-md">
 <div className="p-3 bg-red-50 text-red-600 rounded-xl">
 <Activity size={24} />
 </div>
 <div>
 <p className="text-sm text-muted-foreground font-medium">Urgent</p>
 <p className="text-2xl font-bold text-foreground">{urgent}</p>
 </div>
 </div>
 
 <div className="bg-card p-5 rounded-2xl shadow-sm border border-border flex items-center space-x-4 transition-shadow hover:shadow-md">
 <div className="p-3 bg-green-50 text-green-600 rounded-xl">
 <CheckCircle size={24} />
 </div>
 <div>
 <p className="text-sm text-muted-foreground font-medium">Accepted</p>
 <p className="text-2xl font-bold text-foreground">{accepted}</p>
 </div>
 </div>
 </div>

 {/* Filters */}
 <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
 <div className="relative flex-1">
 <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
 <input
 type="text"
 placeholder="Search by code, patient, hospital, or specialty..."
 value={searchTerm}
 onChange={(e) => setSearchTerm(e.target.value)}
 className="w-full pl-10 pr-4 py-3 border border-border bg-card rounded-2xl shadow-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none"
 />
 </div>
 
 <div className="flex space-x-4">
 <div className="relative">
 <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
 <select
 value={statusFilter}
 onChange={(e) => setStatusFilter(e.target.value)}
 className="pl-10 pr-8 py-3 border border-border rounded-2xl shadow-sm appearance-none bg-card focus:ring-2 focus:ring-primary outline-none"
 >
 <option value="All">All Statuses</option>
 <option value="DRAFT">Draft</option>
 <option value="SUBMITTED">Submitted</option>
 <option value="UNDER_REVIEW">Under Review</option>
 <option value="ACCEPTED">Accepted</option>
 <option value="REJECTED">Rejected</option>
 <option value="COMPLETED">Completed</option>
 <option value="CANCELLED">Cancelled</option>
 </select>
 </div>
 
 <div className="relative">
 <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
 <select
 value={priorityFilter}
 onChange={(e) => setPriorityFilter(e.target.value)}
 className="pl-10 pr-8 py-3 border border-border rounded-2xl shadow-sm appearance-none bg-card focus:ring-2 focus:ring-primary outline-none"
 >
 <option value="All">All Priorities</option>
 <option value="URGENT">Urgent</option>
 <option value="HIGH">High</option>
 <option value="ROUTINE">Routine</option>
 </select>
 </div>
 </div>
 </div>

 {/* Error State */}
 {error && (
 <div className="bg-red-50 text-red-600 p-4 rounded-lg">
 {error}
 </div>
 )}

 {/* List */}
 <div className="bg-card rounded-[32px] shadow-sm border border-border overflow-hidden mt-6">
 {loading ? (
 <div className="p-12 text-center text-muted-foreground">Loading referrals...</div>
 ) : referrals.length === 0 ? (
 <div className="p-12 text-center text-muted-foreground">No referrals found.</div>
 ) : (
 <div className="overflow-x-auto">
 <table className="w-full text-left border-collapse">
 <thead>
 <tr className="bg-muted/30 text-muted-foreground text-[11px] uppercase tracking-widest border-b border-border">
 <th className="px-8 py-5 font-semibold">Referral ID</th>
 <th className="px-8 py-5 font-semibold">Patient</th>
 <th className="px-8 py-5 font-semibold">From / To</th>
 <th className="px-8 py-5 font-semibold">Specialty</th>
 <th className="px-8 py-5 font-semibold">Priority</th>
 <th className="px-8 py-5 font-semibold">Status</th>
 <th className="px-8 py-5 font-semibold">Created</th>
 <th className="px-8 py-5 font-semibold text-right">Actions</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-border">
 {referrals.map((referral) => (
 <tr 
 key={referral.id} 
 className={`hover:bg-muted/50 transition-colors cursor-pointer ${referral.priority === 'URGENT' && referral.status === 'SUBMITTED' ? 'bg-red-50/50 dark:bg-red-900/10' : ''}`}
 onClick={() => navigate(`/referrals/${referral.id}`)}
 >
 <td className="px-8 py-5">
 <span className="font-semibold text-foreground">{referral.referral_code}</span>
 </td>
 <td className="px-8 py-5">
 <span className="text-muted-foreground font-medium">{referral.patient_code}</span>
 </td>
 <td className="px-8 py-5">
 <div className="text-sm font-medium text-foreground"><span className="text-muted-foreground mr-2 text-[10px] uppercase">From</span>{referral.referring_hospital}</div>
 <div className="text-sm font-medium text-foreground mt-1"><span className="text-muted-foreground mr-2 text-[10px] uppercase">To</span>{referral.receiving_hospital}</div>
 </td>
 <td className="px-8 py-5">
 <span className="text-muted-foreground font-medium">{referral.specialty}</span>
 </td>
 <td className="px-8 py-5">
 <span className={`px-3 py-1 text-xs font-bold tracking-wider rounded-md ${
 referral.priority === 'URGENT' ? 'bg-red-100 text-red-700' :
 referral.priority === 'HIGH' ? 'bg-orange-100 text-orange-700' :
 'bg-blue-100 text-blue-700'
 }`}>
 {referral.priority}
 </span>
 </td>
 <td className="px-8 py-5">
 <StatusBadge status={referral.status} />
 </td>
 <td className="px-8 py-5 text-sm text-muted-foreground font-medium">
 {new Date(referral.created_at).toLocaleDateString()}
 </td>
 <td className="px-8 py-5 text-right">
 <button 
 onClick={(e) => {
 e.stopPropagation();
 navigate(`/referrals/${referral.id}`);
 }}
 className="text-primary hover:text-primary/80 font-semibold text-sm px-3 py-1.5 rounded-lg hover:bg-primary/10 transition-colors"
 >
 View
 </button>
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 )}
 </div>
 </div>
 );
};
