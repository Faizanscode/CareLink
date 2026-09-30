export interface Hospital {
  id: string;
  name: string;
  location: string;
  specialties: string[];
  services: string[];
  status: 'Available' | 'Limited Capacity' | 'Data Needs Update';
  lastUpdated: string;
  emergencyCare: boolean;
  icu: number;
  generalBeds: number;
}

export const mockHospitals: Hospital[] = [
  { id: 'HOSP-1', name: 'City General Hospital', location: 'Raipur', specialties: ['Cardiology', 'Neurology'], services: ['ICU', 'Emergency'], status: 'Available', lastUpdated: '5 min ago', emergencyCare: true, icu: 12, generalBeds: 150 },
  { id: 'HOSP-2', name: 'Metro Health Care', location: 'Bhilai', specialties: ['Trauma Care', 'Orthopedics'], services: ['Surgery', 'Emergency'], status: 'Limited Capacity', lastUpdated: '1 hour ago', emergencyCare: true, icu: 3, generalBeds: 45 },
  { id: 'HOSP-3', name: 'Sanjeevani Hospital', location: 'Bilaspur', specialties: ['Oncology', 'Pediatrics'], services: ['Outpatient', 'ICU'], status: 'Data Needs Update', lastUpdated: '3 days ago', emergencyCare: false, icu: 0, generalBeds: 80 },
  { id: 'HOSP-4', name: 'Apex Super Specialty', location: 'Raipur', specialties: ['Neurology', 'Nephrology'], services: ['Dialysis', 'ICU'], status: 'Available', lastUpdated: '10 min ago', emergencyCare: true, icu: 25, generalBeds: 200 },
];
