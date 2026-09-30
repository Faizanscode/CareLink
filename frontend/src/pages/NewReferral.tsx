import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Send } from 'lucide-react';
import { createPatient, createReferral, submitReferral, fetchHospitals, fetchSpecialties, type Hospital, type NameObj } from '../api/client';
import { DocumentManager } from '../components/DocumentManager';
import { useAuth } from '../contexts/AuthContext';

export const NewReferral: React.FC = () => {
 const navigate = useNavigate();
 const { user } = useAuth();
 const [step, setStep] = useState(1);
 const [loading, setLoading] = useState(false);
 const [error, setError] = useState<string | null>(null);
 const [draftReferralId, setDraftReferralId] = useState<number | null>(null);

 const [hospitals, setHospitals] = useState<Hospital[]>([]);
 const [specialties, setSpecialties] = useState<NameObj[]>([]);

 // Patient Form
 const [patientData, setPatientData] = useState({
 first_name: '', last_name: '', date_of_birth: '', gender: '',
 phone: '', blood_group: '', city: '', emergency_contact_name: '', emergency_contact_phone: ''
 });

 // Referral Form
 const [referralData, setReferralData] = useState({
 referring_hospital_id: '',
 receiving_hospital_id: '',
 specialty: '',
 priority: 'ROUTINE',
 reason_for_referral: '',
 clinical_summary: '',
 diagnosis: '',
 current_condition: '',
 required_care: ''
 });

 useEffect(() => {
 const init = async () => {
 try {
 const h = await fetchHospitals({ status: 'Available' });
 setHospitals(Array.isArray(h) ? h : []);
 const s = await fetchSpecialties();
 setSpecialties(Array.isArray(s) ? s : []);
 } catch (err) {
 console.error("Failed to load reference data", err);
 }
 };
 init();
 }, []);

 const handlePatientChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
 setPatientData({ ...patientData, [e.target.name]: e.target.value });
 };

 const handleReferralChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
 setReferralData({ ...referralData, [e.target.name]: e.target.value });
 };

 const validatePatient = () => {
 if (!patientData.first_name || !patientData.last_name) {
 setError("Patient first name and last name are required.");
 return false;
 }
 setError(null);
 return true;
 };

 const validateStep2 = () => {
 if (user?.role === 'SUPER_ADMIN' && !referralData.referring_hospital_id) {
 setError("Please select a referring facility.");
 return false;
 }
 if (!referralData.receiving_hospital_id) {
 setError("Please select a receiving facility.");
 return false;
 }
 if (!referralData.specialty) {
 setError("Please select a specialty.");
 return false;
 }
 if (!referralData.priority) {
 setError("Please select a priority.");
 return false;
 }
 setError(null);
 return true;
 };

 const validateStep3 = () => {
 if (!referralData.reason_for_referral) {
 setError("Please enter a reason for the referral.");
 return false;
 }
 if (!referralData.clinical_summary) {
 setError("Please enter the clinical summary.");
 return false;
 }
 setError(null);
 return true;
 };

 const handleNext = async () => {
 if (step === 1 && validatePatient()) setStep(2);
 else if (step === 2 && validateStep2()) setStep(3);
 else if (step === 3 && validateStep3()) {
 if (!draftReferralId) {
 try {
 const draft = await createDraft();
 setDraftReferralId(draft.id);
 setStep(4);
 } catch (e) {
 // error handled
 }
 } else {
 setStep(4);
 }
 }
 else if (step === 4) setStep(5);
 };

 const createDraft = async () => {
 setLoading(true);
 setError(null);
 try {
 // 1. Create Patient
 const patient = await createPatient(patientData);
 // 2. Create Referral Draft
 const payload: any = {
 ...referralData,
 patient_id: patient.id,
 receiving_hospital_id: parseInt(referralData.receiving_hospital_id)
 };
 if (user?.role === 'SUPER_ADMIN') {
 payload.referring_hospital_id = parseInt(referralData.referring_hospital_id);
 } else {
 delete payload.referring_hospital_id;
 }
 const referral = await createReferral(payload);
 return referral;
 } catch (err: any) {
 setError(err.message || 'An error occurred while saving the draft.');
 throw err;
 } finally {
 setLoading(false);
 }
 };

 const handleSaveDraft = async () => {
 if (!validatePatient()) return;
 if (step > 1 && !validateStep2()) return;
 if (step > 2 && !validateStep3()) return;
 
 try {
 let rId = draftReferralId;
 if (!rId) {
 const referral = await createDraft();
 rId = referral.id;
 }
 navigate(`/referrals/${rId}`);
 } catch (e) {
 // Error handled in createDraft
 }
 };

 const handleSubmit = async () => {
 if (!validatePatient() || !validateStep2() || !validateStep3()) return;
 try {
 let rId = draftReferralId;
 if (!rId) {
 const referral = await createDraft();
 rId = referral.id;
 }
 await submitReferral(rId);
 alert(`Referral submitted successfully.`);
 navigate(`/referrals/${rId}`);
 } catch (e) {
 // Error handled in createDraft
 }
 };

 return (
 <div className="max-w-4xl mx-auto space-y-6">
 <div className="flex items-center space-x-4 mb-6">
 <button onClick={() => navigate('/referrals')} className="p-2 hover:bg-muted rounded-full transition-colors">
 <ArrowLeft size={24} className="text-muted-foreground" />
 </button>
 <div>
 <h1 className="text-2xl font-bold text-foreground">New Referral</h1>
 <p className="text-muted-foreground">Create a new patient referral request.</p>
 </div>
 </div>

 {/* Stepper */}
 <div className="flex items-center justify-between bg-card p-4 rounded-xl shadow-sm border border-border">
 {[1, 2, 3, 4, 5].map((i) => (
 <div key={i} className="flex flex-col items-center flex-1">
 <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${step >= i ? 'bg-blue-600 text-white' : 'bg-muted text-muted-foreground'}`}>
 {i}
 </div>
 <span className={`text-xs mt-2 font-medium text-center ${step >= i ? 'text-blue-600' : 'text-muted-foreground'}`}>
 {i === 1 ? 'Patient' : i === 2 ? 'Details' : i === 3 ? 'Clinical Info' : i === 4 ? 'Documents' : 'Review'}
 </span>
 </div>
 ))}
 </div>

 {error && <div className="bg-red-50 text-red-600 p-4 rounded-lg">{error}</div>}

 <div className="bg-card p-6 rounded-xl shadow-sm border border-border">
 {step === 1 && (
 <div className="space-y-4">
 <h2 className="text-lg font-semibold text-foreground border-b pb-2">Patient Information</h2>
 <div className="grid grid-cols-2 gap-4">
 <div>
 <label className="block text-sm font-medium text-foreground mb-1">First Name *</label>
 <input type="text" name="first_name" value={patientData.first_name} onChange={handlePatientChange} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" required />
 </div>
 <div>
 <label className="block text-sm font-medium text-foreground mb-1">Last Name *</label>
 <input type="text" name="last_name" value={patientData.last_name} onChange={handlePatientChange} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" required />
 </div>
 <div>
 <label className="block text-sm font-medium text-foreground mb-1">Date of Birth</label>
 <input type="date" name="date_of_birth" value={patientData.date_of_birth} onChange={handlePatientChange} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
 </div>
 <div>
 <label className="block text-sm font-medium text-foreground mb-1">Gender</label>
 <select name="gender" value={patientData.gender} onChange={handlePatientChange} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
 <option value="">Select...</option>
 <option value="Male">Male</option>
 <option value="Female">Female</option>
 <option value="Other">Other</option>
 </select>
 </div>
 <div>
 <label className="block text-sm font-medium text-foreground mb-1">Phone Number</label>
 <input type="tel" name="phone" value={patientData.phone} onChange={handlePatientChange} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
 </div>
 <div>
 <label className="block text-sm font-medium text-foreground mb-1">Blood Group</label>
 <select name="blood_group" value={patientData.blood_group} onChange={handlePatientChange} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
 <option value="">Select...</option>
 <option value="A+">A+</option><option value="A-">A-</option>
 <option value="B+">B+</option><option value="B-">B-</option>
 <option value="O+">O+</option><option value="O-">O-</option>
 <option value="AB+">AB+</option><option value="AB-">AB-</option>
 </select>
 </div>
 </div>
 </div>
 )}

 {step === 2 && (
 <div className="space-y-4">
 <h2 className="text-lg font-semibold text-foreground border-b pb-2">Referral Details</h2>
 <div className="grid grid-cols-2 gap-4">
 <div className="col-span-2">
 <label className="block text-sm font-medium text-foreground mb-1">Referring Facility *</label>
 {user?.role === 'SUPER_ADMIN' ? (
 <select name="referring_hospital_id" value={referralData.referring_hospital_id} onChange={handleReferralChange} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" required>
 <option value="">Select Referring Facility...</option>
 {hospitals.map(h => (
 <option key={h.id} value={h.id}>{h.name} ({h.city})</option>
 ))}
 </select>
 ) : (
 <div className="p-3 bg-muted text-foreground rounded-lg border border-border">
 {hospitals.find(h => h.id === user?.hospital_id)?.name || 'Loading...'}
 <span className="text-xs text-muted-foreground ml-2">(Automatically selected from your hospital)</span>
 </div>
 )}
 </div>
 <div className="col-span-2">
 <label className="block text-sm font-medium text-foreground mb-1">Receiving Facility *</label>
 <select name="receiving_hospital_id" value={referralData.receiving_hospital_id} onChange={handleReferralChange} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" required>
 <option value="">Select Facility...</option>
 {hospitals.map(h => (
 <option key={h.id} value={h.id}>{h.name} ({h.city})</option>
 ))}
 </select>
 </div>
 <div>
 <label className="block text-sm font-medium text-foreground mb-1">Specialty *</label>
 <select name="specialty" value={referralData.specialty} onChange={handleReferralChange} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" required>
 <option value="">Select Specialty...</option>
 {specialties.length > 0 ? specialties.map(s => (
 <option key={s.id} value={s.name}>{s.name}</option>
 )) : (
 <>
 <option value="Cardiology">Cardiology</option>
 <option value="Neurology">Neurology</option>
 <option value="Orthopedics">Orthopedics</option>
 <option value="Oncology">Oncology</option>
 <option value="Pediatrics">Pediatrics</option>
 </>
 )}
 </select>
 </div>
 <div>
 <label className="block text-sm font-medium text-foreground mb-1">Priority *</label>
 <select name="priority" value={referralData.priority} onChange={handleReferralChange} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
 <option value="ROUTINE">Routine</option>
 <option value="HIGH">High</option>
 <option value="URGENT">Urgent</option>
 </select>
 </div>
 </div>
 </div>
 )}

 {step === 3 && (
 <div className="space-y-4">
 <h2 className="text-lg font-semibold text-foreground border-b pb-2">Clinical Information</h2>
 <div className="space-y-4">
 <div>
 <label className="block text-sm font-medium text-foreground mb-1">Reason for Referral *</label>
 <input type="text" name="reason_for_referral" value={referralData.reason_for_referral} onChange={handleReferralChange} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" required />
 </div>
 <div>
 <label className="block text-sm font-medium text-foreground mb-1">Clinical Summary *</label>
 <textarea name="clinical_summary" value={referralData.clinical_summary} onChange={handleReferralChange} rows={4} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" required />
 </div>
 <div className="grid grid-cols-2 gap-4">
 <div>
 <label className="block text-sm font-medium text-foreground mb-1">Diagnosis</label>
 <input type="text" name="diagnosis" value={referralData.diagnosis} onChange={handleReferralChange} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
 </div>
 <div>
 <label className="block text-sm font-medium text-foreground mb-1">Current Condition</label>
 <input type="text" name="current_condition" value={referralData.current_condition} onChange={handleReferralChange} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
 </div>
 </div>
 <div>
 <label className="block text-sm font-medium text-foreground mb-1">Required Care</label>
 <input type="text" name="required_care" value={referralData.required_care} onChange={handleReferralChange} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
 </div>
 </div>
 </div>
 )}

 {step === 4 && draftReferralId && (
 <div className="space-y-4">
 <h2 className="text-lg font-semibold text-foreground border-b pb-2">Attach Documents (Optional)</h2>
 <p className="text-sm text-muted-foreground mb-4">
 A draft of this referral has been saved. You may now upload any relevant clinical documents.
 </p>
 <DocumentManager referralId={draftReferralId} referralStatus="DRAFT" />
 </div>
 )}

 {step === 5 && (
 <div className="space-y-6">
 <h2 className="text-lg font-semibold text-foreground border-b pb-2">Review & Submit</h2>
 <div className="grid grid-cols-2 gap-6">
 <div className="space-y-3">
 <h3 className="font-medium text-foreground">Patient</h3>
 <p className="text-sm text-muted-foreground"><strong>Name:</strong> {patientData.first_name} {patientData.last_name}</p>
 <p className="text-sm text-muted-foreground"><strong>DOB:</strong> {patientData.date_of_birth}</p>
 <p className="text-sm text-muted-foreground"><strong>Gender:</strong> {patientData.gender}</p>
 </div>
 <div className="space-y-3">
 <h3 className="font-medium text-foreground">Referral</h3>
 <p className="text-sm text-muted-foreground"><strong>Receiving Facility:</strong> {hospitals.find(h => h.id.toString() === referralData.receiving_hospital_id)?.name}</p>
 <p className="text-sm text-muted-foreground"><strong>Specialty:</strong> {referralData.specialty}</p>
 <p className="text-sm text-muted-foreground"><strong>Priority:</strong> {referralData.priority}</p>
 <p className="text-sm text-muted-foreground"><strong>Reason:</strong> {referralData.reason_for_referral}</p>
 </div>
 </div>
 
 <div className="flex space-x-4 pt-4 border-t">
 <button 
 onClick={handleSaveDraft}
 disabled={loading}
 className="flex items-center space-x-2 px-4 py-2 border border-border text-foreground rounded-lg hover:bg-muted transition-colors"
 >
 <Save size={20} />
 <span>Save Draft</span>
 </button>
 <button 
 onClick={handleSubmit}
 disabled={loading}
 className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
 >
 <Send size={20} />
 <span>{loading ? 'Submitting...' : 'Submit Referral'}</span>
 </button>
 </div>
 </div>
 )}

 {/* Navigation Buttons */}
 {step < 5 && (
 <div className="flex justify-between mt-8 pt-4 border-t">
 <button 
 onClick={() => setStep(step - 1)}
 disabled={step === 1 || loading}
 className="px-4 py-2 border border-border text-foreground rounded-lg hover:bg-muted disabled:opacity-50"
 >
 Back
 </button>
 <button 
 onClick={handleNext}
 disabled={loading}
 className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
 >
 Next
 </button>
 </div>
 )}
 </div>
 </div>
 );
};
