export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8001/api';

const getAuthHeaders = (headers: Record<string, string> = {}) => {
  const token = localStorage.getItem('token');
  if (token) {
    return { ...headers, Authorization: `Bearer ${token}` };
  }
  return headers;
};

const fetchApi = async (url: string, options: RequestInit = {}): Promise<Response> => {
  options.headers = getAuthHeaders(options.headers as Record<string, string>);
  const res = await fetch(url, options);
  if (res.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
  }
  return res;
};


export interface NameObj {
  id: number;
  name: string;
}

export interface HospitalCapacity {
  total_beds: number;
  available_beds: number;
  icu_total: number;
  icu_available: number;
  emergency_beds: number;
  emergency_available: number;
  ventilators_total: number;
  ventilators_available: number;
  updated_at?: string;
}

export interface Equipment {
  id: number;
  equipment_name: string;
  total_quantity: number;
  available_quantity: number;
  status: string;
}

export interface Hospital {
  id: number;
  name: string;
  hospital_code: string;
  registration_number: string | null;
  description: string | null;
  address: string;
  city: string;
  state: string;
  pincode: string;
  latitude: number | null;
  longitude: number | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  emergency_available: boolean;
  operational_status: string;
  is_active: boolean;
  capacity: HospitalCapacity | null;
  specialties: NameObj[];
  services: NameObj[];
  equipment: Equipment[];
  created_at: string;
  updated_at: string;
  freshness: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  role: string;
  is_active: boolean;
  hospital_id: number | null;
  department: string | null;
  specialization: string | null;
  created_at: string;
}

// Hospitals
export const fetchHospitals = async (params: Record<string, string> = {}): Promise<Hospital[]> => {
  const query = new URLSearchParams(params).toString();
  const url = query ? `${API_BASE_URL}/hospitals?${query}` : `${API_BASE_URL}/hospitals`;
  const response = await fetchApi(url);
  if (!response.ok) throw new Error('Failed to fetch hospitals');
  return response.json();
};

export const fetchHospital = async (id: number | string): Promise<Hospital> => {
  const response = await fetchApi(`${API_BASE_URL}/hospitals/${id}`);
  if (!response.ok) throw new Error('Failed to fetch hospital');
  return response.json();
};

