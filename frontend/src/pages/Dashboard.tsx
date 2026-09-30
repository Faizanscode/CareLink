import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getReferrals } from '../api/client';
import { PlusCircle, FileText, Clock, CheckCircle2, ArrowRight, Ambulance, HeartPulse } from 'lucide-react';
const format = (d: Date, _fmt?: string) => d.toLocaleString();

const StatusBadge = ({ status }: { status: string }) => {
 const colors: Record<string, string> = {
 DRAFT: 'bg-muted text-foreground',
 SUBMITTED: 'bg-blue-100 text-blue-700',
 UNDER_REVIEW: 'bg-purple-100 text-purple-700',
 ACCEPTED: 'bg-green-100 text-green-700',
 REJECTED: 'bg-red-100 text-red-700',
 TRANSFER_ASSIGNED: 'bg-yellow-100 text-yellow-700',
 PATIENT_DEPARTED: 'bg-orange-100 text-orange-700',
 IN_TRANSIT: 'bg-amber-100 text-amber-700',
 ARRIVED: 'bg-teal-100 text-teal-700',
 COMPLETED: 'bg-emerald-100 text-emerald-800',
 CANCELLED: 'bg-gray-200 text-muted-foreground'
 };
 
 return (
 <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${colors[status] || 'bg-muted text-foreground'}`}>
 {status.replace('_', ' ')}
 </span>
 );
};

const PriorityBadge = ({ priority }: { priority: string }) => {
 const colors: Record<string, string> = {
 EMERGENCY: 'bg-red-500 text-white animate-pulse',
 URGENT: 'bg-orange-500 text-white',
 ROUTINE: 'bg-blue-500 text-white',
 };
 
 return (
 <span className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wider ${colors[priority] || 'bg-muted0 text-white'}`}>
 {priority}
 </span>
 );
};

