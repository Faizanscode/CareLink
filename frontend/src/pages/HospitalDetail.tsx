import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, AlertCircle, CheckCircle2, Clock } from 'lucide-react';
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
 className="flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors mb-4"
 >
 <ArrowLeft size={16} className="mr-1" /> Back to Directory
 </button>

 <div className="bg-card border border-border rounded-xl p-6 sm:p-8 shadow-sm relative overflow-hidden">
 <div className="absolute top-0 left-0 w-2 h-full bg-primary"></div>
 
 <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-8">
 <div>
 <h1 className="text-3xl font-bold">{hospital.name}</h1>
 <div className="flex items-center mt-2 text-muted-foreground">
 <MapPin size={18} className="mr-1" />
 <span className="mr-4">{hospital.location}</span>
 </div>
 </div>
 <div className="flex flex-col items-end">
 <StatusBadge status={hospital.status} />
 <div className="flex items-center mt-3 text-sm font-medium text-muted-foreground ">
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
 <div className="bg-muted p-4 rounded-lg border border-border">
 <p className="text-sm text-muted-foreground mb-1">ICU Beds</p>
 <p className="text-2xl font-bold">{hospital.icu}</p>
 </div>
 <div className="bg-muted p-4 rounded-lg border border-border">
 <p className="text-sm text-muted-foreground mb-1">General Beds</p>
 <p className="text-2xl font-bold">{hospital.generalBeds}</p>
 </div>
 <div className="bg-muted p-4 rounded-lg border border-border col-span-2">
 <p className="text-sm text-muted-foreground mb-1">Emergency Care</p>
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
 <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">Specialties</h4>
 <div className="flex flex-wrap gap-2">
 {hospital.specialties.map(spec => (
 <span key={spec} className="px-3 py-1 bg-primary/10 text-primary text-sm rounded-full font-medium">{spec}</span>
 ))}
 </div>
 </div>
 <div>
 <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">Services</h4>
 <div className="flex flex-wrap gap-2">
 {hospital.services.map(srv => (
 <span key={srv} className="px-3 py-1 bg-muted text-foreground text-sm rounded-full">{srv}</span>
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
