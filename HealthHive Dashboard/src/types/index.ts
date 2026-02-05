export interface Patient {
  id: string;
  name: string;
  sex: 'M' | 'F';
  age: number;
  barangay: string;
  conditions: ('DM' | 'HTN')[];
  lastVisit: string;
  nextDue: string;
  risk: 'Low' | 'Medium' | 'High' | 'Very High' | 'Normal';
  controlStatus: 'Controlled' | 'Uncontrolled' | 'Unknown' | 'N/A';
  flaggedForFollowUp?: boolean;
  followUpReason?: string;
  contact?: string;
  latestBP?: string;
  latestHbA1c?: string;
  latestRBG?: number; // Random Blood Glucose in mg/dL
  latestFBG?: number; // Fasting Blood Glucose in mg/dL
  latestBMI?: number;
  height?: number; // in cm
  weight?: number; // in kg
  medications?: string[];
  // Demographics
  occupation?: string;
  education?: 'No formal education' | 'Elementary' | 'High School' | 'College' | 'Graduate';
  maritalStatus?: 'Single' | 'Married' | 'Widowed' | 'Separated';
  householdIncome?: 'Below 5k' | '5k-10k' | '10k-20k' | '20k-40k' | 'Above 40k';
  religion?: string;
}

export interface Barangay {
  id: string;
  name: string;
  population: number;
  registered: number;
  screenedPercent: number;
  uncontrolledDM: number;
  uncontrolledHTN: number;
  lastClinicDate: string;
  coordinates?: { lat: number; lng: number };
}

export interface StockItem {
  id: string;
  name: string;
  currentStock: number;
  avgMonthlyUse: number;
  reorderPoint: number;
  nextDeliveryETA: string;
  daysOfSupply: number;
}

export interface Visit {
  patientId: string;
  patientName: string;
  barangay: string;
  reason: string;
  distance?: string;
  lastBP?: string;
  lastHbA1c?: string;
}
