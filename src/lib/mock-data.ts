export type Role = 'Admin' | 'Doctor' | 'Receptionist' | 'Patient';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  subscriptionPlan: 'Free' | 'Pro';
  specialty?: string;
  status?: 'active' | 'on-leave' | 'inactive';
}

export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: string;
  contact: string;
  email: string;
  address?: string;
  bloodGroup?: string;
  allergies?: string[];
  createdAt: string;
}

export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  notes?: string;
}

export interface Prescription {
  id: string;
  appointmentId: string;
  patientId: string;
  doctorId: string;
  medicines: Array<{
    name: string;
    dosage: string;
    notes?: string;
  }>;
  instructions?: string;
  createdAt: string;
}

export const MOCK_USERS: User[] = [
  { id: '1', name: 'Admin User', email: 'admin@healthflow.ai', role: 'Admin', subscriptionPlan: 'Pro', status: 'active' },
  { id: '2', name: 'Dr. Sarah Smith', email: 'sarah@healthflow.ai', role: 'Doctor', subscriptionPlan: 'Pro', specialty: 'Cardiology', status: 'active' },
  { id: '3', name: 'Dr. James Wilson', email: 'james@healthflow.ai', role: 'Doctor', subscriptionPlan: 'Pro', specialty: 'Pediatrics', status: 'active' },
  { id: '4', name: 'John Reception', email: 'reception@healthflow.ai', role: 'Receptionist', subscriptionPlan: 'Free', status: 'active' },
  { id: '5', name: 'Alice Patient', email: 'alice@gmail.com', role: 'Patient', subscriptionPlan: 'Free' },
];

export const MOCK_PATIENTS: Patient[] = [
  { 
    id: 'p1', 
    name: 'Alice Johnson', 
    age: 28, 
    gender: 'Female', 
    contact: '+1234567890', 
    email: 'alice@gmail.com', 
    address: '123 Health St, Wellness City',
    bloodGroup: 'O+',
    allergies: ['Peanuts', 'Penicillin'],
    createdAt: '2023-10-01' 
  },
  { 
    id: 'p2', 
    name: 'Bob Wilson', 
    age: 45, 
    gender: 'Male', 
    contact: '+1987654321', 
    email: 'bob@gmail.com', 
    address: '456 Vitality Ave, Cure Town',
    bloodGroup: 'A-',
    createdAt: '2023-11-15' 
  },
  { 
    id: 'p3', 
    name: 'Charlie Davis', 
    age: 12, 
    gender: 'Male', 
    contact: '+1122334455', 
    email: 'charlie@gmail.com', 
    address: '789 Growth Rd, Future Heights',
    bloodGroup: 'B+',
    createdAt: '2024-01-20' 
  },
];

export const MOCK_APPOINTMENTS: Appointment[] = [
  { id: 'a1', patientId: 'p1', doctorId: '2', date: '2024-05-20', time: '10:00 AM', status: 'completed' },
  { id: 'a2', patientId: 'p2', doctorId: '2', date: '2024-05-21', time: '11:30 AM', status: 'confirmed' },
  { id: 'a3', patientId: 'p3', doctorId: '2', date: '2024-05-22', time: '02:00 PM', status: 'pending' },
];

export const MOCK_PRESCRIPTIONS: Prescription[] = [
  {
    id: 'pr1',
    appointmentId: 'a1',
    patientId: 'p1',
    doctorId: '2',
    medicines: [
      { name: 'Amoxicillin', dosage: '500mg - Twice daily', notes: 'Take after meals' },
      { name: 'Paracetamol', dosage: '1g - Every 6 hours', notes: 'For fever' }
    ],
    instructions: 'Get plenty of rest and stay hydrated.',
    createdAt: '2024-05-20'
  }
];