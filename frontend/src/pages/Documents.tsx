import React, { useState, useEffect } from 'react';
import { 
 FileText, 
 Upload, 
 Eye, 
 Download, 
 Trash2, 
 AlertCircle,
 FileImage,
 X
} from 'lucide-react';
import { 
 getAllDocuments, 
 uploadDocument, 
 deleteDocument, 
 downloadDocumentFile,
 getReferrals,
 type ClinicalDocument,
 type Referral
} from '../api/client';

export const Documents: React.FC = () => {
 const [documents, setDocuments] = useState<ClinicalDocument[]>([]);
 const [referrals, setReferrals] = useState<Referral[]>([]);
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState<string | null>(null);
 
 // Upload Modal State
 const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
 const [uploading, setUploading] = useState(false);
 const [uploadError, setUploadError] = useState<string | null>(null);
 const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
 const [deleteSuccess, setDeleteSuccess] = useState<string | null>(null);
 
 // Form State
 const [selectedReferralId, setSelectedReferralId] = useState<string>('');
 const [documentType, setDocumentType] = useState('MEDICAL_REPORT');
 const [description, setDescription] = useState('');
 const [selectedFile, setSelectedFile] = useState<File | null>(null);

 useEffect(() => {
 fetchDocuments();
 fetchReferrals();
 }, []);

 const fetchDocuments = async () => {
 try {
 setLoading(true);
 setError(null);
 const data = await getAllDocuments();
 setDocuments(data);
 } catch (err) {
 setError('Unable to load documents. Please try again.');
 } finally {
 setLoading(false);
 }
 };

 const fetchReferrals = async () => {
 try {
 const data = await getReferrals();
 setReferrals(data);
 } catch (err) {
 console.error('Failed to fetch referrals for upload modal', err);
 }
 };

 const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
 if (e.target.files && e.target.files.length > 0) {
 setSelectedFile(e.target.files[0]);
 }
 };

 const handleUploadSubmit = async (e: React.FormEvent) => {
 e.preventDefault();
 if (!selectedReferralId || !selectedFile) {
 setUploadError('Please select a referral and a file.');
 return;
 }
 
 // Validate file type
 const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
 if (!allowedTypes.includes(selectedFile.type)) {
 setUploadError('Invalid file type. Please upload a PDF, JPG, or PNG.');
 return;
 }
 
 // Validate file size (10MB)
 if (selectedFile.size > 10 * 1024 * 1024) {
 setUploadError('File size exceeds the 10 MB limit.');
 return;
 }

 try {
 setUploading(true);
 setUploadError(null);
 const formData = new FormData();
 formData.append('file', selectedFile);
 formData.append('document_type', documentType);
 if (description) formData.append('description', description);
 await uploadDocument(Number(selectedReferralId), formData);
 
 setUploadSuccess('Document uploaded successfully.');
 setIsUploadModalOpen(false);
 
 // Reset form
 setSelectedReferralId('');
 setDocumentType('MEDICAL_REPORT');
 setDescription('');
 setSelectedFile(null);
 
 // Refresh list
 fetchDocuments();
 
 // Clear success message after 3 seconds
 setTimeout(() => setUploadSuccess(null), 3000);
 } catch (err) {
 setUploadError('Document upload failed. Please try again.');
 } finally {
 setUploading(false);
 }
 };

 const handleDelete = async (documentId: number) => {
 if (window.confirm('Are you sure you want to delete this document?')) {
 try {
 await deleteDocument(documentId);
 setDeleteSuccess('Document deleted successfully.');
 fetchDocuments();
 setTimeout(() => setDeleteSuccess(null), 3000);
 } catch (err: any) {
 alert(`Failed to delete document: ${err.message || 'Unknown error'}`);
 }
 }
 };

 const handleDownload = async (doc: ClinicalDocument) => {
 try {
 const blob = await downloadDocumentFile(doc.id);
 const url = window.URL.createObjectURL(blob);
 const a = document.createElement('a');
 a.href = url;
 a.download = doc.file_name;
 a.click();
 window.URL.revokeObjectURL(url);
 } catch (err: any) {
 alert(`Failed to download document: ${err.message || 'Unknown error'}`);
 }
 };

 const openPreview = (doc: ClinicalDocument) => {
 // In a real implementation we would open a modal with the document view.
 // For now, downloading is the safest approach to previewing since the backend doesn't serve raw static files without auth.
 handleDownload(doc);
 };

 // Stats calculation
 const totalDocs = documents.length;
 const pdfDocs = documents.filter(d => d.mime_type === 'application/pdf').length;
 const imageDocs = documents.filter(d => d.mime_type.startsWith('image/')).length;
 
 const sevenDaysAgo = new Date();
 sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
 const recentDocs = documents.filter(d => new Date(d.uploaded_at) >= sevenDaysAgo).length;

 return (
 <div className="space-y-6">
 {/* Header */}
 <div className="flex justify-between items-center mb-8">
 <div>
 <h1 className="text-3xl font-bold text-foreground tracking-tight">Medical Documents</h1>
 <p className="text-muted-foreground mt-2 text-lg">Manage clinical documents and referral attachments securely.</p>
 </div>
 <button
 onClick={() => setIsUploadModalOpen(true)}
 className="flex items-center px-6 py-3 bg-primary text-primary-foreground rounded-xl hover:shadow-lg hover:-translate-y-0.5 transition-all font-semibold"
 >
 <Upload className="w-5 h-5 mr-2" />
 Upload Document
 </button>
 </div>
 
 {/* Notifications */}
 {uploadSuccess && (
 <div className="p-4 bg-green-50 text-green-700 border border-green-200 rounded-lg flex items-center">
 <AlertCircle className="w-5 h-5 mr-2 text-green-500" />
 {uploadSuccess}
 </div>
 )}
 
 {deleteSuccess && (
 <div className="p-4 bg-green-50 text-green-700 border border-green-200 rounded-lg flex items-center">
 <AlertCircle className="w-5 h-5 mr-2 text-green-500" />
 {deleteSuccess}
 </div>
 )}

 {/* Stats */}
 <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
 <div className="bg-card p-6 rounded-2xl border border-border shadow-sm flex items-center transition-shadow hover:shadow-md">
 <div className="bg-primary/10 p-4 rounded-xl mr-5">
 <FileText className="w-7 h-7 text-primary" />
 </div>
 <div>
 <p className="text-sm text-muted-foreground font-semibold uppercase tracking-wider mb-1">Total Documents</p>
 <p className="text-3xl font-bold text-foreground">{totalDocs}</p>
 </div>
 </div>
 
 <div className="bg-card p-6 rounded-2xl border border-border shadow-sm flex items-center transition-shadow hover:shadow-md">
 <div className="bg-red-500/10 p-4 rounded-xl mr-5">
 <FileText className="w-7 h-7 text-red-500" />
 </div>
 <div>
 <p className="text-sm text-muted-foreground font-semibold uppercase tracking-wider mb-1">PDF Documents</p>
 <p className="text-3xl font-bold text-foreground">{pdfDocs}</p>
 </div>
 </div>
 
 <div className="bg-card p-6 rounded-2xl border border-border shadow-sm flex items-center transition-shadow hover:shadow-md">
 <div className="bg-amber-500/10 p-4 rounded-xl mr-5">
 <FileImage className="w-7 h-7 text-amber-500" />
 </div>
 <div>
 <p className="text-sm text-muted-foreground font-semibold uppercase tracking-wider mb-1">Images</p>
 <p className="text-3xl font-bold text-foreground">{imageDocs}</p>
 </div>
 </div>
 
 <div className="bg-card p-6 rounded-2xl border border-border shadow-sm flex items-center transition-shadow hover:shadow-md">
 <div className="bg-emerald-500/10 p-4 rounded-xl mr-5">
 <AlertCircle className="w-7 h-7 text-emerald-500" />
 </div>
 <div>
 <p className="text-sm text-muted-foreground font-semibold uppercase tracking-wider mb-1">Recently Added</p>
 <p className="text-3xl font-bold text-foreground">{recentDocs}</p>
 </div>
 </div>
 </div>

 {/* Main Content Area */}
 <div className="bg-card rounded-[32px] shadow-sm border border-border overflow-hidden mt-8">
 
 {loading ? (
 <div className="p-16 text-center text-muted-foreground">
 <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
 Loading documents...
 </div>
 ) : error ? (
 <div className="p-16 text-center text-red-500">
 <AlertCircle className="w-10 h-10 mx-auto mb-4 opacity-50" />
 <p className="text-lg">{error}</p>
 <button onClick={fetchDocuments} className="mt-6 text-primary font-semibold hover:underline">
 Try again
 </button>
 </div>
 ) : documents.length === 0 ? (
 <div className="p-20 text-center">
 <div className="w-20 h-20 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-6">
 <FileText className="w-10 h-10 text-muted-foreground" />
 </div>
 <h3 className="text-xl font-semibold text-foreground mb-2">No documents available</h3>
 <p className="text-muted-foreground mb-8 text-lg">Upload a medical document to attach it to a patient referral.</p>
 <button
 onClick={() => setIsUploadModalOpen(true)}
 className="inline-flex items-center px-6 py-3 bg-primary text-primary-foreground rounded-xl shadow-sm hover:shadow-lg transition-all font-semibold"
 >
 <Upload className="w-5 h-5 mr-2" />
 Upload Document
 </button>
 </div>
 ) : (
 <div className="overflow-x-auto">
 <table className="w-full text-left border-collapse">
 <thead>
 <tr className="bg-muted/30 text-muted-foreground text-[11px] uppercase tracking-widest border-b border-border">
 <th className="px-8 py-5 font-semibold">Document Name</th>
 <th className="px-8 py-5 font-semibold">Patient</th>
 <th className="px-8 py-5 font-semibold">Document Type</th>
 <th className="px-8 py-5 font-semibold">Uploaded By</th>
 <th className="px-8 py-5 font-semibold">Uploaded Date</th>
 <th className="px-8 py-5 font-semibold">Related Referral</th>
 <th className="px-8 py-5 font-semibold">Status</th>
 <th className="px-8 py-5 font-semibold text-right">Actions</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-border">
 {documents.map((doc) => (
 <tr key={doc.id} className="hover:bg-muted transition-colors">
 <td className="px-8 py-5">
 <div className="flex items-center">
 {doc.mime_type === 'application/pdf' ? (
 <FileText className="w-5 h-5 text-red-500 mr-3 shrink-0" />
 ) : (
 <FileImage className="w-5 h-5 text-blue-500 mr-3 shrink-0" />
 )}
 <div>
 <p className="font-medium text-foreground truncate max-w-[200px]" title={doc.file_name}>{doc.file_name}</p>
 <p className="text-xs text-muted-foreground">{(doc.file_size / 1024 / 1024).toFixed(2)} MB</p>
 </div>
 </div>
 </td>
 <td className="px-8 py-5 whitespace-nowrap">
 {doc.patient ? (
 <div>
 <p className="font-medium text-foreground">{doc.patient.first_name} {doc.patient.last_name}</p>
 <p className="text-xs text-muted-foreground">{doc.patient.patient_code}</p>
 </div>
 ) : (
 <span className="text-muted-foreground">ID: {doc.patient_id}</span>
 )}
 </td>
 <td className="px-8 py-5 whitespace-nowrap">
 <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-muted text-foreground">
 {doc.document_type.replace('_', ' ')}
 </span>
 </td>
 <td className="px-8 py-5 whitespace-nowrap">
 {doc.uploader ? (
 <span className="text-sm text-foreground">{doc.uploader.name}</span>
 ) : (
 <span className="text-muted-foreground">ID: {doc.uploaded_by}</span>
 )}
 </td>
 <td className="px-8 py-5 whitespace-nowrap text-sm text-muted-foreground">
 {new Date(doc.uploaded_at).toLocaleDateString()}
 </td>
 <td className="px-8 py-5 whitespace-nowrap">
 {doc.referral ? (
 <span className="text-sm font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-md">{doc.referral.referral_code}</span>
 ) : (
 <span className="text-muted-foreground">ID: {doc.referral_id}</span>
 )}
 </td>
 <td className="px-8 py-5 whitespace-nowrap">
 <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
 {doc.status}
 </span>
 </td>
 <td className="px-8 py-5 whitespace-nowrap text-right text-sm font-medium">
 <div className="flex justify-end space-x-2">
 <button 
 onClick={() => openPreview(doc)}
 className="p-1.5 text-muted-foreground hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
 title="Preview"
 >
 <Eye className="w-4 h-4" />
 </button>
 <button 
 onClick={() => handleDownload(doc)}
 className="p-1.5 text-muted-foreground hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
 title="Download"
 >
 <Download className="w-4 h-4" />
 </button>
 <button 
 onClick={() => handleDelete(doc.id)}
 className="p-1.5 text-muted-foreground hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
 title="Delete"
 >
 <Trash2 className="w-4 h-4" />
 </button>
 </div>
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 )}
 </div>

 {/* Upload Modal */}
 {isUploadModalOpen && (
 <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/50 backdrop-blur-sm p-4">
 <div className="bg-card rounded-xl shadow-xl w-full max-w-md overflow-hidden">
 <div className="flex justify-between items-center p-6 border-b border-border">
 <h2 className="text-lg font-bold text-foreground">Upload Document</h2>
 <button 
 onClick={() => setIsUploadModalOpen(false)}
 className="text-muted-foreground hover:text-muted-foreground"
 >
 <X className="w-5 h-5" />
 </button>
 </div>
 
 <form onSubmit={handleUploadSubmit} className="p-6">
 {uploadError && (
 <div className="mb-4 p-3 bg-red-50 text-red-700 border border-red-200 rounded-lg text-sm flex items-start">
 <AlertCircle className="w-4 h-4 mr-2 shrink-0 mt-0.5" />
 {uploadError}
 </div>
 )}
 
 <div className="space-y-4">
 <div>
 <label className="block text-sm font-medium text-foreground mb-1">
 Related Referral <span className="text-red-500">*</span>
 </label>
 <select 
 required
 value={selectedReferralId}
 onChange={(e) => setSelectedReferralId(e.target.value)}
 className="w-full rounded-lg border-border shadow-sm focus:border-blue-500 focus:ring-blue-500"
 >
 <option value="">Select a referral...</option>
 {referrals.map(ref => (
 <option key={ref.id} value={ref.id}>
 {ref.referral_code} - {ref.patient_code}
 </option>
 ))}
 </select>
 </div>
 
 <div>
 <label className="block text-sm font-medium text-foreground mb-1">
 Document Type <span className="text-red-500">*</span>
 </label>
 <select 
 value={documentType}
 onChange={(e) => setDocumentType(e.target.value)}
 className="w-full rounded-lg border-border shadow-sm focus:border-blue-500 focus:ring-blue-500"
 >
 <option value="MEDICAL_REPORT">Medical Report</option>
 <option value="LAB_REPORT">Lab Report</option>
 <option value="PRESCRIPTION">Prescription</option>
 <option value="DISCHARGE_SUMMARY">Discharge Summary</option>
 <option value="IMAGING_REPORT">Imaging Report</option>
 <option value="OTHER">Other</option>
 </select>
 </div>
 
 <div>
 <label className="block text-sm font-medium text-foreground mb-1">
 Document Name / Description
 </label>
 <input 
 type="text"
 value={description}
 onChange={(e) => setDescription(e.target.value)}
 placeholder="E.g. Blood test results from Q1"
 className="w-full rounded-lg border-border shadow-sm focus:border-blue-500 focus:ring-blue-500"
 />
 </div>
 
 <div>
 <label className="block text-sm font-medium text-foreground mb-1">
 File <span className="text-red-500">*</span>
 </label>
 <input 
 required
 type="file"
 accept=".pdf,.jpg,.jpeg,.png"
 onChange={handleFileChange}
 className="w-full text-sm text-muted-foreground
 file:mr-4 file:py-2 file:px-4
 file:rounded-lg file:border-0
 file:text-sm file:font-semibold
 file:bg-blue-50 file:text-blue-700
 hover:file:bg-blue-100
 "
 />
 <p className="mt-1 text-xs text-muted-foreground">Max file size: 10MB. Supported: PDF, JPG, PNG.</p>
 </div>
 </div>
 
 <div className="mt-6 flex justify-end space-x-3">
 <button
 type="button"
 onClick={() => setIsUploadModalOpen(false)}
 className="px-4 py-2 text-foreground bg-card border border-border rounded-lg hover:bg-muted transition-colors"
 >
 Cancel
 </button>
 <button
 type="submit"
 disabled={uploading}
 className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
 >
 {uploading ? (
 <>
 <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
 Uploading...
 </>
 ) : (
 'Upload Document'
 )}
 </button>
 </div>
 </form>
 </div>
 </div>
 )}

 </div>
 );
};