export const createHospital = async (data: any): Promise<Hospital> => {
  const response = await fetchApi(`${API_BASE_URL}/hospitals`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to create hospital');
  return response.json();
};

export const updateHospital = async (id: number, data: any): Promise<Hospital> => {
  const response = await fetchApi(`${API_BASE_URL}/hospitals/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to update hospital');
  return response.json();
};

export const deleteHospital = async (id: number): Promise<void> => {
  const response = await fetchApi(`${API_BASE_URL}/hospitals/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Failed to delete hospital');
};

// Users
export const fetchUsers = async (): Promise<User[]> => {
  const response = await fetchApi(`${API_BASE_URL}/users`);
  if (!response.ok) throw new Error('Failed to fetch users');
  return response.json();
};

export const createUser = async (data: any): Promise<User> => {
  const response = await fetchApi(`${API_BASE_URL}/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to create user');
  return response.json();
};

export const deleteUser = async (id: number): Promise<void> => {
  const response = await fetchApi(`${API_BASE_URL}/users/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Failed to delete user');
};

// Facilities
export const fetchSpecialties = async (): Promise<NameObj[]> => {
  const response = await fetchApi(`${API_BASE_URL}/specialties`);
  if (!response.ok) throw new Error('Failed to fetch specialties');
  return response.json();
};

export const fetchServices = async (): Promise<NameObj[]> => {
  const response = await fetchApi(`${API_BASE_URL}/services`);
  if (!response.ok) throw new Error('Failed to fetch services');
  return response.json();
};

// Phase 3: Patients & Referrals
export interface Patient {
  id: number;
  patient_code: string;
  first_name: string;
  last_name: string;
  date_of_birth?: string | null;
  gender?: string | null;
  phone?: string | null;
  blood_group?: string | null;
  address?: string | null;
  city?: string | null;
  emergency_contact_name?: string | null;
  emergency_contact_phone?: string | null;
  created_at: string;
}

export interface ReferralActivity {
  id: number;
  referral_id: number;
  user_id?: number | null;
  action: string;
  from_status?: string | null;
  to_status: string;
  comment?: string | null;
  created_at: string;
}

export interface Referral {
  id: number;
  referral_code: string;
  patient_code: string;
  specialty: string;
  priority: string;
  status: string;
  referring_hospital: string;
  receiving_hospital: string;
  created_at: string;
}

export interface ReferralDetail {
  id: number;
  referral_code: string;
  patient_id: number;
  referring_hospital_id: number;
  referring_user_id: number;
  receiving_hospital_id: number;
  receiving_user_id?: number | null;
  specialty: string;
  reason_for_referral: string;
  clinical_summary: string;
  diagnosis?: string | null;
  current_condition?: string | null;
  required_care?: string | null;
  priority: string;
  status: string;
  rejection_reason?: string | null;
  created_at: string;
  submitted_at?: string | null;
  reviewed_at?: string | null;
  accepted_at?: string | null;
  rejected_at?: string | null;
  
  patient: {
    id: number;
    patient_code: string;
    first_name: string;
    last_name: string;
  };
  referring_hospital: {
    id: number;
    name: string;
    city?: string | null;
  };
  receiving_hospital: {
    id: number;
    name: string;
    city?: string | null;
  };
  activities: ReferralActivity[];
}

// Patients API
export const getPatients = async (): Promise<Patient[]> => {
  const response = await fetchApi(`${API_BASE_URL}/patients`);
  if (!response.ok) throw new Error('Failed to fetch patients');
  return response.json();
};

export const getPatient = async (id: number): Promise<Patient> => {
  const response = await fetchApi(`${API_BASE_URL}/patients/${id}`);
  if (!response.ok) throw new Error('Failed to fetch patient');
  return response.json();
};

export const createPatient = async (data: any): Promise<Patient> => {
  const response = await fetchApi(`${API_BASE_URL}/patients`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to create patient');
  return response.json();
};

// Referrals API
// Utility for simulating auth in prototype
const getHeaders = (userId: number = 2) => ({
  'Content-Type': 'application/json',
  'x-user-id': userId.toString()
});

const handleApiError = async (response: Response, defaultMessage: string) => {
  let errorDetail = defaultMessage;
  try {
    const errorData = await response.json();
    errorDetail = errorData.detail || JSON.stringify(errorData) || defaultMessage;
  } catch (e) {
    try {
      const text = await response.text();
      if (text) errorDetail = text;
    } catch (e2) {}
  }
  console.error(`API Error (${response.status}):`, errorDetail);
  throw new Error(errorDetail);
};

export const getReferrals = async (params: Record<string, string> = {}): Promise<Referral[]> => {
  const query = new URLSearchParams(params).toString();
  const url = query ? `${API_BASE_URL}/referrals?${query}` : `${API_BASE_URL}/referrals`;
  const response = await fetchApi(url, { headers: getHeaders() });
  if (!response.ok) await handleApiError(response, 'Failed to fetch referrals');
  return response.json();
};

export const getReferral = async (id: number): Promise<ReferralDetail> => {
  const response = await fetchApi(`${API_BASE_URL}/referrals/${id}`, { headers: getHeaders() });
  if (!response.ok) await handleApiError(response, 'Failed to fetch referral');
  return response.json();
};

export const createReferral = async (data: any, userId: number = 2): Promise<ReferralDetail> => {
  const response = await fetchApi(`${API_BASE_URL}/referrals`, {
    method: 'POST',
    headers: getHeaders(userId),
    body: JSON.stringify(data),
  });
  if (!response.ok) await handleApiError(response, 'Failed to create referral');
  return response.json();
};

export const updateReferral = async (id: number, data: any, userId: number = 2): Promise<ReferralDetail> => {
  const response = await fetchApi(`${API_BASE_URL}/referrals/${id}`, {
    method: 'PUT',
    headers: getHeaders(userId),
    body: JSON.stringify(data),
  });
  if (!response.ok) await handleApiError(response, 'Failed to update referral');
  return response.json();
};

export const submitReferral = async (id: number, userId: number = 2): Promise<ReferralDetail> => {
  const response = await fetchApi(`${API_BASE_URL}/referrals/${id}/submit`, {
    method: 'POST',
    headers: getHeaders(userId),
  });
  if (!response.ok) await handleApiError(response, 'Failed to submit referral');
  return response.json();
};

export const startReferralReview = async (id: number, userId: number = 2): Promise<ReferralDetail> => {
  const response = await fetchApi(`${API_BASE_URL}/referrals/${id}/review`, {
    method: 'POST',
    headers: getHeaders(userId),
  });
  if (!response.ok) await handleApiError(response, 'Failed to start review');
  return response.json();
};

export const acceptReferral = async (id: number, userId: number = 2): Promise<ReferralDetail> => {
  const response = await fetchApi(`${API_BASE_URL}/referrals/${id}/accept`, {
    method: 'POST',
    headers: getHeaders(userId),
  });
  if (!response.ok) await handleApiError(response, 'Failed to accept referral');
  return response.json();
};

export const rejectReferral = async (id: number, reason: string, userId: number = 2): Promise<ReferralDetail> => {
  const response = await fetchApi(`${API_BASE_URL}/referrals/${id}/reject`, {
    method: 'POST',
    headers: getHeaders(userId),
    body: JSON.stringify({ rejection_reason: reason }),
  });
  if (!response.ok) await handleApiError(response, 'Failed to reject referral');
  return response.json();
};

export const requestInformationReferral = async (id: number, message: string, userId: number = 2): Promise<ReferralDetail> => {
  const response = await fetchApi(`${API_BASE_URL}/referrals/${id}/request-information`, {
    method: 'POST',
    headers: getHeaders(userId),
    body: JSON.stringify({ message: message }),
  });
  if (!response.ok) await handleApiError(response, 'Failed to request information for referral');
  return response.json();
};


export const cancelReferral = async (id: number, userId: number = 2): Promise<ReferralDetail> => {
  const response = await fetchApi(`${API_BASE_URL}/referrals/${id}/cancel`, {
    method: 'POST',
    headers: getHeaders(userId),
  });
  if (!response.ok) await handleApiError(response, 'Failed to cancel referral');
  return response.json();
};

export const completeReferral = async (id: number, userId: number = 2): Promise<ReferralDetail> => {
  const response = await fetchApi(`${API_BASE_URL}/referrals/${id}/complete`, {
    method: 'POST',
    headers: getHeaders(userId),
  });
  if (!response.ok) await handleApiError(response, 'Failed to complete referral');
  return response.json();
};

export const getReferralHistory = async (id: number): Promise<ReferralActivity[]> => {
  const response = await fetchApi(`${API_BASE_URL}/referrals/${id}/history`, { headers: getHeaders() });
  if (!response.ok) await handleApiError(response, 'Failed to fetch referral history');
  return response.json();
};

export interface ClinicalDocument {
  id: number;
  document_code: string;
  referral_id: number;
  patient_id: number;
  uploaded_by: number;
  file_name: string;
  mime_type: string;
  file_size: number;
  status: string;
  uploaded_at: string;
  updated_at: string;
  document_type: string;
  description?: string;
  patient?: { id: number, first_name: string, last_name: string, patient_code: string };
  referral?: { id: number, referral_code: string };
  uploader?: { id: number, name: string };
}

export const getDocuments = async (referralId: number): Promise<ClinicalDocument[]> => {
  const response = await fetchApi(`${API_BASE_URL}/referrals/${referralId}/documents`, { headers: getHeaders() });
  if (!response.ok) await handleApiError(response, 'Failed to fetch documents');
  return response.json();
};

export const uploadDocument = async (referralId: number, formData: FormData): Promise<ClinicalDocument> => {
  const response = await fetchApi(`${API_BASE_URL}/referrals/${referralId}/documents`, {
    method: 'POST',
    headers: { 'x-user-id': '2' },
    body: formData,
  });
  if (!response.ok) await handleApiError(response, 'Failed to upload document');
  return response.json();
};

export const deleteDocument = async (documentId: number): Promise<{message: string}> => {
  const response = await fetchApi(`${API_BASE_URL}/documents/${documentId}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });
  if (!response.ok) await handleApiError(response, 'Failed to delete document');
  return response.json();
};

export const downloadDocumentFile = async (documentId: number): Promise<Blob> => {
  const response = await fetchApi(`${API_BASE_URL}/documents/${documentId}/download`, { headers: getHeaders() });
  if (!response.ok) await handleApiError(response, 'Failed to download document');
  return response.blob();
};

export const getAllDocuments = async (): Promise<ClinicalDocument[]> => {
  const response = await fetchApi(`${API_BASE_URL}/documents/`, { headers: getHeaders() });
  if (!response.ok) await handleApiError(response, 'Failed to fetch all documents');
  return response.json();
};


export interface FacilityMatchResult {
  hospital_id: number;
  hospital_name: string;
  city: string | null;
  score: number;
  match_level: string;
  reasons: string[];
  warnings: string[];
  specialty_match: boolean;
  services_match: boolean;
  beds_available: number;
  icu_available: number;
  equipment_match: boolean;
  data_freshness_text: string;
}

export interface FacilityMatchResponse {
  referral_id: number;
  matches: FacilityMatchResult[];
}

export const getMatchingFacilities = async (referralId: number, limit: number = 10): Promise<FacilityMatchResponse> => {
  const response = await fetchApi(`${API_BASE_URL}/referrals/${referralId}/matching-facilities?limit=${limit}`, { headers: getHeaders() });
  if (!response.ok) await handleApiError(response, 'Failed to fetch matching facilities');
  return response.json();
};


// Auth
export const loginUser = async (data: any) => {
  const formData = new URLSearchParams();
  formData.append('username', data.username);
  formData.append('password', data.password);
  
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: formData.toString()
  });
  
  if (!response.ok) throw new Error('Invalid credentials');
  return response.json();
};

export const fetchCurrentUser = async () => {
  const response = await fetchApi(`${API_BASE_URL}/auth/me`);
  if (!response.ok) throw new Error('Failed to fetch user');
  return response.json();
};
