export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

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
  updated_at: string;
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
  latitude: float | null;
  longitude: float | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  emergency_available: boolean;
  operational_status: string;
  is_active: boolean;
  capacity: HospitalCapacity;
  specialties: NameObj[];
  services: NameObj[];
  equipment: NameObj[];
  created_at: string;
  updated_at: string;
}

export const fetchHospitals = async (): Promise<Hospital[]> => {
  const response = await fetch(`${API_BASE_URL}/hospitals`);
  if (!response.ok) throw new Error('Failed to fetch hospitals');
  return response.json();
};

export const fetchHospital = async (id: number | string): Promise<Hospital> => {
  const response = await fetch(`${API_BASE_URL}/hospitals/${id}`);
  if (!response.ok) throw new Error('Failed to fetch hospital');
  return response.json();
};
