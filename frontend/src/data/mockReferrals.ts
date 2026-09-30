export interface Referral {
  id: string;
  patientName: string;
  priority: 'EMERGENCY' | 'URGENT' | 'ROUTINE';
  specialty: string;
  referringFacility: string;
  status: 'Pending' | 'Reviewing' | 'Accepted' | 'In Transit' | 'Completed';
  createdAt: string;
}

export const mockReferrals: Referral[] = [
  { id: 'REF-1024', patientName: 'Rahul Sharma', priority: 'URGENT', specialty: 'Cardiology', referringFacility: 'City General Hospital', status: 'Pending', createdAt: '10 mins ago' },
  { id: 'REF-1023', patientName: 'Aman Verma', priority: 'ROUTINE', specialty: 'Neurology', referringFacility: 'District Hospital', status: 'Accepted', createdAt: '1 hour ago' },
  { id: 'REF-1022', patientName: 'Neha Singh', priority: 'EMERGENCY', specialty: 'Trauma Care', referringFacility: 'Community Health Center', status: 'In Transit', createdAt: '2 hours ago' },
  { id: 'REF-1021', patientName: 'Priya Patel', priority: 'ROUTINE', specialty: 'Orthopedics', referringFacility: 'Northway Clinic', status: 'Completed', createdAt: '1 day ago' },
  { id: 'REF-1020', patientName: 'Vikas Kumar', priority: 'URGENT', specialty: 'Oncology', referringFacility: 'Eastside Medical', status: 'Reviewing', createdAt: '2 days ago' },
];