const Dashboard = () => {
 const { user } = useAuth();
 const [referrals, setReferrals] = useState<any[]>([]);
 const [loading, setLoading] = useState(true);

 useEffect(() => {
 const fetchReferrals = async () => {
 try {
 const res = await getReferrals();
 setReferrals(res.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
 } catch (err) {
 console.error("Failed to fetch referrals", err);
 } finally {
 setLoading(false);
 }
 };
 
 fetchReferrals();
 }, []);

 return (
 <div className="min-h-screen bg-secondary">
 

 <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
 <div className="mb-8 p-8 rounded-[32px] dashboard-gradient shadow-xl text-white relative overflow-hidden">
 <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none">
 <HeartPulse size={200} />
 </div>
 <div className="relative z-10">
 <div className="flex justify-between items-start mb-8">
 <div>
 <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
 <p className="text-white/80">Manage referrals, hospitals and patient transfers.</p>
 </div>
 {user?.role === 'SUPER_ADMIN' || user?.role === 'REFERRING_PROVIDER' ? (
 <Link to="/referrals/new" className="bg-primary text-primary-foreground px-5 py-2.5 rounded-xl font-semibold flex items-center shadow-lg hover:shadow-primary/30 transition-all hover:-translate-y-0.5">
 <PlusCircle size={18} className="mr-2" />
 Create Referral
 </Link>
 ) : null}
 </div>

 {/* Summary Cards */}
 <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
 <div className="bg-black/20 backdrop-blur-md p-5 rounded-2xl border border-white/10 hover:bg-black/30 transition-colors">
 <div className="flex items-center text-white/70 mb-3 text-sm font-medium">
 <FileText size={16} className="mr-2" /> Total Referrals
 </div>
 <div className="text-3xl font-bold">{referrals.length}</div>
 </div>
 <div className="bg-black/20 backdrop-blur-md p-5 rounded-2xl border border-white/10 hover:bg-black/30 transition-colors">
 <div className="flex items-center text-white/70 mb-3 text-sm font-medium">
 <Clock size={16} className="mr-2" /> Pending
 </div>
 <div className="text-3xl font-bold">{referrals.filter(r => ['SUBMITTED', 'UNDER_REVIEW'].includes(r.status)).length}</div>
 </div>
 <div className="bg-black/20 backdrop-blur-md p-5 rounded-2xl border border-white/10 hover:bg-black/30 transition-colors">
 <div className="flex items-center text-white/70 mb-3 text-sm font-medium">
 <CheckCircle2 size={16} className="mr-2" /> Accepted
 </div>
 <div className="text-3xl font-bold">{referrals.filter(r => r.status === 'ACCEPTED').length}</div>
 </div>
 <div className="bg-black/20 backdrop-blur-md p-5 rounded-2xl border border-white/10 hover:bg-black/30 transition-colors">
 <div className="flex items-center text-white/70 mb-3 text-sm font-medium">
 <Ambulance size={16} className="mr-2" /> Urgent
 </div>
 <div className="text-3xl font-bold text-red-300">{referrals.filter(r => r.priority === 'URGENT').length}</div>
 </div>
 </div>
 </div>
 </div>

 {/* Referrals List */}
 <div className="bg-card rounded-[32px] shadow-sm border border-border overflow-hidden">
 <div className="px-8 py-6 border-b border-border bg-card">
 <h2 className="text-xl font-semibold text-foreground">Recent Referrals</h2>
 </div>
 
 {loading ? (
 <div className="p-12 text-center text-muted-foreground">Loading referrals...</div>
 ) : referrals.length === 0 ? (
 <div className="p-16 text-center flex flex-col items-center">
 <div className="bg-muted p-6 rounded-full mb-4">
 <FileText className="text-muted-foreground" size={40} />
 </div>
 <h3 className="text-xl font-semibold text-foreground">No referrals found</h3>
 <p className="text-muted-foreground mt-2 max-w-md text-center">
 {user?.role === 'REFERRING_PROVIDER' 
 ? 'Create a new referral to get started coordinating patient care.'
 : 'You do not have any incoming referrals at this time.'}
 </p>
 </div>
 ) : (
 <div className="overflow-x-auto">
 <table className="w-full text-left border-collapse">
 <thead>
 <tr className="bg-muted/30 text-muted-foreground text-[11px] uppercase tracking-widest border-b border-border">
 <th className="px-6 py-3 font-medium">Patient / ID</th>
 <th className="px-6 py-3 font-medium">Route</th>
 <th className="px-6 py-3 font-medium">Diagnosis</th>
 <th className="px-6 py-3 font-medium">Priority</th>
 <th className="px-6 py-3 font-medium">Status</th>
 <th className="px-6 py-3 font-medium">Created</th>
 <th className="px-6 py-3 font-medium"></th>
 </tr>
 </thead>
 <tbody className="divide-y divide-border">
 {referrals.map((ref) => (
 <tr key={ref.id} className="hover:bg-muted/50 transition-colors group">
 <td className="px-8 py-5">
 <div className="font-semibold text-foreground">Patient #{ref.patient_id}</div>
 <div className="text-xs text-muted-foreground mt-1">Ref ID: {ref.id}</div>
 </td>
 <td className="px-8 py-5">
 <div className="text-sm font-medium text-foreground"><span className="text-muted-foreground mr-2 text-xs uppercase">From</span>{ref.referring_hospital}</div>
 <div className="text-sm font-medium text-foreground mt-1"><span className="text-muted-foreground mr-2 text-xs uppercase">To</span>{ref.receiving_hospital}</div>
 </td>
 <td className="px-8 py-5">
 <div className="text-sm font-medium text-foreground line-clamp-1">{ref.diagnosis}</div>
 <div className="text-xs text-muted-foreground mt-1">Requires: {ref.required_specialty}</div>
 </td>
 <td className="px-8 py-5">
 <PriorityBadge priority={ref.priority} />
 </td>
 <td className="px-8 py-5">
 <StatusBadge status={ref.status} />
 </td>
 <td className="px-8 py-5 text-sm text-muted-foreground font-medium">
 {format(new Date(ref.created_at), 'MMM d, h:mm a')}
 </td>
 <td className="px-8 py-5 text-right">
 <Link 
 to={`/referrals/${ref.id}`}
 className="inline-flex items-center text-sm font-semibold text-primary hover:text-primary/80 transition-colors p-2 rounded-xl hover:bg-primary/10 opacity-0 group-hover:opacity-100 focus:opacity-100"
 >
 View Details <ArrowRight size={16} className="ml-1" />
 </Link>
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 )}
 </div>
 </main>
 </div>
 );
};

export default Dashboard;
