export type Role = 'member' | 'trainer' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: Role;
  avatar?: string;
}

export interface Session {
  id: string;
  memberId: string;
  trainerId: string;
  date: string;
  time: string;
  category: string; // Leg Day, Arm Day, etc.
  status: 'scheduled' | 'completed' | 'cancelled';
}

export interface Member extends User {
  trainerId?: string;
  membershipStatus: 'active' | 'inactive' | 'pending' | 'unpaid';
  plan?: 'basic' | 'pro' | 'elite';
  joinedDate: string;
  lastPaymentDate?: string;
  nextPaymentDate?: string;
  trainingTime?: string;
  goal?: string;
  height?: number; // in cm
  progress?: {
    date: string;
    weight: number;
    height?: number;
    bodyFat: number;
    notes: string;
  }[];
}

export interface Trainer extends User {
  specialization: string[];
  members: string[]; // member IDs
  schedule: {
    day: string;
    time: string;
    focus?: string; // e.g., "Leg Day", "Cardio"
  }[];
  rating: number;
  experience: string;
  isApproved: boolean;
  bio?: string;
}

export interface Payment {
  id: string;
  memberId: string;
  memberName: string;
  amount: number;
  date: string;
  status: 'completed' | 'pending' | 'failed';
  plan: string;
  method: 'cash' | 'e-wallet';
}

export interface GymSettings {
  brandName: string;
  address: string;
  mapUrl: string;
  phone: string;
  email: string;
  operatingHours: string;
  brandDescription: string;
  internalPortalLabel: string;
  footerCopyright: string;
  socialLinks: {
    id: string;
    label: string;
    href: string;
  }[];
  quickLinks: {
    id: string;
    label: string;
    href: string;
  }[];
  services: {
    id: string;
    title: string;
    description: string;
    image: string;
  }[];
}
