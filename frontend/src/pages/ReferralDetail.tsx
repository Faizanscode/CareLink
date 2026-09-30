import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, XCircle, PlayCircle, StopCircle, CornerUpLeft, MessageCircle } from 'lucide-react';
import { StatusBadge } from '../components/ui/StatusBadge';
import { 
 getReferral, submitReferral, startReferralReview, 
 acceptReferral, rejectReferral, cancelReferral, requestInformationReferral, 
 completeReferral, type ReferralDetail as ReferralDetailType
} from '../api/client';
import { DocumentManager } from '../components/DocumentManager';
import { SmartFacilityMatching } from '../components/SmartFacilityMatching';

export const ReferralDetail: React.FC<{ isReceiving?: boolean }> = ({ isReceiving = false }) => {
 const { id } = useParams<{ id: string }>();
 const navigate = useNavigate();
 const [referral, setReferral] = useState<ReferralDetailType | null>(null);
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState<string | null>(null);

 const loadData = async () => {
   if (!id) return;
   setLoading(true);
   try {
     const data = await getReferral(parseInt(id));
     setReferral(data);
     setError(null);
   } catch (err: any) {
     setError(err.message || 'Failed to fetch referral details.');
   } finally {
     setLoading(false);
   }
 };

 useEffect(() => {
   loadData();
 }, [id]);

 const handleAction = async (actionFn: (id: number) => Promise<any>, confirmMsg?: string) => {
   if (!referral) return;
   if (confirmMsg && !confirm(confirmMsg)) return;
   
   try {
     await actionFn(referral.id);
     await loadData();
   } catch (err: any) {
     alert(err.message || 'Action failed.');
   }
 };

 
  const handleRequestInfo = async () => {
    if (!referral) return;
    const msg = prompt("Please enter the information you are requesting:");
    if (msg === null) return;
    if (msg.trim() === '') {
      alert("Message is required.");
      return;
    }
    
    try {
      await requestInformationReferral(referral.id, msg);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Action failed.');
    }
  };

  const handleReject = async () => {
   if (!referral) return;
   const reason = prompt("Please enter a reason for rejection:");
   if (reason === null) return; // cancelled
   if (reason.trim() === '') {
     alert("Reason is required to reject a referral.");
     return;
   }
   
   try {
     await rejectReferral(referral.id, reason);
     await loadData();
   } catch (err: any) {
     alert(err.message || 'Action failed.');
   }
 };

 if (loading) return <div className="p-8 text-center text-muted-foreground">Loading...</div>;
 if (error || !referral) return <div className="p-8 text-center text-red-500">{error || 'Referral not found.'}</div>;

 return (
   <div className="max-w-5xl mx-auto space-y-6">
     <div className="flex items-center space-x-4 mb-6">
       <button onClick={() => navigate('/referrals')} className="p-2 hover:bg-muted rounded-full transition-colors">
         <ArrowLeft size={24} className="text-muted-foreground" />
       </button>
       <div className="flex-1">
         <div className="flex items-center space-x-4">
           <h1 className="text-2xl font-bold text-foreground">{referral.referral_code}</h1>
           <StatusBadge status={referral.status} />
           <span className={`px-2 py-1 text-xs font-medium rounded-full ${
             referral.priority === 'URGENT' ? 'bg-red-100 text-red-700' :
             referral.priority === 'HIGH' ? 'bg-yellow-100 text-yellow-700' :
             'bg-blue-100 text-blue-700'
           }`}>
             {referral.priority}
           </span>
         </div>
         <p className="text-muted-foreground">Created {new Date(referral.created_at).toLocaleString()}</p>
       </div>
     </div>

     {/* Action Buttons */}
      <div className="flex space-x-3">
        {!isReceiving && referral.status === 'DRAFT' && (
          <button onClick={() => handleAction(submitReferral)} className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            <PlayCircle size={18} /><span>Submit Referral</span>
          </button>
        )}
        
        {isReceiving && referral.status === 'SUBMITTED' && (
          <button onClick={() => handleAction(startReferralReview)} className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            <PlayCircle size={18} /><span>Start Review</span>
          </button>
        )}
        
        {isReceiving && referral.status === 'UNDER_REVIEW' && (
          <>
            <button onClick={() => handleAction(acceptReferral)} className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
              <CheckCircle size={18} /><span>Accept</span>
            </button>
            <button onClick={handleReject} className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
              <XCircle size={18} /><span>Reject</span>
            </button>
            <button onClick={handleRequestInfo} className="flex items-center space-x-2 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600">
              <MessageCircle size={18} /><span>Request Info</span>
            </button>
          </>
        )}
        
        {referral.status === 'ACCEPTED' && (
          <button onClick={() => handleAction(completeReferral)} className="flex items-center space-x-2 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900">
            <StopCircle size={18} /><span>Complete Transfer</span>
          </button>
        )}
        
        {!isReceiving && (['DRAFT', 'SUBMITTED', 'UNDER_REVIEW'].includes(referral.status)) && (
          <button onClick={() => handleAction(cancelReferral, 'Are you sure you want to cancel this referral?')} className="flex items-center space-x-2 px-4 py-2 border border-border text-foreground rounded-lg hover:bg-muted">
            <CornerUpLeft size={18} /><span>Cancel</span>
          </button>
        )}
      </div>

     <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
       {/* Main Details */}
       <div className="md:col-span-2 space-y-6">
         <div className="bg-card p-6 rounded-xl shadow-sm border border-border">
           <h2 className="text-lg font-semibold text-foreground border-b pb-2 mb-4">Referral Facilities</h2>
           <div className="flex items-center justify-between">
             <div className="flex-1 border border-border p-4 rounded-lg bg-muted/30">
               <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">FROM (Referring)</h3>
               <p className="font-medium text-foreground">{referral.referring_hospital.name}</p>
               {referral.referring_hospital.city && <p className="text-sm text-muted-foreground">{referral.referring_hospital.city}</p>}
             </div>
             <div className="px-4 text-muted-foreground">
               <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
               </svg>
             </div>
             <div className="flex-1 border border-border p-4 rounded-lg bg-blue-50/50 dark:bg-blue-900/10 text-right">
               <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">TO (Receiving)</h3>
               <p className="font-medium text-foreground">{referral.receiving_hospital.name}</p>
               {referral.receiving_hospital.city && <p className="text-sm text-muted-foreground">{referral.receiving_hospital.city}</p>}
             </div>
           </div>
           <div className="mt-6">
             <h3 className="text-sm font-medium text-muted-foreground">Requested Specialty</h3>
             <p className="mt-1 text-foreground">{referral.specialty}</p>
           </div>
         </div>

         <div className="bg-card p-6 rounded-xl shadow-sm border border-border">
           <h2 className="text-lg font-semibold text-foreground border-b pb-2 mb-4">Clinical Information</h2>
           <div className="space-y-4">
             <div>
               <h3 className="text-sm font-medium text-muted-foreground">Reason for Referral</h3>
               <p className="mt-1 text-foreground">{referral.reason_for_referral}</p>
             </div>
             <div>
               <h3 className="text-sm font-medium text-muted-foreground">Clinical Summary</h3>
               <p className="mt-1 text-foreground whitespace-pre-wrap">{referral.clinical_summary}</p>
             </div>
             <div className="grid grid-cols-2 gap-4">
               {referral.diagnosis && (
                 <div>
                   <h3 className="text-sm font-medium text-muted-foreground">Diagnosis</h3>
                   <p className="mt-1 text-foreground">{referral.diagnosis}</p>
                 </div>
               )}
               {referral.current_condition && (
                 <div>
                   <h3 className="text-sm font-medium text-muted-foreground">Current Condition</h3>
                   <p className="mt-1 text-foreground">{referral.current_condition}</p>
                 </div>
               )}
               {referral.required_care && (
                 <div>
                   <h3 className="text-sm font-medium text-muted-foreground">Required Care</h3>
                   <p className="mt-1 text-foreground">{referral.required_care}</p>
                 </div>
               )}
             </div>
             {referral.rejection_reason && (
               <div className="mt-4 p-4 bg-red-50 border border-red-100 rounded-lg">
                 <h3 className="text-sm font-medium text-red-800">Rejection Reason</h3>
                 <p className="mt-1 text-red-900">{referral.rejection_reason}</p>
               </div>
             )}
           </div>
         </div>
         
         {/* Smart Facility Matching */}
         {(referral.status === "DRAFT" || referral.status === "SUBMITTED") && (
           <SmartFacilityMatching
             referralId={referral.id}
             currentHospitalId={referral.receiving_hospital.id}
             onFacilitySelected={loadData}
             disabled={referral.status !== "DRAFT" && referral.status !== "SUBMITTED"}
           />
         )}
       </div>

       {/* Sidebar */}
       <div className="space-y-6">
         <DocumentManager referralId={referral.id} referralStatus={referral.status} />

         <div className="bg-card p-6 rounded-xl shadow-sm border border-border">
           <h2 className="text-lg font-semibold text-foreground border-b pb-2 mb-4">Patient Profile</h2>
           <div className="space-y-3">
             <div>
               <h3 className="text-sm font-medium text-muted-foreground">Name</h3>
               <p className="text-foreground">{referral.patient.first_name} {referral.patient.last_name}</p>
             </div>
             <div>
               <h3 className="text-sm font-medium text-muted-foreground">Patient Code</h3>
               <p className="text-foreground">{referral.patient.patient_code}</p>
             </div>
           </div>
         </div>

         <div className="bg-card p-6 rounded-xl shadow-sm border border-border">
           <h2 className="text-lg font-semibold text-foreground border-b pb-2 mb-4">Timeline</h2>
           <div className="space-y-4">
             {referral.activities.map((activity, index) => (
               <div key={activity.id} className="relative pl-4 border-l-2 border-border">
                 <div className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full border-2 border-white ${
                   index === 0 ? 'bg-blue-500' : 'bg-gray-300'
                 }`} />
                 <p className="text-sm font-medium text-foreground">{activity.action.replace(/_/g, ' ')}</p>
                 <p className="text-xs text-muted-foreground">{new Date(activity.created_at).toLocaleString()}</p>
                 {activity.comment && (
                   <p className="mt-1 text-sm text-muted-foreground bg-muted p-2 rounded">{activity.comment}</p>
                 )}
               </div>
             ))}
           </div>
         </div>
       </div>
     </div>
   </div>
 );
};
