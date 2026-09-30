import React, { useState, useEffect } from 'react';
import { Paperclip, Upload, Trash2, Download, FileText, FileImage, AlertCircle } from 'lucide-react';
import { getDocuments, uploadDocument, deleteDocument, downloadDocumentFile } from '../api/client';
import type { ClinicalDocument } from '../api/client';

interface DocumentManagerProps {
 referralId: number;
 referralStatus: string;
}

export const DocumentManager: React.FC<DocumentManagerProps> = ({ referralId, referralStatus }) => {
 const [documents, setDocuments] = useState<ClinicalDocument[]>([]);
 const [loading, setLoading] = useState(true);
 const [uploading, setUploading] = useState(false);
 const [error, setError] = useState<string | null>(null);

 // Form state
 const [file, setFile] = useState<File | null>(null);
 const [documentType, setDocumentType] = useState('MEDICAL_REPORT');
 const [description, setDescription] = useState('');

 const loadDocuments = async () => {
 try {
 const data = await getDocuments(referralId);
 setDocuments(data);
 } catch (err: any) {
 setError(err.message || 'Failed to load documents');
 } finally {
 setLoading(false);
 }
 };

 useEffect(() => {
 loadDocuments();
 }, [referralId]);

 const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
 if (e.target.files && e.target.files[0]) {
 const selectedFile = e.target.files[0];
 // Validate file size (10 MB limit)
 if (selectedFile.size > 10 * 1024 * 1024) {
 alert('File size exceeds the 10 MB limit.');
 return;
 }
 setFile(selectedFile);
 }
 };

 const handleUpload = async (e: React.FormEvent) => {
 e.preventDefault();
 if (!file) {
 alert('Please select a file to upload.');
 return;
 }
 setUploading(true);
 setError(null);
 try {
 const formData = new FormData();
 formData.append('file', file);
 formData.append('document_type', documentType);
 if (description) formData.append('description', description);
 await uploadDocument(referralId, formData);
 setFile(null);
 setDescription('');
 // Reset file input
 const fileInput = document.getElementById('file-upload') as HTMLInputElement;
 if (fileInput) fileInput.value = '';
 await loadDocuments();
 } catch (err: any) {
 setError(err.message || 'Upload failed');
 } finally {
 setUploading(false);
 }
 };

 const handleDelete = async (documentId: number) => {
 if (!confirm('Are you sure you want to delete this document?')) return;
 try {
 await deleteDocument(documentId);
 await loadDocuments();
 } catch (err: any) {
 alert(err.message || 'Delete failed');
 }
 };

 const formatFileSize = (bytes: number) => {
 if (bytes === 0) return '0 Bytes';
 const k = 1024;
 const sizes = ['Bytes', 'KB', 'MB', 'GB'];
 const i = Math.floor(Math.log(bytes) / Math.log(k));
 return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
 };

 const getFileIcon = (mimeType: string) => {
 if (mimeType.includes('image')) return <FileImage size={24} className="text-blue-500" />;
 return <FileText size={24} className="text-red-500" />;
 };

 return (
 <div className="bg-card p-6 rounded-xl shadow-sm border border-border">
 <h2 className="text-lg font-semibold text-foreground border-b pb-2 mb-4 flex items-center gap-2">
 <Paperclip size={20} className="text-muted-foreground" />
 Clinical Documents
 </h2>

 {error && (
 <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg flex items-start gap-2">
 <AlertCircle size={18} className="mt-0.5" />
 <p className="text-sm">{error}</p>
 </div>
 )}

 {/* Upload Form - Only visible if in DRAFT or if additional uploads are allowed (assuming allowed anytime for demo, or restrict based on requirements) */}
 <form onSubmit={handleUpload} className="mb-6 space-y-4 p-4 bg-muted rounded-lg border border-border">
 <h3 className="text-sm font-medium text-foreground">Upload New Document</h3>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <div>
 <label className="block text-sm font-medium text-foreground mb-1">Document Type</label>
 <select
 value={documentType}
 onChange={(e) => setDocumentType(e.target.value)}
 className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
 <label className="block text-sm font-medium text-foreground mb-1">File (PDF, JPG, PNG - Max 10MB)</label>
 <input
 id="file-upload"
 type="file"
 accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
 onChange={handleFileChange}
 className="w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
 />
 </div>
 </div>
 <div>
 <label className="block text-sm font-medium text-foreground mb-1">Description (Optional)</label>
 <input
 type="text"
 value={description}
 onChange={(e) => setDescription(e.target.value)}
 className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
 placeholder="E.g., Recent blood test results"
 />
 </div>
 <div className="flex justify-end">
 <button
 type="submit"
 disabled={uploading || !file}
 className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
 >
 <Upload size={16} />
 {uploading ? 'Uploading...' : 'Upload Document'}
 </button>
 </div>
 </form>

 {/* Document List */}
 {loading ? (
 <div className="text-center text-sm text-muted-foreground py-4">Loading documents...</div>
 ) : documents.length === 0 ? (
 <div className="text-center text-sm text-muted-foreground py-8 bg-muted rounded-lg border border-dashed border-border">
 No documents uploaded yet.
 </div>
 ) : (
 <div className="space-y-3">
 {documents.map((doc) => (
 <div key={doc.id} className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-muted">
 <div className="flex items-start gap-3">
 <div className="mt-1">{getFileIcon(doc.mime_type)}</div>
 <div>
 <p className="text-sm font-medium text-foreground">{doc.file_name}</p>
 <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
 <span className="font-medium px-2 py-0.5 bg-muted rounded text-muted-foreground">
 {doc.document_type.replace(/_/g, ' ')}
 </span>
 <span>•</span>
 <span>{formatFileSize(doc.file_size)}</span>
 <span>•</span>
 <span>{new Date(doc.uploaded_at).toLocaleDateString()}</span>
 </div>
 {doc.description && <p className="text-xs text-muted-foreground mt-1">{doc.description}</p>}
 </div>
 </div>
 <div className="flex items-center gap-2">
 <button
 onClick={async () => {
 const blob = await downloadDocumentFile(doc.id);
 const url = window.URL.createObjectURL(blob);
 const a = document.createElement('a');
 a.href = url;
 a.download = doc.file_name;
 a.click();
 window.URL.revokeObjectURL(url);
 }}
 className="p-2 text-muted-foreground hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
 title="Download"
 >
 <Download size={18} />
 </button>
 {referralStatus === 'DRAFT' && doc.uploaded_by === 2 && (
 <button
 onClick={() => handleDelete(doc.id)}
 className="p-2 text-muted-foreground hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
 title="Delete"
 >
 <Trash2 size={18} />
 </button>
 )}
 </div>
 </div>
 ))}
 </div>
 )}
 </div>
 );
};
