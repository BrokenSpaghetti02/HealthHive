import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Home, Users, AlertCircle, MapPin, ScanLine, X, Check, Wifi, WifiOff, RefreshCw, ChevronRight, Plus, Edit2, Camera, Phone, Calendar, Filter, Activity, Clock, FileText, Heart, Stethoscope, Save, Eye, EyeOff, Lock, Menu, User, Settings, BookOpen, Globe, TrendingUp, TrendingDown, Bell, Search, BarChart3, Database, Award, HelpCircle, Printer, MessageSquare, Download, Target, ChevronLeft, MoreVertical, ChevronDown, ChevronUp, Info, Trash2, Share2, FileDown, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';
import healthHiveLogo from 'figma:asset/694809d4273f1d268927ef54e7adf373239fa771.png';
import loginLogo from 'figma:asset/8afe7f85122e1c8b09051bbd6c6ce1b51a8189b8.png';
import { Button } from './components/ui/button';
import { Badge } from './components/ui/badge';
import { Card } from './components/ui/card';
import { Input } from './components/ui/input';
import { Label } from './components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './components/ui/dialog';
import { Avatar } from './components/ui/avatar';
import { Checkbox } from './components/ui/checkbox';
import { Textarea } from './components/ui/textarea';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './components/ui/accordion';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from './components/ui/breadcrumb';
import { Skeleton } from './components/ui/skeleton';
import { Progress } from './components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './components/ui/tooltip';
import { toast, Toaster } from 'sonner';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, LineChart, Line, Legend } from 'recharts';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from './components/ui/alert-dialog';
import { api as apiClient } from './lib/api';

// Types
type Screen = 
  | 'login' | 'onboarding1' | 'onboarding2' | 'home' | 'new-patient' 
  | 'initial-screening' | 'patient-profile' | 'new-visit' | 'visit-information' | 'high-risk-highlights' 
  | 'high-risk-details' | 'follow-up-patients' | 'sync-history' | 'visit-history' 
  | 'barangay-overview' | 'barangay-profile' | 'scanner' | 'patients-list' | 'user-guide' | 'flagged-patients' | 'admin';

type Patient = {
  id: string;
  firstName: string;
  middleName: string;
  lastName: string;
  name: string;
  dateOfBirth: string;
  age: number;
  sex: string;
  barangay: string;
  purok: string;
  contact: string;
  address: string;
  occupation: string;
  education: string;
  maritalStatus: string;
  conditions: string[];
  latestBP: string;
  latestRBS: string;
  riskLevel: 'Low' | 'Medium' | 'High' | 'Very High';
  lastVisit: string;
  nextFollowUp?: string;
  followUpStatus?: 'due' | 'overdue';
  followUpReason?: string;
  flaggedForFollowUp?: boolean;
  weight: string;
  height: string;
  bmi: string;
  currentMedications?: Array<{ name: string; dosage: string }>;
  familyHistory?: string;
};

// Mock Data
const barangays = [
  'Alejawan', 'Balili', 'Boctol', 'Buyog', 'Bunga Ilaya', 'Bunga Mar', 
  'Cabungaan', 'Calabacita', 'Cambugason', 'Can-ipol', 'Canjulao', 'Cantagay', 
  'Cantuyoc', 'Can-uba', 'Can-upao', 'Faraon', 'Ipil', 'Kinagbaan', 
  'Laca', 'Larapan', 'Lonoy', 'Looc', 'Malbog', 'Mayana', 'Naatang', 
  'Nausok', 'Odiong', 'Pagina', 'Pangdan', 'Poblacion (Pondol)', 
  'Tejero', 'Tubod Mar', 'Tubod Monte'
];

const occupations = [
  'Farmer / Agricultural Worker',
  'Unemployed / Seeking Work',
  'Vendor / Market Trader',
  'Fisherman / Fish Vendor',
  'Health Worker / Barangay Worker',
  'Transport / Driver (Tricycle/Cargo)',
  'Homemaker / Housewife',
  'Teacher / Educator',
  'Government Employee / Officer',
  'Livestock / Poultry Raiser',
  'Artisan / Calamay / Food Processor',
  'Port / Cargo Handler / Dock Worker'
];

const educationLevels = [
  'Elementary',
  'High School',
  'College'
];

const maritalStatuses = [
  'Single',
  'Married',
  'Widowed',
  'Separated'
];

const medications = [
  'Metformin',
  'Glimepiride',
  'Insulin',
  'Amlodipine',
  'Losartan',
  'Atenolol',
  'Hydrochlorothiazide',
  'Aspirin',
  'Simvastatin',
  'Atorvastatin'
];

const PENDING_VISITS_KEY = 'healthhive_pending_visits';

const loadPendingVisits = (): any[] => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(PENDING_VISITS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const savePendingVisits = (visits: any[]) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(PENDING_VISITS_KEY, JSON.stringify(visits));
};

const enqueuePendingVisit = (visit: any) => {
  const visits = loadPendingVisits();
  visits.push(visit);
  savePendingVisits(visits);
  return visits.length;
};

const clearPendingVisits = () => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(PENDING_VISITS_KEY);
};

const mockPatients: Patient[] = [
  {
    id: 'JAG-000123',
    firstName: 'Ana',
    middleName: 'Maria',
    lastName: 'Reyes',
    name: 'Ana Maria Reyes',
    dateOfBirth: '15/03/1971',
    age: 54,
    sex: 'Female',
    barangay: 'Poblacion (Pondol)',
    purok: 'Purok 3',
    contact: '+63 912 345 6789',
    address: 'Purok 3, Poblacion',
    occupation: 'Vendor / Market Trader',
    education: 'High School',
    maritalStatus: 'Married',
    conditions: ['Hypertension', 'Diabetes Mellitus Type 2'],
    latestBP: '145/92',
    latestRBS: '180 mg/dL',
    riskLevel: 'High',
    lastVisit: 'Oct 15, 2025',
    nextFollowUp: 'Nov 15, 2025',
    followUpStatus: 'due',
    followUpReason: 'Uncontrolled BP & RBS',
    weight: '68 kg',
    height: '155 cm',
    bmi: '28.3',
    currentMedications: [
      { name: 'Metformin', dosage: '500mg 2x daily' },
      { name: 'Amlodipine', dosage: '5mg 1x daily' }
    ],
    familyHistory: 'Mother had diabetes, father had hypertension'
  },
  {
    id: 'JAG-000124',
    firstName: 'Carlos',
    middleName: 'Miguel',
    lastName: 'Santos',
    name: 'Carlos Miguel Santos',
    dateOfBirth: '22/08/1964',
    age: 61,
    sex: 'Male',
    barangay: 'Naatang',
    purok: 'Purok 5',
    contact: '+63 918 765 4321',
    address: 'Purok 5, Naatang',
    occupation: 'Farmer / Agricultural Worker',
    education: 'Elementary',
    maritalStatus: 'Married',
    conditions: ['Hypertension'],
    latestBP: '138/88',
    latestRBS: '110 mg/dL',
    riskLevel: 'Medium',
    lastVisit: 'Oct 20, 2025',
    nextFollowUp: 'Nov 20, 2025',
    followUpStatus: 'due',
    followUpReason: 'Routine BP monitoring',
    weight: '75 kg',
    height: '168 cm',
    bmi: '26.6',
    currentMedications: [
      { name: 'Losartan', dosage: '50mg 1x daily' }
    ],
    familyHistory: 'No known family history of DM or HTN'
  },
  {
    id: 'JAG-000125',
    firstName: 'Rosa',
    middleName: 'Linda',
    lastName: 'Garcia',
    name: 'Rosa Linda Garcia',
    dateOfBirth: '10/06/1968',
    age: 57,
    sex: 'Female',
    barangay: 'Cantagay',
    purok: 'Purok 2',
    contact: '+63 920 555 1234',
    address: 'Purok 2, Cantagay',
    occupation: 'Homemaker / Housewife',
    education: 'Elementary',
    maritalStatus: 'Married',
    conditions: ['Diabetes Mellitus Type 2'],
    latestBP: '152/95',
    latestRBS: '245 mg/dL',
    riskLevel: 'High',
    lastVisit: 'Oct 12, 2025',
    nextFollowUp: 'Nov 12, 2025',
    followUpStatus: 'overdue',
    followUpReason: 'Very high RBS, medication adjustment needed',
    weight: '72 kg',
    height: '152 cm',
    bmi: '31.1',
    currentMedications: [
      { name: 'Metformin', dosage: '850mg 2x daily' },
      { name: 'Glimepiride', dosage: '2mg 1x daily' }
    ],
    familyHistory: 'Both parents had diabetes'
  },
  {
    id: 'JAG-000126',
    firstName: 'Ramon',
    middleName: 'Jose',
    lastName: 'Dela Cruz',
    name: 'Ramon Jose Dela Cruz',
    dateOfBirth: '28/11/1959',
    age: 65,
    sex: 'Male',
    barangay: 'Naatang',
    purok: 'Purok 1',
    contact: '+63 915 234 5678',
    address: 'Purok 1, Naatang',
    occupation: 'Fisherman / Fish Vendor',
    education: 'Elementary',
    maritalStatus: 'Married',
    conditions: ['Hypertension', 'Diabetes Mellitus Type 2'],
    latestBP: '168/102',
    latestRBS: '210 mg/dL',
    riskLevel: 'High',
    lastVisit: 'Oct 18, 2025',
    nextFollowUp: 'Nov 8, 2025',
    followUpStatus: 'overdue',
    followUpReason: 'Stage 2 HTN, poor medication compliance',
    weight: '80 kg',
    height: '165 cm',
    bmi: '29.4',
    currentMedications: [
      { name: 'Metformin', dosage: '500mg 2x daily' },
      { name: 'Amlodipine', dosage: '10mg 1x daily' },
      { name: 'Losartan', dosage: '50mg 1x daily' }
    ],
    familyHistory: 'Father died of stroke'
  },
  {
    id: 'JAG-000127',
    firstName: 'Maria',
    middleName: 'Elena',
    lastName: 'Fernandez',
    name: 'Maria Elena Fernandez',
    dateOfBirth: '05/02/1975',
    age: 50,
    sex: 'Female',
    barangay: 'Poblacion (Pondol)',
    purok: 'Purok 7',
    contact: '+63 917 888 9999',
    address: 'Purok 7, Poblacion',
    occupation: 'Vendor / Market Trader',
    education: 'High School',
    maritalStatus: 'Widowed',
    conditions: ['Hypertension'],
    latestBP: '158/98',
    latestRBS: '115 mg/dL',
    riskLevel: 'High',
    lastVisit: 'Oct 22, 2025',
    nextFollowUp: 'Nov 12, 2025',
    followUpStatus: 'due',
    followUpReason: 'Elevated BP despite medication',
    weight: '65 kg',
    height: '158 cm',
    bmi: '26.0',
    currentMedications: [
      { name: 'Amlodipine', dosage: '5mg 1x daily' }
    ],
    familyHistory: 'Mother had hypertension'
  },
  {
    id: 'JAG-000128',
    firstName: 'Pedro',
    middleName: 'Andres',
    lastName: 'Villanueva',
    name: 'Pedro Andres Villanueva',
    dateOfBirth: '19/09/1962',
    age: 63,
    sex: 'Male',
    barangay: 'Cantagay',
    purok: 'Purok 4',
    contact: '+63 919 123 4567',
    address: 'Purok 4, Cantagay',
    occupation: 'Farmer / Agricultural Worker',
    education: 'Elementary',
    maritalStatus: 'Married',
    conditions: ['Diabetes Mellitus Type 2', 'Hypertension'],
    latestBP: '162/96',
    latestRBS: '230 mg/dL',
    riskLevel: 'High',
    lastVisit: 'Oct 10, 2025',
    nextFollowUp: 'Nov 5, 2025',
    followUpReason: 'Poor glycemic control, reports blurred vision',
    weight: '78 kg',
    height: '170 cm',
    bmi: '27.0',
    currentMedications: [
      { name: 'Metformin', dosage: '1000mg 2x daily' },
      { name: 'Glimepiride', dosage: '4mg 1x daily' },
      { name: 'Losartan', dosage: '100mg 1x daily' }
    ],
    familyHistory: 'Sister has diabetes, brother had stroke'
  },
  {
    id: 'JAG-000129',
    firstName: 'Luz',
    middleName: 'Santos',
    lastName: 'Mendoza',
    name: 'Luz Santos Mendoza',
    dateOfBirth: '14/07/1970',
    age: 55,
    sex: 'Female',
    barangay: 'Naatang',
    purok: 'Purok 3',
    contact: '+63 916 777 8888',
    address: 'Purok 3, Naatang',
    occupation: 'Homemaker / Housewife',
    education: 'High School',
    maritalStatus: 'Married',
    conditions: ['Diabetes Mellitus Type 2'],
    latestBP: '155/92',
    latestRBS: '260 mg/dL',
    riskLevel: 'Very High',
    lastVisit: 'Oct 8, 2025',
    nextFollowUp: 'Nov 1, 2025',
    followUpReason: 'Very poor control, possible insulin initiation',
    weight: '85 kg',
    height: '160 cm',
    bmi: '33.2',
    currentMedications: [
      { name: 'Metformin', dosage: '1000mg 2x daily' },
      { name: 'Glimepiride', dosage: '4mg 1x daily' }
    ],
    familyHistory: 'Mother and two siblings have diabetes'
  },
  {
    id: 'JAG-000130',
    firstName: 'Antonio',
    middleName: 'Cruz',
    lastName: 'Bautista',
    name: 'Antonio Cruz Bautista',
    dateOfBirth: '03/12/1967',
    age: 57,
    sex: 'Male',
    barangay: 'Tubod',
    purok: 'Purok 1',
    contact: '+63 917 222 3333',
    address: 'Purok 1, Tubod',
    occupation: 'Farmer / Agricultural Worker',
    education: 'Elementary',
    maritalStatus: 'Married',
    conditions: ['Hypertension'],
    latestBP: '130/85',
    latestRBS: '105 mg/dL',
    riskLevel: 'Low',
    lastVisit: 'Oct 25, 2025',
    nextFollowUp: 'Dec 25, 2025',
    followUpReason: 'Routine monitoring',
    weight: '70 kg',
    height: '165 cm',
    bmi: '25.7',
    currentMedications: [
      { name: 'Losartan', dosage: '50mg 1x daily' }
    ],
    familyHistory: 'Father had hypertension'
  },
  {
    id: 'JAG-000131',
    firstName: 'Elena',
    middleName: 'Ramos',
    lastName: 'Diaz',
    name: 'Elena Ramos Diaz',
    dateOfBirth: '18/04/1972',
    age: 53,
    sex: 'Female',
    barangay: 'Cambugason',
    purok: 'Purok 2',
    contact: '+63 918 444 5555',
    address: 'Purok 2, Cambugason',
    occupation: 'Vendor / Market Trader',
    education: 'High School',
    maritalStatus: 'Married',
    conditions: ['Diabetes Mellitus Type 2', 'Hypertension'],
    latestBP: '170/105',
    latestRBS: '215 mg/dL',
    riskLevel: 'High',
    lastVisit: 'Oct 19, 2025',
    nextFollowUp: 'Nov 9, 2025',
    followUpReason: 'Uncontrolled HTN and DM, medication review needed',
    weight: '82 kg',
    height: '158 cm',
    bmi: '32.8',
    currentMedications: [
      { name: 'Metformin', dosage: '850mg 2x daily' },
      { name: 'Amlodipine', dosage: '10mg 1x daily' },
      { name: 'Losartan', dosage: '100mg 1x daily' }
    ],
    familyHistory: 'Both parents had diabetes and hypertension'
  },
  {
    id: 'JAG-000132',
    firstName: 'Ricardo',
    middleName: 'Lopez',
    lastName: 'Torres',
    name: 'Ricardo Lopez Torres',
    dateOfBirth: '07/09/1965',
    age: 60,
    sex: 'Male',
    barangay: 'Tubod',
    purok: 'Purok 4',
    contact: '+63 919 666 7777',
    address: 'Purok 4, Tubod',
    occupation: 'Fisherman / Fish Vendor',
    education: 'Elementary',
    maritalStatus: 'Married',
    conditions: ['Diabetes Mellitus Type 2'],
    latestBP: '125/80',
    latestRBS: '125 mg/dL',
    riskLevel: 'Medium',
    lastVisit: 'Oct 23, 2025',
    nextFollowUp: 'Nov 23, 2025',
    followUpReason: 'Monitor blood sugar levels',
    weight: '73 kg',
    height: '170 cm',
    bmi: '25.3',
    currentMedications: [
      { name: 'Metformin', dosage: '500mg 2x daily' }
    ],
    familyHistory: 'Sister has diabetes'
  },
  {
    id: 'JAG-000133',
    firstName: 'Nena',
    middleName: 'Garcia',
    lastName: 'Ramos',
    name: 'Nena Garcia Ramos',
    dateOfBirth: '22/01/1969',
    age: 56,
    sex: 'Female',
    barangay: 'Cambugason',
    purok: 'Purok 5',
    contact: '+63 920 888 9999',
    address: 'Purok 5, Cambugason',
    occupation: 'Homemaker / Housewife',
    education: 'High School',
    maritalStatus: 'Widowed',
    conditions: ['Hypertension'],
    latestBP: '142/90',
    latestRBS: '98 mg/dL',
    riskLevel: 'Medium',
    lastVisit: 'Oct 21, 2025',
    nextFollowUp: 'Nov 21, 2025',
    followUpReason: 'BP slightly elevated',
    weight: '66 kg',
    height: '160 cm',
    bmi: '25.8',
    currentMedications: [
      { name: 'Amlodipine', dosage: '5mg 1x daily' }
    ],
    familyHistory: 'Mother had hypertension'
  },
  {
    id: 'JAG-000134',
    firstName: 'Jose',
    middleName: 'Santos',
    lastName: 'Cruz',
    name: 'Jose Santos Cruz',
    dateOfBirth: '11/11/1963',
    age: 62,
    sex: 'Male',
    barangay: 'Larapan',
    purok: 'Purok 1',
    contact: '+63 915 111 2222',
    address: 'Purok 1, Larapan',
    occupation: 'Farmer / Agricultural Worker',
    education: 'Elementary',
    maritalStatus: 'Married',
    conditions: ['Hypertension', 'Diabetes Mellitus Type 2'],
    latestBP: '135/86',
    latestRBS: '135 mg/dL',
    riskLevel: 'Medium',
    lastVisit: 'Oct 24, 2025',
    nextFollowUp: 'Nov 24, 2025',
    followUpReason: 'Regular follow-up',
    weight: '78 kg',
    height: '172 cm',
    bmi: '26.4',
    currentMedications: [
      { name: 'Metformin', dosage: '500mg 2x daily' },
      { name: 'Losartan', dosage: '50mg 1x daily' }
    ],
    familyHistory: 'Brother has diabetes'
  },
  {
    id: 'JAG-000135',
    firstName: 'Cristina',
    middleName: 'Flores',
    lastName: 'Mendez',
    name: 'Cristina Flores Mendez',
    dateOfBirth: '28/05/1974',
    age: 51,
    sex: 'Female',
    barangay: 'Larapan',
    purok: 'Purok 3',
    contact: '+63 916 333 4444',
    address: 'Purok 3, Larapan',
    occupation: 'Vendor / Market Trader',
    education: 'High School',
    maritalStatus: 'Married',
    conditions: ['Diabetes Mellitus Type 2'],
    latestBP: '118/78',
    latestRBS: '118 mg/dL',
    riskLevel: 'Low',
    lastVisit: 'Oct 26, 2025',
    nextFollowUp: 'Dec 26, 2025',
    followUpReason: 'Doing well, routine check',
    weight: '62 kg',
    height: '156 cm',
    bmi: '25.5',
    currentMedications: [
      { name: 'Metformin', dosage: '500mg 2x daily' }
    ],
    familyHistory: 'Father had diabetes'
  },
  {
    id: 'JAG-000136',
    firstName: 'Manuel',
    middleName: 'Reyes',
    lastName: 'Valencia',
    name: 'Manuel Reyes Valencia',
    dateOfBirth: '12/03/1966',
    age: 59,
    sex: 'Male',
    barangay: 'Alejawan',
    purok: 'Purok 2',
    contact: '+63 915 444 5555',
    address: 'Purok 2, Alejawan',
    occupation: 'Tricycle Driver',
    education: 'Elementary',
    maritalStatus: 'Married',
    conditions: ['Hypertension'],
    latestBP: '165/100',
    latestRBS: '110 mg/dL',
    riskLevel: 'High',
    lastVisit: 'Oct 14, 2025',
    nextFollowUp: 'Nov 14, 2025',
    followUpReason: 'Uncontrolled HTN, stage 2',
    weight: '82 kg',
    height: '168 cm',
    bmi: '29.0',
    currentMedications: [
      { name: 'Amlodipine', dosage: '10mg 1x daily' },
      { name: 'Losartan', dosage: '100mg 1x daily' }
    ],
    familyHistory: 'Father died of heart attack'
  },
  {
    id: 'JAG-000137',
    firstName: 'Teresa',
    middleName: 'Santos',
    lastName: 'Aguirre',
    name: 'Teresa Santos Aguirre',
    dateOfBirth: '25/08/1973',
    age: 52,
    sex: 'Female',
    barangay: 'Balili',
    purok: 'Purok 1',
    contact: '+63 920 777 6666',
    address: 'Purok 1, Balili',
    occupation: 'Homemaker / Housewife',
    education: 'High School',
    maritalStatus: 'Married',
    conditions: ['Diabetes Mellitus Type 2'],
    latestBP: '128/82',
    latestRBS: '148 mg/dL',
    riskLevel: 'Medium',
    lastVisit: 'Oct 17, 2025',
    weight: '69 kg',
    height: '159 cm',
    bmi: '27.3',
    currentMedications: [
      { name: 'Metformin', dosage: '750mg 2x daily' }
    ],
    familyHistory: 'Mother has diabetes'
  },
  {
    id: 'JAG-000138',
    firstName: 'Benjamin',
    middleName: 'Cruz',
    lastName: 'Villanueva',
    name: 'Benjamin Cruz Villanueva',
    dateOfBirth: '09/01/1960',
    age: 65,
    sex: 'Male',
    barangay: 'Boctol',
    purok: 'Purok 3',
    contact: '+63 918 888 7777',
    address: 'Purok 3, Boctol',
    occupation: 'Farmer / Agricultural Worker',
    education: 'Elementary',
    maritalStatus: 'Married',
    conditions: ['Hypertension', 'Diabetes Mellitus Type 2'],
    latestBP: '174/108',
    latestRBS: '238 mg/dL',
    riskLevel: 'Very High',
    lastVisit: 'Oct 11, 2025',
    nextFollowUp: 'Nov 4, 2025',
    followUpReason: 'Very high BP and RBS, emergency review',
    weight: '87 kg',
    height: '170 cm',
    bmi: '30.1',
    currentMedications: [
      { name: 'Metformin', dosage: '1000mg 2x daily' },
      { name: 'Glimepiride', dosage: '4mg 1x daily' },
      { name: 'Amlodipine', dosage: '10mg 1x daily' },
      { name: 'Hydrochlorothiazide', dosage: '12.5mg 1x daily' }
    ],
    familyHistory: 'Both parents had diabetes and hypertension'
  },
  {
    id: 'JAG-000139',
    firstName: 'Gloria',
    middleName: 'Martinez',
    lastName: 'Reyes',
    name: 'Gloria Martinez Reyes',
    dateOfBirth: '30/04/1971',
    age: 54,
    sex: 'Female',
    barangay: 'Buyog',
    purok: 'Purok 2',
    contact: '+63 917 999 8888',
    address: 'Purok 2, Buyog',
    occupation: 'Vendor / Market Trader',
    education: 'High School',
    maritalStatus: 'Widowed',
    conditions: ['Diabetes Mellitus Type 2'],
    latestBP: '142/88',
    latestRBS: '195 mg/dL',
    riskLevel: 'High',
    lastVisit: 'Oct 16, 2025',
    nextFollowUp: 'Nov 6, 2025',
    followUpReason: 'Elevated blood sugar',
    weight: '75 kg',
    height: '155 cm',
    bmi: '31.2',
    currentMedications: [
      { name: 'Metformin', dosage: '850mg 2x daily' },
      { name: 'Glimepiride', dosage: '2mg 1x daily' }
    ],
    familyHistory: 'Sister has diabetes'
  },
  {
    id: 'JAG-000140',
    firstName: 'Fernando',
    middleName: 'Garcia',
    lastName: 'Santos',
    name: 'Fernando Garcia Santos',
    dateOfBirth: '17/06/1969',
    age: 56,
    sex: 'Male',
    barangay: 'Bunga Ilaya',
    purok: 'Purok 4',
    contact: '+63 916 555 4444',
    address: 'Purok 4, Bunga Ilaya',
    occupation: 'Fisherman / Fish Vendor',
    education: 'Elementary',
    maritalStatus: 'Married',
    conditions: ['Hypertension'],
    latestBP: '152/94',
    latestRBS: '105 mg/dL',
    riskLevel: 'High',
    lastVisit: 'Oct 20, 2025',
    nextFollowUp: 'Nov 10, 2025',
    followUpReason: 'Elevated BP needs monitoring',
    weight: '76 kg',
    height: '167 cm',
    bmi: '27.3',
    currentMedications: [
      { name: 'Losartan', dosage: '100mg 1x daily' }
    ],
    familyHistory: 'Father had hypertension'
  },
  {
    id: 'JAG-000141',
    firstName: 'Lourdes',
    middleName: 'Fernandez',
    lastName: 'Diaz',
    name: 'Lourdes Fernandez Diaz',
    dateOfBirth: '21/10/1964',
    age: 61,
    sex: 'Female',
    barangay: 'Bunga Mar',
    purok: 'Purok 1',
    contact: '+63 919 222 1111',
    address: 'Purok 1, Bunga Mar',
    occupation: 'Homemaker / Housewife',
    education: 'Elementary',
    maritalStatus: 'Married',
    conditions: ['Diabetes Mellitus Type 2', 'Hypertension'],
    latestBP: '160/98',
    latestRBS: '220 mg/dL',
    riskLevel: 'High',
    lastVisit: 'Oct 9, 2025',
    nextFollowUp: 'Nov 2, 2025',
    followUpReason: 'Poor control of both HTN and DM',
    weight: '78 kg',
    height: '157 cm',
    bmi: '31.6',
    currentMedications: [
      { name: 'Metformin', dosage: '1000mg 2x daily' },
      { name: 'Amlodipine', dosage: '5mg 1x daily' }
    ],
    familyHistory: 'Mother and father both had diabetes'
  },
  {
    id: 'JAG-000142',
    firstName: 'Roberto',
    middleName: 'Mendoza',
    lastName: 'Cruz',
    name: 'Roberto Mendoza Cruz',
    dateOfBirth: '14/12/1968',
    age: 56,
    sex: 'Male',
    barangay: 'Mayana',
    purok: 'Purok 5',
    contact: '+63 915 333 2222',
    address: 'Purok 5, Mayana',
    occupation: 'Farmer / Agricultural Worker',
    education: 'Elementary',
    maritalStatus: 'Married',
    conditions: ['Hypertension'],
    latestBP: '135/87',
    latestRBS: '100 mg/dL',
    riskLevel: 'Medium',
    lastVisit: 'Oct 22, 2025',
    weight: '72 kg',
    height: '169 cm',
    bmi: '25.2',
    currentMedications: [
      { name: 'Losartan', dosage: '50mg 1x daily' }
    ],
    familyHistory: 'No known family history'
  },
  {
    id: 'JAG-000143',
    firstName: 'Josefa',
    middleName: 'Lopez',
    lastName: 'Bautista',
    name: 'Josefa Lopez Bautista',
    dateOfBirth: '08/05/1972',
    age: 53,
    sex: 'Female',
    barangay: 'Looc',
    purok: 'Purok 2',
    contact: '+63 920 666 5555',
    address: 'Purok 2, Looc',
    occupation: 'Vendor / Market Trader',
    education: 'High School',
    maritalStatus: 'Married',
    conditions: ['Diabetes Mellitus Type 2'],
    latestBP: '138/86',
    latestRBS: '172 mg/dL',
    riskLevel: 'Medium',
    lastVisit: 'Oct 18, 2025',
    nextFollowUp: 'Nov 18, 2025',
    followUpReason: 'Monitor blood sugar control',
    weight: '67 kg',
    height: '158 cm',
    bmi: '26.8',
    currentMedications: [
      { name: 'Metformin', dosage: '500mg 2x daily' }
    ],
    familyHistory: 'Sister has diabetes'
  },
  {
    id: 'JAG-000144',
    firstName: 'Alberto',
    middleName: 'Ramos',
    lastName: 'Garcia',
    name: 'Alberto Ramos Garcia',
    dateOfBirth: '26/02/1961',
    age: 64,
    sex: 'Male',
    barangay: 'Tejero',
    purok: 'Purok 3',
    contact: '+63 918 111 0000',
    address: 'Purok 3, Tejero',
    occupation: 'Fisherman / Fish Vendor',
    education: 'Elementary',
    maritalStatus: 'Married',
    conditions: ['Hypertension', 'Diabetes Mellitus Type 2'],
    latestBP: '178/110',
    latestRBS: '255 mg/dL',
    riskLevel: 'Very High',
    lastVisit: 'Oct 7, 2025',
    nextFollowUp: 'Oct 31, 2025',
    followUpReason: 'Critical levels, urgent follow-up needed',
    weight: '84 kg',
    height: '166 cm',
    bmi: '30.5',
    currentMedications: [
      { name: 'Metformin', dosage: '1000mg 2x daily' },
      { name: 'Glimepiride', dosage: '4mg 1x daily' },
      { name: 'Amlodipine', dosage: '10mg 1x daily' },
      { name: 'Losartan', dosage: '100mg 1x daily' }
    ],
    familyHistory: 'Father died of stroke, mother has diabetes'
  },
  {
    id: 'JAG-000145',
    firstName: 'Carmen',
    middleName: 'Torres',
    lastName: 'Mendez',
    name: 'Carmen Torres Mendez',
    dateOfBirth: '19/07/1970',
    age: 55,
    sex: 'Female',
    barangay: 'Pagina',
    purok: 'Purok 1',
    contact: '+63 917 444 3333',
    address: 'Purok 1, Pagina',
    occupation: 'Homemaker / Housewife',
    education: 'High School',
    maritalStatus: 'Married',
    conditions: ['Diabetes Mellitus Type 2'],
    latestBP: '132/84',
    latestRBS: '158 mg/dL',
    riskLevel: 'Medium',
    lastVisit: 'Oct 19, 2025',
    nextFollowUp: 'Nov 19, 2025',
    followUpReason: 'Routine monitoring',
    weight: '70 kg',
    height: '160 cm',
    bmi: '27.3',
    currentMedications: [
      { name: 'Metformin', dosage: '750mg 2x daily' }
    ],
    familyHistory: 'Brother has diabetes'
  },
  {
    id: 'JAG-000146',
    firstName: 'Eduardo',
    middleName: 'Silva',
    lastName: 'Reyes',
    name: 'Eduardo Silva Reyes',
    dateOfBirth: '03/11/1967',
    age: 58,
    sex: 'Male',
    barangay: 'Poblacion (Pondol)',
    purok: 'Purok 5',
    contact: '+63 916 888 7777',
    address: 'Purok 5, Poblacion',
    occupation: 'Tricycle Driver',
    education: 'Elementary',
    maritalStatus: 'Married',
    conditions: ['Hypertension'],
    latestBP: '148/92',
    latestRBS: '108 mg/dL',
    riskLevel: 'Medium',
    lastVisit: 'Oct 21, 2025',
    nextFollowUp: 'Nov 21, 2025',
    followUpReason: 'BP slightly elevated',
    weight: '79 kg',
    height: '171 cm',
    bmi: '27.0',
    currentMedications: [
      { name: 'Amlodipine', dosage: '5mg 1x daily' }
    ],
    familyHistory: 'Mother had hypertension'
  },
  {
    id: 'JAG-000147',
    firstName: 'Beatriz',
    middleName: 'Castro',
    lastName: 'Santos',
    name: 'Beatriz Castro Santos',
    dateOfBirth: '15/09/1965',
    age: 60,
    sex: 'Female',
    barangay: 'Naatang',
    purok: 'Purok 6',
    contact: '+63 919 555 4444',
    address: 'Purok 6, Naatang',
    occupation: 'Vendor / Market Trader',
    education: 'High School',
    maritalStatus: 'Widowed',
    conditions: ['Hypertension', 'Diabetes Mellitus Type 2'],
    latestBP: '156/96',
    latestRBS: '205 mg/dL',
    riskLevel: 'High',
    lastVisit: 'Oct 13, 2025',
    nextFollowUp: 'Nov 3, 2025',
    followUpReason: 'Uncontrolled HTN and DM',
    weight: '73 kg',
    height: '156 cm',
    bmi: '30.0',
    currentMedications: [
      { name: 'Metformin', dosage: '850mg 2x daily' },
      { name: 'Losartan', dosage: '100mg 1x daily' }
    ],
    familyHistory: 'Sister has diabetes, brother had stroke'
  },
  {
    id: 'JAG-000148',
    firstName: 'Miguel',
    middleName: 'Perez',
    lastName: 'Flores',
    name: 'Miguel Perez Flores',
    dateOfBirth: '28/01/1963',
    age: 62,
    sex: 'Male',
    barangay: 'Cantagay',
    purok: 'Purok 6',
    contact: '+63 920 222 1111',
    address: 'Purok 6, Cantagay',
    occupation: 'Farmer / Agricultural Worker',
    education: 'Elementary',
    maritalStatus: 'Married',
    conditions: ['Diabetes Mellitus Type 2'],
    latestBP: '122/80',
    latestRBS: '135 mg/dL',
    riskLevel: 'Medium',
    lastVisit: 'Oct 24, 2025',
    weight: '74 kg',
    height: '172 cm',
    bmi: '25.0',
    currentMedications: [
      { name: 'Metformin', dosage: '500mg 2x daily' }
    ],
    familyHistory: 'Father had diabetes'
  },
  {
    id: 'JAG-000149',
    firstName: 'Rosario',
    middleName: 'Jimenez',
    lastName: 'Cruz',
    name: 'Rosario Jimenez Cruz',
    dateOfBirth: '06/03/1974',
    age: 51,
    sex: 'Female',
    barangay: 'Tubod',
    purok: 'Purok 2',
    contact: '+63 915 777 6666',
    address: 'Purok 2, Tubod',
    occupation: 'Homemaker / Housewife',
    education: 'High School',
    maritalStatus: 'Married',
    conditions: ['Hypertension'],
    latestBP: '144/90',
    latestRBS: '102 mg/dL',
    riskLevel: 'Medium',
    lastVisit: 'Oct 23, 2025',
    nextFollowUp: 'Nov 23, 2025',
    followUpReason: 'Monitor BP trends',
    weight: '68 kg',
    height: '161 cm',
    bmi: '26.2',
    currentMedications: [
      { name: 'Losartan', dosage: '50mg 1x daily' }
    ],
    familyHistory: 'Mother had hypertension'
  },
  {
    id: 'JAG-000150',
    firstName: 'Francisco',
    middleName: 'Vargas',
    lastName: 'Gutierrez',
    name: 'Francisco Vargas Gutierrez',
    dateOfBirth: '11/08/1966',
    age: 59,
    sex: 'Male',
    barangay: 'Cambugason',
    purok: 'Purok 3',
    contact: '+63 918 333 2222',
    address: 'Purok 3, Cambugason',
    occupation: 'Fisherman / Fish Vendor',
    education: 'Elementary',
    maritalStatus: 'Married',
    conditions: ['Hypertension', 'Diabetes Mellitus Type 2'],
    latestBP: '172/104',
    latestRBS: '242 mg/dL',
    riskLevel: 'Very High',
    lastVisit: 'Oct 10, 2025',
    nextFollowUp: 'Nov 1, 2025',
    followUpReason: 'Very high levels, poor medication compliance',
    weight: '81 kg',
    height: '168 cm',
    bmi: '28.7',
    currentMedications: [
      { name: 'Metformin', dosage: '1000mg 2x daily' },
      { name: 'Glimepiride', dosage: '4mg 1x daily' },
      { name: 'Amlodipine', dosage: '10mg 1x daily' },
      { name: 'Atenolol', dosage: '50mg 1x daily' }
    ],
    familyHistory: 'Both parents had hypertension and diabetes'
  },
  {
    id: 'JAG-000151',
    firstName: 'Angelina',
    middleName: 'Navarro',
    lastName: 'Martinez',
    name: 'Angelina Navarro Martinez',
    dateOfBirth: '23/04/1969',
    age: 56,
    sex: 'Female',
    barangay: 'Larapan',
    purok: 'Purok 4',
    contact: '+63 917 666 5555',
    address: 'Purok 4, Larapan',
    occupation: 'Vendor / Market Trader',
    education: 'High School',
    maritalStatus: 'Married',
    conditions: ['Diabetes Mellitus Type 2'],
    latestBP: '128/82',
    latestRBS: '142 mg/dL',
    riskLevel: 'Medium',
    lastVisit: 'Oct 20, 2025',
    weight: '71 kg',
    height: '159 cm',
    bmi: '28.1',
    currentMedications: [
      { name: 'Metformin', dosage: '750mg 2x daily' }
    ],
    familyHistory: 'Mother has diabetes'
  },
  {
    id: 'JAG-000152',
    firstName: 'Rodrigo',
    middleName: 'Herrera',
    lastName: 'Diaz',
    name: 'Rodrigo Herrera Diaz',
    dateOfBirth: '01/10/1962',
    age: 63,
    sex: 'Male',
    barangay: 'Alejawan',
    purok: 'Purok 3',
    contact: '+63 916 999 8888',
    address: 'Purok 3, Alejawan',
    occupation: 'Farmer / Agricultural Worker',
    education: 'Elementary',
    maritalStatus: 'Married',
    conditions: ['Hypertension'],
    latestBP: '140/88',
    latestRBS: '98 mg/dL',
    riskLevel: 'Medium',
    lastVisit: 'Oct 25, 2025',
    nextFollowUp: 'Nov 25, 2025',
    followUpReason: 'Routine BP check',
    weight: '77 kg',
    height: '170 cm',
    bmi: '26.6',
    currentMedications: [
      { name: 'Amlodipine', dosage: '5mg 1x daily' }
    ],
    familyHistory: 'Father had hypertension'
  },
  {
    id: 'JAG-000153',
    firstName: 'Dolores',
    middleName: 'Morales',
    lastName: 'Valencia',
    name: 'Dolores Morales Valencia',
    dateOfBirth: '17/06/1971',
    age: 54,
    sex: 'Female',
    barangay: 'Balili',
    purok: 'Purok 4',
    contact: '+63 919 444 3333',
    address: 'Purok 4, Balili',
    occupation: 'Homemaker / Housewife',
    education: 'Elementary',
    maritalStatus: 'Widowed',
    conditions: ['Diabetes Mellitus Type 2', 'Hypertension'],
    latestBP: '166/102',
    latestRBS: '228 mg/dL',
    riskLevel: 'High',
    lastVisit: 'Oct 12, 2025',
    nextFollowUp: 'Nov 2, 2025',
    followUpReason: 'High BP and blood sugar, medication review',
    weight: '76 kg',
    height: '154 cm',
    bmi: '32.1',
    currentMedications: [
      { name: 'Metformin', dosage: '850mg 2x daily' },
      { name: 'Glimepiride', dosage: '2mg 1x daily' },
      { name: 'Losartan', dosage: '100mg 1x daily' }
    ],
    familyHistory: 'Mother and sister both have diabetes'
  },
  {
    id: 'JAG-000154',
    firstName: 'Gregorio',
    middleName: 'Campos',
    lastName: 'Reyes',
    name: 'Gregorio Campos Reyes',
    dateOfBirth: '29/12/1964',
    age: 60,
    sex: 'Male',
    barangay: 'Boctol',
    purok: 'Purok 1',
    contact: '+63 920 111 0000',
    address: 'Purok 1, Boctol',
    occupation: 'Tricycle Driver',
    education: 'Elementary',
    maritalStatus: 'Married',
    conditions: ['Hypertension'],
    latestBP: '138/86',
    latestRBS: '104 mg/dL',
    riskLevel: 'Medium',
    lastVisit: 'Oct 26, 2025',
    weight: '75 kg',
    height: '169 cm',
    bmi: '26.3',
    currentMedications: [
      { name: 'Losartan', dosage: '50mg 1x daily' }
    ],
    familyHistory: 'No known family history'
  },
  {
    id: 'JAG-000155',
    firstName: 'Victoria',
    middleName: 'Santos',
    lastName: 'Ortega',
    name: 'Victoria Santos Ortega',
    dateOfBirth: '08/02/1968',
    age: 57,
    sex: 'Female',
    barangay: 'Buyog',
    purok: 'Purok 5',
    contact: '+63 915 888 7777',
    address: 'Purok 5, Buyog',
    occupation: 'Vendor / Market Trader',
    education: 'High School',
    maritalStatus: 'Married',
    conditions: ['Diabetes Mellitus Type 2'],
    latestBP: '134/84',
    latestRBS: '165 mg/dL',
    riskLevel: 'Medium',
    lastVisit: 'Oct 21, 2025',
    nextFollowUp: 'Nov 21, 2025',
    followUpReason: 'Monitor blood sugar trends',
    weight: '69 kg',
    height: '158 cm',
    bmi: '27.6',
    currentMedications: [
      { name: 'Metformin', dosage: '500mg 2x daily' }
    ],
    familyHistory: 'Father had diabetes'
  },
  {
    id: 'JAG-000156',
    firstName: 'Emilio',
    middleName: 'Gutierrez',
    lastName: 'Fernandez',
    name: 'Emilio Gutierrez Fernandez',
    dateOfBirth: '14/05/1960',
    age: 65,
    sex: 'Male',
    barangay: 'Bunga Ilaya',
    purok: 'Purok 1',
    contact: '+63 918 777 6666',
    address: 'Purok 1, Bunga Ilaya',
    occupation: 'Fisherman / Fish Vendor',
    education: 'Elementary',
    maritalStatus: 'Married',
    conditions: ['Hypertension', 'Diabetes Mellitus Type 2'],
    latestBP: '180/112',
    latestRBS: '268 mg/dL',
    riskLevel: 'Very High',
    lastVisit: 'Oct 6, 2025',
    nextFollowUp: 'Oct 30, 2025',
    followUpStatus: 'overdue',
    followUpReason: 'Critical condition, urgent care needed',
    weight: '83 kg',
    height: '165 cm',
    bmi: '30.5',
    currentMedications: [
      { name: 'Metformin', dosage: '1000mg 2x daily' },
      { name: 'Insulin', dosage: '10 units before meals' },
      { name: 'Amlodipine', dosage: '10mg 1x daily' },
      { name: 'Losartan', dosage: '100mg 1x daily' },
      { name: 'Hydrochlorothiazide', dosage: '25mg 1x daily' }
    ],
    familyHistory: 'Father died of heart disease, mother has diabetes'
  },
  {
    id: 'JAG-000157',
    firstName: 'Amparo',
    middleName: 'Rodriguez',
    lastName: 'Silva',
    name: 'Amparo Rodriguez Silva',
    dateOfBirth: '20/11/1973',
    age: 52,
    sex: 'Female',
    barangay: 'Bunga Mar',
    purok: 'Purok 3',
    contact: '+63 917 555 4444',
    address: 'Purok 3, Bunga Mar',
    occupation: 'Homemaker / Housewife',
    education: 'High School',
    maritalStatus: 'Married',
    conditions: ['Diabetes Mellitus Type 2'],
    latestBP: '126/80',
    latestRBS: '152 mg/dL',
    riskLevel: 'Medium',
    lastVisit: 'Oct 22, 2025',
    weight: '72 kg',
    height: '160 cm',
    bmi: '28.1',
    currentMedications: [
      { name: 'Metformin', dosage: '750mg 2x daily' }
    ],
    familyHistory: 'Brother has diabetes'
  },
  {
    id: 'JAG-000158',
    firstName: 'Domingo',
    middleName: 'Castillo',
    lastName: 'Lopez',
    name: 'Domingo Castillo Lopez',
    dateOfBirth: '04/09/1967',
    age: 58,
    sex: 'Male',
    barangay: 'Mayana',
    purok: 'Purok 2',
    contact: '+63 916 333 2222',
    address: 'Purok 2, Mayana',
    occupation: 'Farmer / Agricultural Worker',
    education: 'Elementary',
    maritalStatus: 'Married',
    conditions: ['Hypertension'],
    latestBP: '132/84',
    latestRBS: '96 mg/dL',
    riskLevel: 'Low',
    lastVisit: 'Oct 27, 2025',
    weight: '74 kg',
    height: '171 cm',
    bmi: '25.3',
    currentMedications: [
      { name: 'Losartan', dosage: '50mg 1x daily' }
    ],
    familyHistory: 'Mother had hypertension'
  },
  {
    id: 'JAG-000159',
    firstName: 'Milagros',
    middleName: 'Aguilar',
    lastName: 'Mendoza',
    name: 'Milagros Aguilar Mendoza',
    dateOfBirth: '12/07/1970',
    age: 55,
    sex: 'Female',
    barangay: 'Looc',
    purok: 'Purok 4',
    contact: '+63 919 222 1111',
    address: 'Purok 4, Looc',
    occupation: 'Vendor / Market Trader',
    education: 'High School',
    maritalStatus: 'Widowed',
    conditions: ['Diabetes Mellitus Type 2', 'Hypertension'],
    latestBP: '158/94',
    latestRBS: '212 mg/dL',
    riskLevel: 'High',
    lastVisit: 'Oct 15, 2025',
    nextFollowUp: 'Nov 5, 2025',
    followUpReason: 'Elevated BP and blood sugar',
    weight: '77 kg',
    height: '157 cm',
    bmi: '31.2',
    currentMedications: [
      { name: 'Metformin', dosage: '850mg 2x daily' },
      { name: 'Amlodipine', dosage: '5mg 1x daily' }
    ],
    familyHistory: 'Both parents had diabetes'
  },
  {
    id: 'JAG-000160',
    firstName: 'Alfredo',
    middleName: 'Ramos',
    lastName: 'Torres',
    name: 'Alfredo Ramos Torres',
    dateOfBirth: '26/03/1965',
    age: 60,
    sex: 'Male',
    barangay: 'Tejero',
    purok: 'Purok 5',
    contact: '+63 920 666 5555',
    address: 'Purok 5, Tejero',
    occupation: 'Fisherman / Fish Vendor',
    education: 'Elementary',
    maritalStatus: 'Married',
    conditions: ['Hypertension'],
    latestBP: '146/90',
    latestRBS: '106 mg/dL',
    riskLevel: 'Medium',
    lastVisit: 'Oct 24, 2025',
    nextFollowUp: 'Nov 24, 2025',
    followUpReason: 'Monitor BP',
    weight: '78 kg',
    height: '168 cm',
    bmi: '27.6',
    currentMedications: [
      { name: 'Amlodipine', dosage: '5mg 1x daily' }
    ],
    familyHistory: 'Father had hypertension'
  },
  {
    id: 'JAG-000161',
    firstName: 'Esperanza',
    middleName: 'Del Rosario',
    lastName: 'Bautista',
    name: 'Esperanza Del Rosario Bautista',
    dateOfBirth: '19/01/1972',
    age: 53,
    sex: 'Female',
    barangay: 'Pagina',
    purok: 'Purok 3',
    contact: '+63 915 444 3333',
    address: 'Purok 3, Pagina',
    occupation: 'Homemaker / Housewife',
    education: 'High School',
    maritalStatus: 'Married',
    conditions: ['Diabetes Mellitus Type 2'],
    latestBP: '130/82',
    latestRBS: '168 mg/dL',
    riskLevel: 'Medium',
    lastVisit: 'Oct 19, 2025',
    nextFollowUp: 'Nov 19, 2025',
    followUpReason: 'Monitor blood sugar',
    weight: '70 kg',
    height: '159 cm',
    bmi: '27.7',
    currentMedications: [
      { name: 'Metformin', dosage: '500mg 2x daily' }
    ],
    familyHistory: 'Mother has diabetes'
  },
  {
    id: 'JAG-000162',
    firstName: 'Vicente',
    middleName: 'Pascual',
    lastName: 'Santos',
    name: 'Vicente Pascual Santos',
    dateOfBirth: '07/08/1963',
    age: 62,
    sex: 'Male',
    barangay: 'Poblacion (Pondol)',
    purok: 'Purok 8',
    contact: '+63 918 777 6666',
    address: 'Purok 8, Poblacion',
    occupation: 'Tricycle Driver',
    education: 'Elementary',
    maritalStatus: 'Married',
    conditions: ['Hypertension', 'Diabetes Mellitus Type 2'],
    latestBP: '164/98',
    latestRBS: '224 mg/dL',
    riskLevel: 'High',
    lastVisit: 'Oct 11, 2025',
    nextFollowUp: 'Nov 1, 2025',
    followUpReason: 'Uncontrolled HTN and DM',
    weight: '80 kg',
    height: '167 cm',
    bmi: '28.7',
    currentMedications: [
      { name: 'Metformin', dosage: '1000mg 2x daily' },
      { name: 'Glimepiride', dosage: '2mg 1x daily' },
      { name: 'Amlodipine', dosage: '10mg 1x daily' }
    ],
    familyHistory: 'Father had diabetes and hypertension'
  },
  {
    id: 'JAG-000163',
    firstName: 'Remedios',
    middleName: 'Cruz',
    lastName: 'Garcia',
    name: 'Remedios Cruz Garcia',
    dateOfBirth: '15/12/1969',
    age: 55,
    sex: 'Female',
    barangay: 'Naatang',
    purok: 'Purok 2',
    contact: '+63 917 888 7777',
    address: 'Purok 2, Naatang',
    occupation: 'Vendor / Market Trader',
    education: 'High School',
    maritalStatus: 'Married',
    conditions: ['Hypertension'],
    latestBP: '150/92',
    latestRBS: '102 mg/dL',
    riskLevel: 'High',
    lastVisit: 'Oct 16, 2025',
    nextFollowUp: 'Nov 6, 2025',
    followUpReason: 'Elevated BP despite medication',
    weight: '71 kg',
    height: '158 cm',
    bmi: '28.4',
    currentMedications: [
      { name: 'Losartan', dosage: '100mg 1x daily' }
    ],
    familyHistory: 'Mother had hypertension'
  },
  {
    id: 'JAG-000164',
    firstName: 'Ernesto',
    middleName: 'Velasco',
    lastName: 'Diaz',
    name: 'Ernesto Velasco Diaz',
    dateOfBirth: '22/04/1961',
    age: 64,
    sex: 'Male',
    barangay: 'Cantagay',
    purok: 'Purok 7',
    contact: '+63 916 999 8888',
    address: 'Purok 7, Cantagay',
    occupation: 'Farmer / Agricultural Worker',
    education: 'Elementary',
    maritalStatus: 'Married',
    conditions: ['Diabetes Mellitus Type 2'],
    latestBP: '124/78',
    latestRBS: '128 mg/dL',
    riskLevel: 'Low',
    lastVisit: 'Oct 28, 2025',
    weight: '73 kg',
    height: '170 cm',
    bmi: '25.3',
    currentMedications: [
      { name: 'Metformin', dosage: '500mg 2x daily' }
    ],
    familyHistory: 'Sister has diabetes'
  },
  {
    id: 'JAG-000165',
    firstName: 'Consuelo',
    middleName: 'Martinez',
    lastName: 'Reyes',
    name: 'Consuelo Martinez Reyes',
    dateOfBirth: '10/06/1975',
    age: 50,
    sex: 'Female',
    barangay: 'Tubod',
    purok: 'Purok 6',
    contact: '+63 919 555 4444',
    address: 'Purok 6, Tubod',
    occupation: 'Homemaker / Housewife',
    education: 'High School',
    maritalStatus: 'Married',
    conditions: ['Hypertension'],
    latestBP: '136/86',
    latestRBS: '100 mg/dL',
    riskLevel: 'Low',
    lastVisit: 'Oct 29, 2025',
    weight: '66 kg',
    height: '160 cm',
    bmi: '25.8',
    currentMedications: [
      { name: 'Losartan', dosage: '50mg 1x daily' }
    ],
    familyHistory: 'Father had hypertension'
  }
];

const barangayFollowUps = [
  { 
    barangay: 'Poblacion (Pondol)', 
    highRisk: 8, 
    followUp: 12,
    dmPatients: 45,
    htnPatients: 62,
    totalPopulation: 3250,
    patientsRegistered: 245,
    villageHead: 'Maria Santos',
    villageHeadContact: '+63 912 345 6789'
  },
  { 
    barangay: 'Naatang', 
    highRisk: 5, 
    followUp: 9,
    dmPatients: 32,
    htnPatients: 48,
    totalPopulation: 2180,
    patientsRegistered: 168,
    villageHead: 'Carlos Mendoza',
    villageHeadContact: '+63 918 765 4321'
  },
  { 
    barangay: 'Cantagay', 
    highRisk: 6, 
    followUp: 11,
    dmPatients: 38,
    htnPatients: 55,
    totalPopulation: 2890,
    patientsRegistered: 203,
    villageHead: 'Rosa Garcia',
    villageHeadContact: '+63 920 123 4567'
  },
  { 
    barangay: 'Tubod', 
    highRisk: 4, 
    followUp: 8,
    dmPatients: 28,
    htnPatients: 42,
    totalPopulation: 2450,
    patientsRegistered: 152,
    villageHead: 'Juan dela Cruz',
    villageHeadContact: '+63 917 234 5678'
  },
  { 
    barangay: 'Can-ipol', 
    highRisk: 7, 
    followUp: 10,
    dmPatients: 35,
    htnPatients: 51,
    totalPopulation: 2670,
    patientsRegistered: 186,
    villageHead: 'Linda Ramos',
    villageHeadContact: '+63 919 876 5432'
  },
  { 
    barangay: 'Cambugason', 
    highRisk: 3, 
    followUp: 6,
    dmPatients: 22,
    htnPatients: 34,
    totalPopulation: 1890,
    patientsRegistered: 125,
    villageHead: 'Pedro Santos',
    villageHeadContact: '+63 920 345 6789'
  },
  { 
    barangay: 'Cabungaan', 
    highRisk: 9, 
    followUp: 15,
    dmPatients: 52,
    htnPatients: 68,
    totalPopulation: 3580,
    patientsRegistered: 278,
    villageHead: 'Gloria Martinez',
    villageHeadContact: '+63 915 678 9012'
  },
  { 
    barangay: 'Lonoy', 
    highRisk: 5, 
    followUp: 7,
    dmPatients: 29,
    htnPatients: 45,
    totalPopulation: 2150,
    patientsRegistered: 142,
    villageHead: 'Antonio Reyes',
    villageHeadContact: '+63 918 234 5678'
  },
  { 
    barangay: 'Malbog', 
    highRisk: 6, 
    followUp: 9,
    dmPatients: 33,
    htnPatients: 47,
    totalPopulation: 2340,
    patientsRegistered: 165,
    villageHead: 'Carmen Flores',
    villageHeadContact: '+63 917 890 1234'
  },
  { 
    barangay: 'Pagina', 
    highRisk: 4, 
    followUp: 8,
    dmPatients: 26,
    htnPatients: 39,
    totalPopulation: 2020,
    patientsRegistered: 138,
    villageHead: 'Roberto Cruz',
    villageHeadContact: '+63 919 456 7890'
  },
];

function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('login');
  const [showSideMenu, setShowSideMenu] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [selectedLanguage, setSelectedLanguage] = useState<'EN' | 'CEB' | 'TL'>('EN');
  const [showSyncDialog, setShowSyncDialog] = useState(false);
  const [syncSuccess, setSyncSuccess] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [navigationHistory, setNavigationHistory] = useState<Screen[]>(['login']);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [patientsLoading, setPatientsLoading] = useState(false);
  const [patientsError, setPatientsError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [newPatientId, setNewPatientId] = useState<string | null>(null);
  const [lastSyncTime, setLastSyncTime] = useState<Date>(new Date());
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<any>(null);
  const [pendingSyncCount, setPendingSyncCount] = useState(() => loadPendingVisits().length);
  const [searchHistory, setSearchHistory] = useState<string[]>(['Ana Maria Reyes', 'Carlos Santos']);
  const [isPullingToRefresh, setIsPullingToRefresh] = useState(false);
  const pullStartY = useRef(0);
  const [pullDistance, setPullDistance] = useState(0);
  
  // New UX features
  const [showPreSyncDialog, setShowPreSyncDialog] = useState(false);
  const [showSMSDialog, setShowSMSDialog] = useState(false);
  const [smsPatient, setSmsPatient] = useState<Patient | null>(null);
  const [showDuplicateAlert, setShowDuplicateAlert] = useState(false);
  const [duplicatePatients, setDuplicatePatients] = useState<Patient[]>([]);
  const [vitalWarning, setVitalWarning] = useState<string>('');
  
  const pendingSyncData = useMemo(() => ({
    newPatients: 0,
    newVisits: pendingSyncCount,
    updates: 0,
    deletions: 0
  }), [pendingSyncCount]);

  const parseDateValue = (value?: string) => {
    if (!value) return 0;
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.getTime();
    }
    return 0;
  };

  const mapBackendPatient = (patient: any): Patient => {
    const rawConditions: string[] = patient.conditions || [];
    const normalizedConditions = rawConditions.map((condition) => {
      if (condition === 'HTN' || condition === 'DM') return condition;
      if (condition.toLowerCase().includes('hyper')) return 'HTN';
      if (condition.toLowerCase().includes('diab')) return 'DM';
      return condition;
    });
    const riskLevel = patient.risk_level === 'Elevated' ? 'Medium' : patient.risk_level || 'Low';
    const lastVisit = patient.last_visit_date || '';
    const nextVisit = patient.next_visit_date || '';
    const nextFollowUp = nextVisit || undefined;
    const followUpStatus = nextFollowUp && parseDateValue(nextFollowUp) < Date.now() ? 'overdue' : nextFollowUp ? 'due' : undefined;
    const latestRbgValue = patient.latest_rbg ?? patient.latest_glucose;
    const latestRbsText = latestRbgValue !== undefined && latestRbgValue !== null ? String(latestRbgValue) : '';
    const currentMeds = Array.isArray(patient.current_medications)
      ? patient.current_medications.map((med: any) => ({ name: med.name, dosage: med.dosage }))
      : [];
    return {
      id: patient.patient_id,
      firstName: patient.first_name || '',
      middleName: patient.middle_name || '',
      lastName: patient.last_name || '',
      name: patient.name || `${patient.first_name || ''} ${patient.last_name || ''}`.trim(),
      dateOfBirth: patient.date_of_birth || '',
      age: patient.age || 0,
      sex: patient.sex || '',
      barangay: patient.barangay || '',
      purok: patient.purok || '',
      contact: patient.contact || '',
      address: patient.address || '',
      occupation: patient.occupation || '',
      education: patient.education || '',
      maritalStatus: patient.marital_status || '',
      conditions: normalizedConditions,
      latestBP: patient.latest_bp || '',
      latestRBS: latestRbsText,
      riskLevel: riskLevel,
      lastVisit: lastVisit,
      nextFollowUp,
      followUpStatus,
      followUpReason: patient.next_visit_reason || '',
      flaggedForFollowUp: patient.flagged_for_follow_up,
      weight: patient.weight ? String(patient.weight) : '',
      height: patient.height ? String(patient.height) : '',
      bmi: patient.bmi ? String(patient.bmi) : '',
      currentMedications: currentMeds
    };
  };

  const loadPatients = async () => {
    setPatientsLoading(true);
    setPatientsError(null);
    try {
      const response = await apiClient.getPatients({ limit: 1000 });
      const mapped = response.patients.map(mapBackendPatient);
      mapped.sort((a, b) => parseDateValue(b.lastVisit) - parseDateValue(a.lastVisit));
      setPatients(mapped);
      return mapped;
    } catch (error: any) {
      setPatientsError(error.message || 'Failed to load patients');
      return [];
    } finally {
      setPatientsLoading(false);
    }
  };

  const handleCreatePatient = async (patientData: {
    firstName: string;
    middleName?: string;
    lastName: string;
    dateOfBirth: string;
    age: number;
    sex: string;
    barangay: string;
    purok?: string;
    address: string;
    contact?: string;
    occupation?: string;
    education?: string;
    maritalStatus?: string;
    conditions?: string[];
  }) => {
    try {
      const response = await apiClient.registerPatient({
        first_name: patientData.firstName,
        middle_name: patientData.middleName,
        last_name: patientData.lastName,
        date_of_birth: patientData.dateOfBirth,
        age: patientData.age,
        sex: patientData.sex,
        barangay: patientData.barangay,
        purok: patientData.purok,
        address: patientData.address,
        contact: patientData.contact,
        occupation: patientData.occupation,
        education: patientData.education,
        marital_status: patientData.maritalStatus,
        conditions: patientData.conditions || [],
        consent_given: true
      });

      const mapped = mapBackendPatient(response);
      setSelectedPatient(mapped);
      setNewPatientId(mapped.id);
      await loadPatients();
      toast.success('Patient registered');
      return mapped;
    } catch (error: any) {
      toast.error(error.message || 'Failed to register patient');
      throw error;
    }
  };

  const recentPatients = useMemo(() => patients.slice(0, 3), [patients]);
  const highRiskCount = patients.filter((p) => p.riskLevel === 'High' || p.riskLevel === 'Very High').length;
  const dueCount = patients.filter((p) => p.followUpStatus).length;
  const newHighRiskCount = patients.filter((p) => p.riskLevel === 'Very High').length;
  const activePatient = selectedPatient || patients[0] || null;

  const navigate = (screen: Screen) => {
    setNavigationHistory(prev => [...prev, screen]);
    setCurrentScreen(screen);
    setShowSideMenu(false);
  };

  const goBack = () => {
    if (navigationHistory.length > 1) {
      const newHistory = [...navigationHistory];
      newHistory.pop();
      const previousScreen = newHistory[newHistory.length - 1];
      setNavigationHistory(newHistory);
      setCurrentScreen(previousScreen);
    }
  };

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast.success('You\'re back online!', {
        description: 'Data will sync automatically',
        icon: <Wifi className="w-4 h-4" />,
      });
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast.warning('You\'re offline', {
        description: 'Changes will be saved locally and synced when connected',
        icon: <WifiOff className="w-4 h-4" />,
        duration: 5000,
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Pull to refresh handler
  const handleTouchStart = (e: React.TouchEvent) => {
    if (window.scrollY === 0) {
      pullStartY.current = e.touches[0].clientY;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (pullStartY.current > 0) {
      const distance = e.touches[0].clientY - pullStartY.current;
      if (distance > 0 && distance < 100) {
        setPullDistance(distance);
      }
    }
  };

  const handleTouchEnd = () => {
    if (pullDistance > 60) {
      setIsPullingToRefresh(true);
      setTimeout(() => {
        setIsPullingToRefresh(false);
        setPullDistance(0);
        toast.success('Data refreshed');
      }, 1000);
    } else {
      setPullDistance(0);
    }
    pullStartY.current = 0;
  };

  const handleSync = () => {
    // Show pre-sync preview instead of immediate sync
    setShowPreSyncDialog(true);
  };
  
  const confirmSync = async () => {
    setShowPreSyncDialog(false);
    setShowSyncDialog(true);
    setIsLoading(true);
    try {
      const pendingVisits = loadPendingVisits();
      let syncedCount = 0;
      if (pendingVisits.length > 0) {
        const syncResult = await apiClient.bulkSyncVisits(pendingVisits);
        const hasErrors = (syncResult?.errors?.length || 0) > 0;
        const hasConflicts = (syncResult?.conflicts?.length || 0) > 0;
        if (!hasErrors && !hasConflicts) {
          syncedCount = syncResult?.success?.length ?? pendingVisits.length;
          clearPendingVisits();
          setPendingSyncCount(0);
        } else {
          setPendingSyncCount(pendingVisits.length);
          toast.error('Sync incomplete', {
            description: 'Some records need review before syncing',
            icon: <AlertTriangle className="w-4 h-4" />,
          });
        }
      }
      await loadPatients();
      setSyncSuccess(true);
      setLastSyncTime(new Date());
      const totalRecords = syncedCount || pendingSyncData.newPatients + pendingSyncData.newVisits + pendingSyncData.updates;
      toast.success('Sync complete!', {
        description: `${totalRecords} records synced successfully`,
        icon: <CheckCircle2 className="w-4 h-4" />,
      });
    } catch (error: any) {
      toast.error(error.message || 'Sync failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Check if sync is overdue (more than 24 hours)
  const isSyncOverdue = () => {
    const hoursSinceSync = (new Date().getTime() - lastSyncTime.getTime()) / (1000 * 60 * 60);
    return hoursSinceSync > 24;
  };

  // Format last sync time
  const getLastSyncText = () => {
    const now = new Date();
    const diffMs = now.getTime() - lastSyncTime.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  // Export data
  const handleExport = (format: 'pdf' | 'csv') => {
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 1500)),
      {
        loading: `Generating ${format.toUpperCase()}...`,
        success: `${format.toUpperCase()} exported successfully!`,
        error: 'Export failed',
        icon: <FileDown className="w-4 h-4" />,
      }
    );
  };

  // Share patient info
  const handleShare = (patient: Patient) => {
    toast.success('Sharing patient information', {
      description: `${patient.name}'s data prepared for sharing`,
      icon: <Share2 className="w-4 h-4" />,
    });
  };

  // Delete confirmation
  const confirmDelete = (item: any, itemType: string) => {
    setItemToDelete({ item, itemType });
    setShowDeleteDialog(true);
  };

  const handleDelete = () => {
    toast.success(`${itemToDelete?.itemType} deleted`, {
      description: 'You can undo this action',
      action: {
        label: 'Undo',
        onClick: () => toast.info('Action undone'),
      },
      icon: <Trash2 className="w-4 h-4" />,
    });
    setShowDeleteDialog(false);
    setItemToDelete(null);
  };

  // Breadcrumb helper
  const getBreadcrumbPath = (screen: Screen, patient?: Patient | null): { label: string; screen?: Screen }[] => {
    const paths: { [key in Screen]?: { label: string; screen?: Screen }[] } = {
      'home': [{ label: 'Home' }],
      'patients-list': [{ label: 'Home', screen: 'home' }, { label: 'Patient Registry' }],
      'patient-profile': [
        { label: 'Home', screen: 'home' },
        { label: 'Patient Registry', screen: 'patients-list' },
        { label: patient?.name || 'Patient Profile' }
      ],
      'new-visit': [{ label: 'Home', screen: 'home' }, { label: 'New Visit' }],
      'visit-information': [{ label: 'Home', screen: 'home' }, { label: 'Visit Information' }],
      'high-risk-highlights': [{ label: 'Home', screen: 'home' }, { label: 'High Risk Patients' }],
      'follow-up-patients': [{ label: 'Home', screen: 'home' }, { label: 'Follow-Up Patients' }],
      'flagged-patients': [{ label: 'Home', screen: 'home' }, { label: 'Flagged Patients' }],
      'barangay-overview': [{ label: 'Home', screen: 'home' }, { label: 'Barangay Registry' }],
      'sync-history': [{ label: 'Home', screen: 'home' }, { label: 'Sync History' }],
      'user-guide': [{ label: 'Home', screen: 'home' }, { label: 'User Guide' }],
      'new-patient': [{ label: 'Home', screen: 'home' }, { label: 'New Patient' }],
    };
    return paths[screen] || [{ label: 'Home', screen: 'home' }];
  };

  const handleLogin = async (username: string, password: string) => {
    try {
      const response = await apiClient.login(username, password);
      
      // Store user info
      localStorage.setItem('currentUser', JSON.stringify(response.user));
      setCurrentUser(response.user);
      
      // Show success toast
      toast.success(`Welcome back, ${response.user.full_name}!`);
      
      // Navigate to onboarding
      navigate('onboarding1');

      await loadPatients();
    } catch (error: any) {
      // Re-throw the error so the LoginScreen can display it
      throw new Error(error.message || 'Invalid credentials. Please try again.');
    }
  };

  useEffect(() => {
    if (currentScreen !== 'login' && currentScreen !== 'onboarding1' && currentScreen !== 'onboarding2') {
      if (!patientsLoading && patients.length === 0) {
        loadPatients();
      }
    }
  }, [currentScreen]);

  const showSyncButton = !['login', 'onboarding1', 'onboarding2', 'new-patient', 'initial-screening'].includes(currentScreen);

  // Vital signs validation
  const validateVitals = (systolic: string, diastolic: string, rbs?: string) => {
    const sys = parseInt(systolic);
    const dia = parseInt(diastolic);
    
    if (sys && dia) {
      // Check for unusual pulse pressure (difference between systolic and diastolic)
      const pulsePressure = sys - dia;
      if (pulsePressure < 25) {
        setVitalWarning(`⚠️ BP ${systolic}/${diastolic} has narrow pulse pressure - please verify reading`);
        return false;
      }
      if (pulsePressure > 100) {
        setVitalWarning(`⚠️ BP ${systolic}/${diastolic} has wide pulse pressure - please verify reading`);
        return false;
      }
      // Check if systolic is lower than diastolic
      if (sys < dia) {
        setVitalWarning(`⚠️ BP ${systolic}/${diastolic} seems incorrect - systolic cannot be lower than diastolic`);
        return false;
      }
    }
    
    if (rbs) {
      const rbsValue = parseInt(rbs);
      if (rbsValue > 600) {
        setVitalWarning(`⚠️ RBS ${rbs} mg/dL is extremely high - please verify meter reading`);
        return false;
      }
      if (rbsValue < 40) {
        setVitalWarning(`⚠️ RBS ${rbs} mg/dL is critically low - verify reading and check patient immediately`);
        return false;
      }
    }
    
    setVitalWarning('');
    return true;
  };
  
  // Check for duplicate patients
  const checkDuplicatePatient = (firstName: string, lastName: string, dateOfBirth: string) => {
    const matches = patients.filter(p => {
      const firstNameMatch = p.firstName.toLowerCase() === firstName.toLowerCase();
      const lastNameMatch = p.lastName.toLowerCase() === lastName.toLowerCase();
      const dobMatch = p.dateOfBirth === dateOfBirth;
      
      return (firstNameMatch && lastNameMatch) || 
             (firstNameMatch && dobMatch) || 
             (lastNameMatch && dobMatch);
    });
    
    if (matches.length > 0) {
      setDuplicatePatients(matches);
      setShowDuplicateAlert(true);
      return true;
    }
    return false;
  };
  
  // Generate SMS template
  const generateSMSTemplate = (patient: Patient) => {
    setSmsPatient(patient);
    setShowSMSDialog(true);
  };
  
  const getSMSTemplate = (patient: Patient, language: 'EN' | 'CEB') => {
    const date = patient.nextFollowUp || 'your scheduled date';
    
    if (language === 'CEB') {
      return `Maayong adlaw ${patient.firstName}! Mao kini ang pag-pahinumdom alang sa imong sunod nga appointment sa ${date} para sa imong ${patient.conditions.includes('Diabetes Mellitus Type 2') ? 'diabetes' : 'presyon'}. Palihug dala ang imong gamot. Salamat! - HealthHive, Jagna RHU`;
    }
    
    return `Hello ${patient.firstName}! This is a reminder for your follow-up appointment on ${date} for your ${patient.conditions.join(' and ')}. Please bring your medications. Thank you! - HealthHive, Jagna RHU`;
  };

  // Language toggle helper
  const getTranslation = (key: string): string => {
    const translations: {[key: string]: {EN: string, CEB: string, TL: string}} = {
      'home': { EN: 'Home', CEB: 'Balay', TL: 'Tahanan' },
      'patients': { EN: 'Patients', CEB: 'Mga Pasyente', TL: 'Mga Pasyente' },
      'barangays': { EN: 'Barangays', CEB: 'Mga Barangay', TL: 'Mga Barangay' },
      'scanner': { EN: 'Scanner', CEB: 'Scanner', TL: 'Scanner' },
      'sync_history': { EN: 'Sync History', CEB: 'Kasaysayan sa Sync', TL: 'Kasaysayan ng Sync' },
      'user_guide': { EN: 'User Guide', CEB: 'Giya sa Gumagamit', TL: 'Gabay sa Gumagamit' },
      'admin': { EN: 'Admin', CEB: 'Admin', TL: 'Admin' },
      'high_risk': { EN: 'High Risk', CEB: 'Taas nga Peligro', TL: 'Mataas na Panganib' },
      'follow_up_due': { EN: 'Follow-up Due', CEB: 'Pagbalik nga Appointment', TL: 'Follow-up na Kailangan' },
      'blood_pressure': { EN: 'Blood Pressure', CEB: 'Presyon sa Dugo', TL: 'Presyon ng Dugo' },
      'blood_sugar': { EN: 'Blood Sugar', CEB: 'Asukal sa Dugo', TL: 'Asukal sa Dugo' },
      'save': { EN: 'Save', CEB: 'I-Save', TL: 'I-save' },
      'cancel': { EN: 'Cancel', CEB: 'Kanselar', TL: 'Kanselahin' },
      'language': { EN: 'Language', CEB: 'Pinulongan', TL: 'Wika' },
      'healthcare_worker': { EN: 'Healthcare Worker', CEB: 'Trabahante sa Panglawas', TL: 'Health Worker' },
      'welcome_back': { EN: 'Welcome back to HealthHive!', CEB: 'Maayong pagbalik sa HealthHive!', TL: 'Maligayang pagbabalik sa HealthHive!' },
      'data_collection_subtitle': { EN: 'Data collection for Jagna community health', CEB: 'Pagkolekta sa datos para sa kahimsog sa komunidad sa Jagna', TL: 'Pagkolekta ng datos para sa kalusugan ng komunidad ng Jagna' },
      'todays_input': { EN: "Today's Patient Input and Flagging", CEB: 'Mga Input sa Pasyente Karong Adlaw ug Pag-flag', TL: 'Input ng Pasyente Ngayon at Pag-flag' },
      'log_new_visit': { EN: 'Log New Visit', CEB: 'Irekord ang Bag-ong Bisita', TL: 'Ilog ang Bagong Pagbisita' },
      'new_patients': { EN: 'new patients', CEB: 'bag-ong pasyente', TL: 'bagong pasyente' },
      'existing_patients': { EN: 'existing patients', CEB: 'naa nay rekord', TL: 'may rekord na' },
      'follow_up': { EN: 'Follow Up', CEB: 'Pagbalik', TL: 'Follow-up' },
      'choose_visit_type': { EN: 'Choose the type of visit to record', CEB: 'Pilia ang klase sa bisita nga irekord', TL: 'Piliin ang uri ng pagbisita na ire-record' },
      'new_patient': { EN: 'New Patient', CEB: 'Bag-ong Pasyente', TL: 'Bagong Pasyente' },
      'register_new_patient': { EN: 'Register a new patient', CEB: 'Irehistro ang bag-ong pasyente', TL: 'Irehistro ang bagong pasyente' },
      'existing_patient': { EN: 'Existing Patient', CEB: 'Naa nay Rekord', TL: 'May Rekord na' },
      'record_existing_patient': { EN: 'Record visit for existing patient', CEB: 'Irekord ang bisita sa naa nay rekord', TL: 'Irekord ang pagbisita ng may rekord' },
      'recent_patients': { EN: 'Recent Patients - Quick Actions', CEB: 'Bag-ong Pasyente - Dali nga Aksyon', TL: 'Mga Bagong Pasyente - Mabilisang Aksyon' },
      'quick_visit_for': { EN: 'Quick Visit for', CEB: 'Dali nga Bisita para sa', TL: 'Mabilisang Pagbisita para kay' }
    };

    return translations[key]?.[selectedLanguage] || key;
  };

  // Navigation Items for Sidebar
  const navItems = [
    { id: 'home', labelKey: 'home', icon: Home },
    { id: 'patients-list', labelKey: 'patients', icon: Users },
    { id: 'barangay-overview', labelKey: 'barangays', icon: MapPin },
    { id: 'scanner', labelKey: 'scanner', icon: ScanLine },
    { id: 'sync-history', labelKey: 'sync_history', icon: Database },
    { id: 'user-guide', labelKey: 'user_guide', icon: BookOpen },
    { id: 'admin', labelKey: 'admin', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-200 via-slate-100 to-slate-200 flex items-center justify-center p-4 overflow-auto">
      {/* Debug Controls */}
      <div className="fixed top-4 left-4 z-[100] flex flex-col gap-2">
        <button
          onClick={() => setIsOnline(!isOnline)}
          className="px-4 py-2 bg-white rounded-lg shadow-lg text-sm flex items-center gap-2 hover:shadow-xl transition-shadow"
        >
          {isOnline ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
          {isOnline ? 'Online' : 'Offline'}
        </button>

        <Select value={currentScreen} onValueChange={(value) => setCurrentScreen(value as Screen)}>
          <SelectTrigger className="w-[200px] bg-white shadow-lg hover:shadow-xl transition-shadow">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="login">Login</SelectItem>
            <SelectItem value="onboarding1">Onboarding 1</SelectItem>
            <SelectItem value="onboarding2">Onboarding 2</SelectItem>
            <SelectItem value="home">Home</SelectItem>
            <SelectItem value="patients-list">Patient Registry</SelectItem>
            <SelectItem value="new-patient">New Patient</SelectItem>
            <SelectItem value="initial-screening">Initial Screening</SelectItem>
            <SelectItem value="patient-profile">Patient Profile</SelectItem>
            <SelectItem value="new-visit">New Visit</SelectItem>
            <SelectItem value="visit-information">Visit Information</SelectItem>
            <SelectItem value="high-risk-highlights">High Risk Highlights</SelectItem>
            <SelectItem value="high-risk-details">High Risk Details</SelectItem>
            <SelectItem value="follow-up-patients">Follow Up Patients</SelectItem>
            <SelectItem value="flagged-patients">Flagged Patients</SelectItem>
            <SelectItem value="barangay-overview">Barangay Overview</SelectItem>
            <SelectItem value="barangay-profile">Barangay Profile</SelectItem>
            <SelectItem value="scanner">Scanner</SelectItem>
            <SelectItem value="sync-history">Sync History</SelectItem>
            <SelectItem value="visit-history">Visit History</SelectItem>
            <SelectItem value="user-guide">User Guide</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Mobile Phone Frame - iPhone Style */}
      <div 
        id="phone-container"
        className="relative" 
        style={{ 
          width: '390px', 
          height: '844px',
          transform: 'scale(0.86)',
          transformOrigin: 'center center'
        }}
      >
        {/* Phone Bezel/Frame */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-800 via-slate-900 to-slate-800 rounded-[48px] shadow-[0_20px_60px_rgba(0,0,0,0.4)] p-[3px]">
          {/* Inner bezel */}
          <div className="relative w-full h-full bg-black rounded-[45px] overflow-hidden">
            {/* Dynamic Island / Notch */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[120px] h-[32px] bg-black rounded-b-[20px] z-[200]" />
            
            {/* Screen Content Container */}
            <div id="phone-screen" className="absolute inset-0 bg-slate-100 overflow-hidden rounded-[45px]">

          {/* Top Bar - Safe Area with Notch */}
          <div className={`absolute top-0 left-0 right-0 h-[88px] z-50 ${
            currentScreen === 'login' || currentScreen === 'onboarding1' || currentScreen === 'onboarding2' ? 'bg-transparent' : 'bg-white border-b border-slate-200'
          }`}>
            <div className="flex items-end justify-between px-6 pb-3 h-full pt-12">
              {/* Menu Button */}
              {!['login', 'onboarding1', 'onboarding2'].includes(currentScreen) && (
                <button 
                  onClick={() => setShowSideMenu(true)}
                  className="text-slate-700 hover:text-slate-900 transition-colors active:scale-95"
                >
                  <Menu className="w-6 h-6" />
                </button>
              )}
              
              {/* Status Icons and Sync Info */}
              <div className="flex items-center gap-3 ml-auto">
                {/* WiFi Status with Tooltip */}
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      {isOnline ? (
                        <Wifi className={`w-5 h-5 ${currentScreen === 'login' || currentScreen === 'onboarding1' || currentScreen === 'onboarding2' ? 'text-white' : 'text-green-600'}`} />
                      ) : (
                        <WifiOff className={`w-5 h-5 ${currentScreen === 'login' || currentScreen === 'onboarding1' || currentScreen === 'onboarding2' ? 'text-white/70' : 'text-amber-600'}`} />
                      )}
                    </TooltipTrigger>
                    <TooltipContent side="bottom" align="end" className="max-w-[160px]">
                      <p>{isOnline ? 'Online' : 'Offline'}</p>
                      {!['login', 'onboarding1', 'onboarding2'].includes(currentScreen) && (
                        <p className="text-xs text-slate-500">Last sync: {getLastSyncText()}</p>
                      )}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                {!['login', 'onboarding1', 'onboarding2'].includes(currentScreen) && (
                  <>
                    <Bell className="w-5 h-5 text-slate-600" />
                    {/* Sync Button in Header */}
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            onClick={handleSync}
                            className="relative w-10 h-10 bg-violet-600 hover:bg-violet-700 rounded-full shadow-sm hover:shadow-md flex items-center justify-center transition-all active:scale-95"
                          >
                            <RefreshCw className={`w-5 h-5 text-white ${isLoading ? 'animate-spin' : ''}`} />
                            {pendingSyncCount > 0 && (
                              <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 rounded-full flex items-center justify-center border-2 border-white animate-pulse">
                                <span className="text-white text-xs">{pendingSyncCount}</span>
                              </div>
                            )}
                            {isSyncOverdue() && pendingSyncCount === 0 && (
                              <div className="absolute -top-1 -right-1 w-3 h-3 bg-amber-500 rounded-full border-2 border-white" />
                            )}
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="bottom" align="end" className="max-w-[160px]">
                          <p>Sync Data</p>
                          <p className="text-xs text-slate-500">
                            {pendingSyncCount > 0 ? `${pendingSyncCount} pending changes` : `Last: ${getLastSyncText()}`}
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Offline Banner Warning */}
          {!isOnline && !['login', 'onboarding1', 'onboarding2'].includes(currentScreen) && (
            <div className="absolute top-[88px] left-0 right-0 bg-amber-50 border-b border-amber-200 px-6 py-2 flex items-center gap-2 z-40">
              <WifiOff className="w-4 h-4 text-amber-700" />
              <span className="text-xs text-amber-900">Offline - Changes saved locally</span>
              {pendingSyncCount > 0 && (
                <Badge variant="outline" className="ml-auto text-xs bg-amber-100 border-amber-300 text-amber-700">
                  {pendingSyncCount} pending
                </Badge>
              )}
            </div>
          )}

          {/* Side Menu */}
          {showSideMenu && (
            <>
              <div 
                className="absolute inset-0 bg-black/30 z-[60]"
                onClick={() => setShowSideMenu(false)}
              />
              <div className="absolute top-0 left-0 bottom-0 w-64 bg-[#1E1E2E] z-[70] shadow-2xl">
              {/* Header */}
              <div className="p-6 border-b border-slate-700">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center">
                      <Heart className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-white">HealthHive</h3>
                      <p className="text-slate-400 text-xs">Jagna Community Health</p>
                    </div>
                  </div>
                  <button onClick={() => setShowSideMenu(false)} className="text-slate-400 hover:text-white">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="flex items-center gap-3 mt-4">
                  <div className="w-10 h-10 bg-violet-600 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-white text-sm">Healthcare Worker</p>
                    <p className="text-slate-400 text-xs">ID: 03456789</p>
                  </div>
                </div>
              </div>

              {/* Navigation */}
              <div className="p-4">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentScreen === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => navigate(item.id as Screen)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition-colors ${
                        isActive 
                          ? 'bg-violet-600 text-white' 
                          : 'text-slate-300 hover:bg-slate-700/50'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="text-sm">{getTranslation(item.labelKey)}</span>
                    </button>
                  );
                })}
              </div>

              {/* Language Selector */}
              <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-700">
                <div className="flex items-center gap-2 mb-3">
                  <Globe className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-300 text-sm">{getTranslation('language')}</span>
                </div>
                <div className="flex gap-2">
                  {(['EN', 'TL', 'CEB'] as const).map((lang) => (
                    <button
                      key={lang}
                      onClick={() => setSelectedLanguage(lang)}
                      className={`flex-1 py-2 px-3 rounded-lg text-xs transition-colors ${
                        selectedLanguage === lang
                          ? 'bg-violet-600 text-white'
                          : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                      }`}
                    >
                      {lang}
                    </button>
                  ))}
                </div>
                </div>
              </div>
            </>
          )}



          {/* Pre-Sync Data Preview Dialog */}
          <Dialog open={showPreSyncDialog} onOpenChange={setShowPreSyncDialog}>
            <DialogContent className="!w-64 !max-w-[256px] p-4 gap-2">
              <DialogHeader className="pb-0 gap-1">
                <DialogTitle>Ready to Sync</DialogTitle>
                <DialogDescription className="text-xs">
                  Review the data to be synchronized
                </DialogDescription>
              </DialogHeader>
              <div className="py-1">
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center py-1 px-2 bg-slate-50 rounded">
                    <span className="text-xs text-slate-600">New Patients</span>
                    <span className="text-xs font-medium text-slate-900">{pendingSyncData.newPatients}</span>
                  </div>
                  <div className="flex justify-between items-center py-1 px-2 bg-slate-50 rounded">
                    <span className="text-xs text-slate-600">New Visits</span>
                    <span className="text-xs font-medium text-slate-900">{pendingSyncData.newVisits}</span>
                  </div>
                  <div className="flex justify-between items-center py-1 px-2 bg-slate-50 rounded">
                    <span className="text-xs text-slate-600">Updates</span>
                    <span className="text-xs font-medium text-slate-900">{pendingSyncData.updates}</span>
                  </div>
                  {pendingSyncData.deletions > 0 && (
                    <div className="flex justify-between items-center py-1 px-2 bg-red-50 rounded">
                      <span className="text-xs text-red-600">Deletions</span>
                      <span className="text-xs font-medium text-red-700">{pendingSyncData.deletions}</span>
                    </div>
                  )}
                </div>
                <div className="mt-2 p-2 bg-violet-50 border border-violet-200 rounded">
                  <p className="text-xs text-violet-700">
                    <strong>Total:</strong> {pendingSyncData.newPatients + pendingSyncData.newVisits + pendingSyncData.updates + pendingSyncData.deletions}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline"
                  onClick={() => setShowPreSyncDialog(false)} 
                  className="flex-1 h-8 text-xs"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={confirmSync} 
                  className="flex-1 h-8 text-xs bg-violet-600 hover:bg-violet-700"
                >
                  Sync Now
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Sync Dialog */}
          <Dialog open={showSyncDialog} onOpenChange={setShowSyncDialog}>
          <DialogContent className="w-80">
            <DialogHeader>
              <DialogTitle>{syncSuccess ? 'Sync Complete' : 'Syncing Data...'}</DialogTitle>
              <DialogDescription>
                {syncSuccess ? 'Your patient data has been synchronized with the server' : 'Please wait while we sync your data'}
              </DialogDescription>
            </DialogHeader>
            <div className="py-6 text-center">
              {syncSuccess ? (
                <div className="text-green-600">
                  <Check className="w-12 h-12 mx-auto mb-2" />
                  <p>All data synced successfully</p>
                  <p className="text-xs text-slate-500 mt-2">
                    {new Date().toLocaleString('en-US', { 
                      month: 'short', 
                      day: 'numeric', 
                      year: 'numeric', 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </p>
                </div>
              ) : (
                <div className="text-violet-600">
                  <RefreshCw className="w-12 h-12 mx-auto mb-2 animate-spin" />
                  <p>Syncing with server...</p>
                </div>
              )}
            </div>
            <Button 
              onClick={() => setShowSyncDialog(false)} 
              className="w-full bg-violet-600 hover:bg-violet-700"
            >
              {syncSuccess ? 'OK' : 'More Details'}
            </Button>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent className="w-80">
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                Delete {itemToDelete?.itemType}?
              </AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the selected {itemToDelete?.itemType}.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-red-600 hover:bg-red-700"
              >
                Delete
              </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {/* Pull to Refresh Indicator */}
          {pullDistance > 0 && (
            <div 
              className="absolute top-[88px] left-0 right-0 flex justify-center z-40 transition-all"
              style={{ transform: `translateY(${Math.min(pullDistance, 60)}px)` }}
            >
              <div className="bg-white rounded-full p-2 shadow-lg">
                <RefreshCw className={`w-5 h-5 text-violet-600 ${isPullingToRefresh ? 'animate-spin' : ''}`} />
              </div>
            </div>
          )}

          {/* Main Content with Pull to Refresh */}
          <div 
            className={`absolute left-0 right-0 bottom-0 bg-slate-100 overflow-y-auto ${
              !isOnline && !['login', 'onboarding1', 'onboarding2'].includes(currentScreen) 
                ? 'top-[124px]' 
                : 'top-[88px]'
            }`}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {currentScreen === 'login' && <LoginScreen onLogin={handleLogin} />}
          {currentScreen === 'onboarding1' && <Onboarding1Screen onNext={() => navigate('onboarding2')} />}
          {currentScreen === 'onboarding2' && <Onboarding2Screen onNext={() => navigate('home')} />}
          {currentScreen === 'home' && (
            <HomeScreen
              onNavigate={navigate}
              recentPatients={recentPatients}
              onSelectPatient={setSelectedPatient}
              newHighRiskCount={newHighRiskCount}
              isSyncOverdue={isSyncOverdue()}
              t={getTranslation}
            />
          )}
          {currentScreen === 'patients-list' && <PatientsListScreen onNavigate={navigate} onSelectPatient={setSelectedPatient} patients={patients} isLoading={patientsLoading} newHighRiskCount={newHighRiskCount} isSyncOverdue={isSyncOverdue()} />}
          {currentScreen === 'new-patient' && <NewPatientScreen onBack={() => navigate('home')} onNext={() => navigate('initial-screening')} onCreatePatient={handleCreatePatient} />}
          {currentScreen === 'initial-screening' && (
            <InitialScreeningScreen
              onBack={() => navigate('new-patient')}
              onSave={async () => {
                const updated = await loadPatients();
                const refreshed = updated.find((p) => p.id === (newPatientId || activePatient?.id));
                if (refreshed) setSelectedPatient(refreshed);
                navigate('patient-profile');
              }}
              patientId={newPatientId || activePatient?.id}
              onPendingSyncChange={setPendingSyncCount}
            />
          )}
          {currentScreen === 'patient-profile' && (
            activePatient ? (
              <PatientProfileScreen 
                patient={activePatient} 
                onBack={() => navigate('patients-list')} 
                isEditing={isEditing}
                onEdit={() => setIsEditing(true)}
                onSave={() => setIsEditing(false)}
                onNavigate={navigate}
              />
            ) : (
              <EmptyStateScreen onBack={() => navigate('home')} message="No patients available." />
            )
          )}
          {currentScreen === 'new-visit' && (
            <NewVisitScreen
              onBack={() => navigate('home')}
              onSave={async () => {
                const updated = await loadPatients();
                const refreshed = updated.find((p) => p.id === activePatient?.id);
                if (refreshed) setSelectedPatient(refreshed);
                navigate('visit-information');
              }}
              patientId={activePatient?.id}
              onPendingSyncChange={setPendingSyncCount}
            />
          )}
          {currentScreen === 'visit-information' && <VisitInformationScreen onBack={() => navigate('patient-profile')} patientId={activePatient?.id} patientName={activePatient?.name} />}
          {currentScreen === 'high-risk-highlights' && <HighRiskHighlightsScreen onBack={() => navigate('home')} onNavigate={navigate} onSelectPatient={setSelectedPatient} patients={patients} />}
          {currentScreen === 'high-risk-details' && activePatient && <HighRiskDetailsScreen patient={activePatient} onBack={() => navigate('high-risk-highlights')} onNavigate={navigate} />}
          {currentScreen === 'follow-up-patients' && <FollowUpPatientsScreen onBack={() => navigate('home')} onNavigate={navigate} onSelectPatient={setSelectedPatient} patients={patients} />}
          {currentScreen === 'flagged-patients' && <FlaggedPatientsScreen onNavigate={navigate} onSelectPatient={setSelectedPatient} patients={patients} />}
          {currentScreen === 'barangay-overview' && <BarangayOverviewScreen onNavigate={navigate} />}
          {currentScreen === 'barangay-profile' && <BarangayProfileScreen onBack={() => navigate('barangay-overview')} onNavigate={navigate} />}
          {currentScreen === 'scanner' && <ScannerScreen onBack={() => navigate('home')} onNavigate={navigate} />}
          {currentScreen === 'sync-history' && <SyncHistoryScreen onBack={() => navigate('home')} onNavigate={navigate} />}
          {currentScreen === 'visit-history' && <VisitHistoryScreen onBack={() => navigate('patient-profile')} patientId={activePatient?.id} />}
          {currentScreen === 'user-guide' && <UserGuideScreen onBack={() => navigate('home')} />}
          {currentScreen === 'admin' && <AdminScreen onBack={() => navigate('home')} onNavigate={navigate} />}
          </div>
            </div>
          </div>
        </div>
        
        {/* Phone Home Indicator (iOS style) */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1 bg-white rounded-full opacity-30 z-[200]" />
      </div>
    </div>
  );
}

// Empty State Component
function EmptyState({ 
  icon: Icon, 
  title, 
  description, 
  actionLabel, 
  onAction 
}: { 
  icon: any; 
  title: string; 
  description: string; 
  actionLabel?: string; 
  onAction?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
      <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-slate-400" />
      </div>
      <h3 className="text-slate-900 mb-2">{title}</h3>
      <p className="text-slate-600 text-sm mb-6 max-w-xs">{description}</p>
      {actionLabel && onAction && (
        <Button onClick={onAction} className="bg-violet-600 hover:bg-violet-700">
          <Plus className="w-4 h-4 mr-2" />
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

// Skeleton Loader for Patient Cards
function PatientCardSkeleton() {
  return (
    <Card className="p-4 bg-white border border-slate-200 rounded-xl">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-32" />
          <div className="flex gap-2 mt-2">
            <Skeleton className="h-6 w-16" />
            <Skeleton className="h-6 w-20" />
          </div>
        </div>
        <Skeleton className="h-6 w-20" />
      </div>
      <div className="grid grid-cols-2 gap-2 mb-3">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-20" />
      </div>
      <Skeleton className="h-4 w-full" />
    </Card>
  );
}

// Breadcrumb Navigation Component
function BreadcrumbNav({ path, onNavigate }: { path: { label: string; screen?: Screen }[]; onNavigate: (screen: Screen) => void }) {
  if (path.length <= 1) return null;
  
  return (
    <div className="bg-white border-b border-slate-200 px-6 py-2">
      <Breadcrumb>
        <BreadcrumbList>
          {path.map((item, index) => (
            <React.Fragment key={index}>
              {index > 0 && <BreadcrumbSeparator />}
              <BreadcrumbItem>
                {item.screen ? (
                  <BreadcrumbLink
                    onClick={() => onNavigate(item.screen!)}
                    className="text-violet-600 cursor-pointer hover:text-violet-700"
                  >
                    {item.label}
                  </BreadcrumbLink>
                ) : (
                  <BreadcrumbPage className="text-slate-900">{item.label}</BreadcrumbPage>
                )}
              </BreadcrumbItem>
            </React.Fragment>
          ))}
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  );
}

// Bottom Navigation Component
function BottomNav({ 
  onNavigate, 
  currentScreen, 
  newHighRiskCount = 0, 
  isSyncOverdue = false 
}: { 
  onNavigate: (screen: Screen) => void; 
  currentScreen?: Screen;
  newHighRiskCount?: number;
  isSyncOverdue?: boolean;
}) {
  return (
    <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-6 py-3">
      <div className="grid grid-cols-4 gap-2">
        <button
          onClick={() => onNavigate('home')}
          className={`flex flex-col items-center gap-1 py-2 rounded-lg relative ${
            currentScreen === 'home' ? 'bg-violet-50' : 'hover:bg-slate-50'
          }`}
        >
          {isSyncOverdue && (
            <div className="absolute top-1 right-1/4 w-2 h-2 bg-amber-500 rounded-full"></div>
          )}
          <Home className={`w-5 h-5 ${currentScreen === 'home' ? 'text-violet-600' : 'text-slate-600'}`} />
          <span className={`text-xs ${currentScreen === 'home' ? 'text-violet-600' : 'text-slate-600'}`}>Home</span>
        </button>
        <button
          onClick={() => onNavigate('new-visit')}
          className={`flex flex-col items-center gap-1 py-2 rounded-lg ${
            currentScreen === 'new-visit' ? 'bg-violet-50' : 'hover:bg-slate-50'
          }`}
        >
          <Plus className={`w-5 h-5 ${currentScreen === 'new-visit' ? 'text-violet-600' : 'text-slate-600'}`} />
          <span className={`text-xs ${currentScreen === 'new-visit' ? 'text-violet-600' : 'text-slate-600'}`}>New Visit</span>
        </button>
        <button
          onClick={() => onNavigate('patients-list')}
          className={`flex flex-col items-center gap-1 py-2 rounded-lg ${
            currentScreen === 'patients-list' ? 'bg-violet-50' : 'hover:bg-slate-50'
          }`}
        >
          <Users className={`w-5 h-5 ${currentScreen === 'patients-list' ? 'text-violet-600' : 'text-slate-600'}`} />
          <span className={`text-xs ${currentScreen === 'patients-list' ? 'text-violet-600' : 'text-slate-600'}`}>Patients</span>
        </button>
        <button
          onClick={() => onNavigate('flagged-patients')}
          className={`flex flex-col items-center gap-1 py-2 rounded-lg relative ${
            currentScreen === 'flagged-patients' ? 'bg-red-50' : 'hover:bg-slate-50'
          }`}
        >
          {newHighRiskCount > 0 && (
            <div className="absolute top-1 right-1/4 w-5 h-5 bg-red-600 rounded-full flex items-center justify-center">
              <span className="text-white text-[10px]">{newHighRiskCount}</span>
            </div>
          )}
          <AlertCircle className={`w-5 h-5 ${currentScreen === 'flagged-patients' ? 'text-red-600' : 'text-slate-600'}`} />
          <span className={`text-xs ${currentScreen === 'flagged-patients' ? 'text-red-600' : 'text-slate-600'}`}>Flagged</span>
        </button>
      </div>
    </div>
  );
}

function EmptyStateScreen({ onBack, message }: { onBack: () => void; message: string }) {
  return (
    <div className="h-full bg-slate-50 flex flex-col">
      <div className="bg-white px-6 py-6 border-b border-slate-200">
        <button onClick={onBack} className="text-indigo-600 mb-3 flex items-center gap-1 text-sm">
          <ChevronRight className="w-4 h-4 rotate-180" /> Back
        </button>
        <h2 className="text-slate-900">No Data</h2>
        <p className="text-slate-500 text-sm">{message}</p>
      </div>
    </div>
  );
}

// Login Screen
function LoginScreen({ onLogin }: { onLogin: (username: string, password: string) => void }) {
  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSubmit = async () => {
    setError('');
    
    if (!username.trim() || !password.trim()) {
      setError('Please enter both username and password');
      return;
    }

    setIsLoading(true);
    
    try {
      await onLogin(username, password);
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-violet-600 via-violet-700 to-violet-800 relative">
      <div className="flex-1 flex flex-col justify-between p-6 pt-20">
        <div>
          <div className="mb-4">
            <img src={loginLogo} alt="HealthHive Logo" className="w-80 h-auto" />
          </div>

          <div className="mb-8">
            <h2 className="text-white mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>Welcome back!</h2>
            <p className="text-violet-200" style={{ fontFamily: 'Poppins, sans-serif' }}>Real-time monitoring of chronic disease management</p>
          </div>

          {/* Login Form */}
          <div className="space-y-4 bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <div>
              <Label className="text-white mb-2 block">Healthcare Worker ID</Label>
              <Input 
                type="text" 
                placeholder="Enter your ID"
                className="bg-white/90 border-0 h-11"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
                disabled={isLoading}
              />
            </div>
            <div>
              <Label className="text-white mb-2 block">Password</Label>
              <Input 
                type="password" 
                placeholder="Enter your password"
                className="bg-white/90 border-0 h-11"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
                disabled={isLoading}
              />
            </div>
            {error && (
              <div className="text-red-200 text-sm bg-red-500/20 p-3 rounded-lg">
                {error}
              </div>
            )}
            <button className="text-violet-200 hover:text-white text-sm">
              Forgot password?
            </button>
          </div>
        </div>

        <Button 
          onClick={handleSubmit}
          className="w-full h-12 bg-white text-violet-600 hover:bg-violet-50 rounded-xl shadow-lg"
          disabled={isLoading}
        >
          {isLoading ? 'Logging in...' : 'Log in'}
        </Button>
      </div>
    </div>
  );
}

// Onboarding Screens
function Onboarding1Screen({ onNext }: { onNext: () => void }) {
  return (
    <div className="h-full flex flex-col items-center justify-between px-8 py-16 bg-gradient-to-br from-violet-600 via-violet-700 to-violet-800">
      <div className="flex-1 flex items-center justify-center">
        <img src={healthHiveLogo} alt="HealthHive Logo" className="w-72 h-72 object-contain" />
      </div>
      <Button onClick={onNext} className="w-full bg-white text-violet-600 hover:bg-violet-50">
        Next
      </Button>
    </div>
  );
}

function Onboarding2Screen({ onNext }: { onNext: () => void }) {
  return (
    <div className="h-full flex flex-col items-center justify-between px-8 py-16 bg-gradient-to-br from-amber-500 via-amber-600 to-amber-700">
      <div className="flex-1 flex flex-col items-center justify-center">
        <img src={healthHiveLogo} alt="HealthHive Logo" className="w-72 h-72 object-contain mb-6" />
        <h1 className="text-white mb-4 text-center font-bold">Offline-First Data Collection</h1>
        <p className="text-white text-center px-4">
          Collect and manage important health data anywhere — even offline!
        </p>
      </div>
      <Button onClick={onNext} className="w-full bg-white text-amber-600 hover:bg-amber-50">
        Get Started
      </Button>
    </div>
  );
}

// Home Screen
function HomeScreen({ 
  onNavigate, 
  recentPatients, 
  onSelectPatient,
  newHighRiskCount = 0,
  isSyncOverdue = false,
  t
}: { 
  onNavigate: (screen: Screen) => void; 
  recentPatients: Patient[]; 
  onSelectPatient: (patient: Patient) => void;
  newHighRiskCount?: number;
  isSyncOverdue?: boolean;
  t: (key: string) => string;
}) {
  const [showNewVisitDialog, setShowNewVisitDialog] = React.useState(false);
  const [selectedBarangay, setSelectedBarangay] = React.useState('All Barangays');
  const [showQuickVisitDialog, setShowQuickVisitDialog] = React.useState(false);
  const [quickVisitPatient, setQuickVisitPatient] = React.useState<Patient | null>(null);

  // Filter data based on selected barangay
  const getFilteredStats = () => {
    if (selectedBarangay === 'All Barangays') {
      return {
        htnPatients: 3842,
        dmPatients: 2761,
        highRisk: 892,
        followUp: 1234,
        total: 6603,
        barangayCount: 33
      };
    }
    
    // Find the specific barangay data
    const barangayData = barangayFollowUps.find(b => b.barangay === selectedBarangay);
    if (barangayData) {
      return {
        htnPatients: barangayData.htnPatients,
        dmPatients: barangayData.dmPatients,
        highRisk: barangayData.highRisk,
        followUp: barangayData.followUp,
        total: barangayData.patientsRegistered,
        barangayCount: 1
      };
    }
    
    return {
      htnPatients: 0,
      dmPatients: 0,
      highRisk: 0,
      followUp: 0,
      total: 0,
      barangayCount: 0
    };
  };

  const stats = getFilteredStats();

  return (
    <div className="h-full bg-slate-50 flex flex-col pb-20">
      {/* Header */}
      <div className="bg-white px-6 py-6 border-b border-slate-200">
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex-1">
            <h2 className="text-slate-900"><strong>{t('welcome_back')}</strong></h2>
          </div>
          <Badge className="bg-violet-100 text-violet-700 text-xs flex-shrink-0">BHW-03456789</Badge>
        </div>
        <p className="text-slate-500 text-sm">{t('data_collection_subtitle')}</p>
      </div>

      <div className="flex-1 overflow-y-auto p-6 pb-24 space-y-6">
        {/* Today's Patient Input and Flagging */}
        <div>
          <div className="bg-violet-50 rounded-xl p-4 mb-4">
            <h3 className="text-violet-900 text-sm">{t('todays_input')}</h3>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* New Visit - Combined */}
            <button
              onClick={() => setShowNewVisitDialog(true)}
              className="col-span-2 p-4 bg-white border border-slate-200 rounded-xl relative overflow-hidden text-left hover:shadow-md transition-shadow"
            >
              <div className="absolute top-3 right-3">
                <div className="w-10 h-10 rounded-full bg-violet-600 flex items-center justify-center">
                  <Plus className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="mb-2">
                <div className="text-slate-600 text-sm mb-1">{t('log_new_visit')}</div>
                <div className="flex items-baseline gap-4 mt-2">
                  <div>
                    <span className="text-slate-900 text-3xl">12</span>
                    <span className="text-slate-500 text-xs ml-2">{t('new_patients')}</span>
                  </div>
                  <div>
                    <span className="text-slate-900 text-3xl">45</span>
                    <span className="text-slate-500 text-xs ml-2">{t('existing_patients')}</span>
                  </div>
                </div>
              </div>
            </button>

            {/* High Risk */}
            <button
              onClick={() => onNavigate('high-risk-highlights')}
              className="p-4 bg-white border border-slate-200 rounded-xl relative overflow-hidden text-left hover:shadow-md transition-shadow"
            >
              <div className="absolute top-3 right-3">
                <div className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="mb-2">
                <div className="text-slate-600 text-sm mb-1">{t('high_risk')}</div>
                <div className="text-slate-900 text-3xl mb-1">23</div>
                <div className="text-slate-500 text-xs">HTN: 11 • DM: 12</div>
              </div>
            </button>

            {/* Follow Up */}
            <button
              onClick={() => onNavigate('follow-up-patients')}
              className="p-4 bg-white border border-slate-200 rounded-xl relative overflow-hidden text-left hover:shadow-md transition-shadow"
            >
              <div className="absolute top-3 right-3">
                <div className="w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="mb-2">
                <div className="text-slate-600 text-sm mb-1">{t('follow_up')}</div>
                <div className="text-slate-900 text-3xl mb-1">34</div>
                <div className="text-slate-500 text-xs">HTN: 16 • DM: 18</div>
              </div>
            </button>
          </div>
        </div>

        {/* New Visit Dialog */}
        <Dialog open={showNewVisitDialog} onOpenChange={setShowNewVisitDialog}>
          <DialogContent className="w-80">
            <DialogHeader>
              <DialogTitle>{t('log_new_visit')}</DialogTitle>
              <DialogDescription>
                {t('choose_visit_type')}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3 py-4">
              <button
                onClick={() => {
                  setShowNewVisitDialog(false);
                  onNavigate('new-patient');
                }}
                className="w-full p-4 bg-violet-50 border-2 border-violet-200 rounded-xl text-left hover:bg-violet-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-violet-600 flex items-center justify-center">
                    <Plus className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="text-violet-900">{t('new_patient')}</div>
                    <div className="text-violet-700 text-xs">{t('register_new_patient')}</div>
                  </div>
                </div>
              </button>
              <button
                onClick={() => {
                  setShowNewVisitDialog(false);
                  onNavigate('new-visit');
                }}
                className="w-full p-4 bg-violet-50 border-2 border-violet-200 rounded-xl text-left hover:bg-violet-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-violet-600 flex items-center justify-center">
                    <Activity className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="text-violet-900">{t('existing_patient')}</div>
                    <div className="text-violet-700 text-xs">{t('record_existing_patient')}</div>
                  </div>
                </div>
              </button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Recent Patients - Quick Actions */}
        {recentPatients && recentPatients.length > 0 && (
          <div>
            <div className="bg-blue-50 rounded-xl p-4 mb-4">
              <h3 className="text-blue-900 text-sm">{t('recent_patients')}</h3>
            </div>

            <div className="space-y-2">
              {recentPatients.map((patient) => (
                <Card 
                  key={patient.id}
                  className="p-4 bg-white border border-slate-200 rounded-xl hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between gap-3">
                    <button
                      onClick={() => {
                        onSelectPatient(patient);
                        onNavigate('patient-profile');
                      }}
                      className="flex-1 text-left"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center flex-shrink-0">
                          <User className="w-5 h-5 text-violet-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-slate-900 text-sm mb-0.5">{patient.name}</div>
                          <div className="text-slate-500 text-xs flex items-center gap-2">
                            <span>{patient.id}</span>
                            <span>•</span>
                            <span>{patient.barangay}</span>
                          </div>
                          <div className="flex gap-1 mt-1">
                            {patient.conditions.includes('HTN') && (
                              <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-orange-300 text-orange-700 bg-orange-50">HTN</Badge>
                            )}
                            {patient.conditions.includes('DM') && (
                              <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-blue-300 text-blue-700 bg-blue-50">DM</Badge>
                            )}
                            {patient.riskLevel === 'High' && (
                              <Badge className="text-[10px] px-1.5 py-0 bg-red-100 text-red-700">High Risk</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </button>
                    <button
                      onClick={() => {
                        setQuickVisitPatient(patient);
                        setShowQuickVisitDialog(true);
                      }}
                      className="w-10 h-10 rounded-lg bg-violet-600 flex items-center justify-center hover:bg-violet-700 transition-colors flex-shrink-0"
                      title={t('log_new_visit')}
                    >
                      <Plus className="w-5 h-5 text-white" />
                    </button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Quick Visit Dialog */}
        <Dialog open={showQuickVisitDialog} onOpenChange={setShowQuickVisitDialog}>
          <DialogContent className="w-80">
            <DialogHeader>
              <DialogTitle>{t('quick_visit_for')} {quickVisitPatient?.name}</DialogTitle>
              <DialogDescription>
                Record a quick visit for this patient
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="text-sm text-slate-600">
                This will open the New Visit form with {quickVisitPatient?.name} pre-selected.
              </div>
              <Button
                onClick={() => {
                  if (quickVisitPatient) {
                    onSelectPatient(quickVisitPatient);
                  }
                  setShowQuickVisitDialog(false);
                  onNavigate('new-visit');
                }}
                className="w-full bg-violet-600 hover:bg-violet-700"
              >
                Continue to Visit Form
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Total Patient Overview */}
        <div>
          <div className="bg-violet-50 rounded-xl p-4 mb-4 flex items-center justify-between">
            <h3 className="text-violet-900 text-sm">Total Patient Overview</h3>
          </div>

          <Card className="p-6 bg-white border border-slate-200 rounded-xl">
            {/* Barangay Filter */}
            <div className="mb-4">
              <Select value={selectedBarangay} onValueChange={setSelectedBarangay}>
                <SelectTrigger className="w-full h-10 bg-slate-50 border-slate-200">
                  <SelectValue placeholder="Select barangay" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All Barangays">All Barangays</SelectItem>
                  {barangays.map((barangay) => (
                    <SelectItem key={barangay} value={barangay}>
                      {barangay}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                <div>
                  <div className="text-orange-900 text-sm mb-1">HTN Patients</div>
                  <div className="text-orange-600">{stats.htnPatients.toLocaleString()}</div>
                </div>
                <div className="w-10 h-10 rounded-full bg-orange-600 flex items-center justify-center">
                  <Activity className="w-5 h-5 text-white" />
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div>
                  <div className="text-blue-900 text-sm mb-1">DM Patients</div>
                  <div className="text-blue-600">{stats.dmPatients.toLocaleString()}</div>
                </div>
                <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center">
                  <Stethoscope className="w-5 h-5 text-white" />
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                <div>
                  <div className="text-red-900 text-sm mb-1">High Risk</div>
                  <div className="text-red-600">{stats.highRisk.toLocaleString()}</div>
                </div>
                <div className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 text-white" />
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
                <div>
                  <div className="text-amber-900 text-sm mb-1">Follow Up</div>
                  <div className="text-amber-600">{stats.followUp.toLocaleString()}</div>
                </div>
                <div className="w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-white" />
                </div>
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-slate-200 text-center">
              <div className="text-slate-500 text-sm mb-1">Total Registered</div>
              <div className="text-slate-900 text-3xl"><strong>{stats.total.toLocaleString()}</strong></div>
              <div className="text-slate-500 text-xs mt-1">
                {selectedBarangay === 'All Barangays' ? `Across ${stats.barangayCount} barangays` : selectedBarangay}
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNav onNavigate={onNavigate} currentScreen="home" newHighRiskCount={newHighRiskCount} isSyncOverdue={isSyncOverdue} />
    </div>
  );
}

// Patients List Screen
function PatientsListScreen({
  onNavigate,
  onSelectPatient,
  patients,
  isLoading,
  newHighRiskCount,
  isSyncOverdue
}: {
  onNavigate: (screen: Screen) => void;
  onSelectPatient: (patient: Patient) => void;
  patients: Patient[];
  isLoading: boolean;
  newHighRiskCount: number;
  isSyncOverdue: boolean;
}) {
  const [selectedFilter, setSelectedFilter] = React.useState('All');
  const [selectedBarangayFilter, setSelectedBarangayFilter] = React.useState('All Barangays');

  const filteredPatients = patients.filter((patient) => {
    if (selectedFilter === 'HTN' && !patient.conditions.includes('HTN')) return false;
    if (selectedFilter === 'DM' && !patient.conditions.includes('DM')) return false;
    if (selectedFilter === 'Very High Risk' && patient.riskLevel !== 'Very High') return false;
    if (selectedFilter === 'High Risk' && patient.riskLevel !== 'High') return false;
    if (selectedFilter === 'Medium Risk' && patient.riskLevel !== 'Medium') return false;
    if (selectedFilter === 'Low Risk' && patient.riskLevel !== 'Low') return false;
    if (selectedFilter === 'Due' && !patient.nextFollowUp) return false;
    if (selectedBarangayFilter !== 'All Barangays' && patient.barangay !== selectedBarangayFilter) return false;
    return true;
  });

  return (
    <div className="h-full bg-slate-50 flex flex-col pb-20">
      <div className="bg-white px-6 py-6 border-b border-slate-200">
        <h2 className="text-slate-900 mb-4">Patient Registry</h2>
        
        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
          <Input 
            placeholder="Search patients, barangays..."
            className="pl-10 h-11 bg-slate-50 border-slate-200"
          />
        </div>

        {/* Condition Filters */}
        <div className="flex gap-2 mb-3 overflow-x-auto pb-2">
          <Button 
            variant={selectedFilter === 'All' ? 'default' : 'outline'} 
            size="sm" 
            className={`text-xs ${selectedFilter === 'All' ? 'bg-violet-600 hover:bg-violet-700' : ''}`}
            onClick={() => setSelectedFilter('All')}
          >
            <Filter className="w-3 h-3 mr-1" />
            All
          </Button>
          <Button 
            variant={selectedFilter === 'HTN' ? 'default' : 'outline'} 
            size="sm" 
            className={`text-xs ${selectedFilter === 'HTN' ? 'bg-orange-600 hover:bg-orange-700' : ''}`}
            onClick={() => setSelectedFilter('HTN')}
          >
            HTN
          </Button>
          <Button 
            variant={selectedFilter === 'DM' ? 'default' : 'outline'} 
            size="sm" 
            className={`text-xs ${selectedFilter === 'DM' ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
            onClick={() => setSelectedFilter('DM')}
          >
            DM
          </Button>
          <Button 
            variant={selectedFilter === 'Very High Risk' ? 'default' : 'outline'} 
            size="sm" 
            className={`text-xs ${selectedFilter === 'Very High Risk' ? 'bg-rose-700 hover:bg-rose-800' : ''}`}
            onClick={() => setSelectedFilter('Very High Risk')}
          >
            Very High
          </Button>
          <Button 
            variant={selectedFilter === 'High Risk' ? 'default' : 'outline'} 
            size="sm" 
            className={`text-xs ${selectedFilter === 'High Risk' ? 'bg-red-600 hover:bg-red-700' : ''}`}
            onClick={() => setSelectedFilter('High Risk')}
          >
            High
          </Button>
          <Button 
            variant={selectedFilter === 'Medium Risk' ? 'default' : 'outline'} 
            size="sm" 
            className={`text-xs ${selectedFilter === 'Medium Risk' ? 'bg-amber-500 hover:bg-amber-600' : ''}`}
            onClick={() => setSelectedFilter('Medium Risk')}
          >
            Medium
          </Button>
          <Button 
            variant={selectedFilter === 'Low Risk' ? 'default' : 'outline'} 
            size="sm" 
            className={`text-xs ${selectedFilter === 'Low Risk' ? 'bg-green-600 hover:bg-green-700' : ''}`}
            onClick={() => setSelectedFilter('Low Risk')}
          >
            Low
          </Button>
          <Button 
            variant={selectedFilter === 'Due' ? 'default' : 'outline'} 
            size="sm" 
            className={`text-xs ${selectedFilter === 'Due' ? 'bg-violet-500 hover:bg-violet-600' : ''}`}
            onClick={() => setSelectedFilter('Due')}
          >
            Follow Up
          </Button>
        </div>

        {/* Barangay Filter */}
        <Select value={selectedBarangayFilter} onValueChange={setSelectedBarangayFilter}>
          <SelectTrigger className="w-full h-10 bg-slate-50 border-slate-200">
            <SelectValue placeholder="Select barangay" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All Barangays">All Barangays</SelectItem>
            {barangays.map((barangay) => (
              <SelectItem key={barangay} value={barangay}>
                {barangay}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex-1 overflow-y-auto p-6 pb-24 space-y-3">
        {isLoading ? (
          // Loading skeletons
          <>
            <PatientCardSkeleton />
            <PatientCardSkeleton />
            <PatientCardSkeleton />
          </>
        ) : filteredPatients.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No patients found"
            description="Try adjusting your filters or add a new patient to get started"
            actionLabel="Add Patient"
            onAction={() => onNavigate('new-patient')}
          />
        ) : (
          [...filteredPatients].reverse().map((patient) => {
            // Sort conditions to show HTN first
          const sortedConditions = [...patient.conditions].sort((a, b) => {
            if (a === 'HTN') return -1;
            if (b === 'HTN') return 1;
            return 0;
          });

          // Determine controlled/uncontrolled status
          const hasHTN = patient.conditions.includes('HTN');
          const hasDM = patient.conditions.includes('DM');
          const bpParts = patient.latestBP.split('/');
          const systolic = parseInt(bpParts[0]);
          const rbsValue = parseInt(patient.latestRBS);
          const htnControlled = hasHTN && systolic < 140;
          const dmControlled = hasDM && rbsValue < 140;

          return (
            <Card 
              key={patient.id}
              className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-lg transition-all duration-200 hover:border-violet-300 relative group overflow-hidden"
            >
              <div 
                onClick={() => {
                  onSelectPatient(patient);
                  onNavigate('patient-profile');
                }}
                className="cursor-pointer"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-slate-900 mb-1 group-hover:text-violet-700 transition-colors">{patient.name}</h3>
                    <p className="text-slate-600 text-sm">{patient.id} • {patient.age}yo {patient.sex}</p>
                  <div className="flex flex-col gap-1 mt-2">
                    {sortedConditions.map((condition) => {
                      const isHTN = condition === 'HTN';
                      const isDM = condition === 'DM';
                      const controlled = isHTN ? htnControlled : isDM ? dmControlled : null;
                      
                      return (
                        <div key={condition} className="flex gap-1 items-center">
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${
                              isDM ? 'border-blue-300 text-blue-700 bg-blue-50' : 
                              isHTN ? 'border-orange-300 text-orange-700 bg-orange-50' : 
                              'border-slate-300 text-slate-700'
                            }`}
                          >
                            {isDM ? 'DM' : isHTN ? 'HTN' : condition}
                          </Badge>
                          {controlled !== null && (
                            <Badge 
                              variant="outline"
                              className={`text-xs ${
                                controlled 
                                  ? 'border-green-300 text-green-700 bg-green-50' 
                                  : 'border-red-300 text-red-700 bg-red-50'
                              }`}
                            >
                              {controlled ? 'Controlled' : 'Uncontrolled'}
                            </Badge>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <Badge className={
                    patient.riskLevel === 'Very High' ? 'bg-rose-600 text-white' :
                    patient.riskLevel === 'High' ? 'bg-red-100 text-red-700' :
                    patient.riskLevel === 'Medium' ? 'bg-amber-100 text-amber-700' :
                    'bg-green-100 text-green-700'
                  }>
                    {patient.riskLevel} Risk
                  </Badge>
                  {patient.nextFollowUp && (
                    <div className="w-5 h-4 bg-amber-500 flex items-center justify-center" style={{ clipPath: 'polygon(0% 50%, 25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%)' }}>
                      <Clock className="w-2.5 h-2.5 text-white" />
                    </div>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2 mb-3">
                <div className="text-xs">
                  <span className="text-slate-500">BP:</span>
                  <span className="text-slate-900 ml-1">{patient.latestBP}</span>
                </div>
                <div className="text-xs">
                  <span className="text-slate-500">RBG:</span>
                  <span className="text-slate-900 ml-1">{patient.latestRBS}</span>
                </div>
              </div>

                <div className="flex items-center justify-between">
                  <div className="text-xs text-slate-600">
                    <MapPin className="w-3 h-3 inline mr-1" />
                    {patient.barangay}
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-violet-600 transition-colors" />
                </div>
              </div>
              
              {/* Quick Action Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectPatient(patient);
                  onNavigate('new-visit');
                  toast.success('Quick visit started', {
                    description: `Recording visit for ${patient.name}`,
                  });
                }}
                className="absolute bottom-4 right-4 w-10 h-10 bg-violet-600 text-white rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-lg hover:bg-violet-700 active:scale-95"
              >
                <Plus className="w-5 h-5" />
              </button>
            </Card>
          );
        })
        )}
      </div>

      {/* Bottom Navigation */}
      <BottomNav onNavigate={onNavigate} currentScreen="patients-list" newHighRiskCount={newHighRiskCount} isSyncOverdue={isSyncOverdue} />
    </div>
  );
}

// New Patient Screen
function NewPatientScreen({
  onBack,
  onNext,
  onCreatePatient
}: {
  onBack: () => void;
  onNext: () => void;
  onCreatePatient: (data: {
    firstName: string;
    middleName?: string;
    lastName: string;
    dateOfBirth: string;
    age: number;
    sex: string;
    barangay: string;
    purok?: string;
    address: string;
    contact?: string;
    occupation?: string;
    education?: string;
    maritalStatus?: string;
    conditions?: string[];
  }) => Promise<Patient>;
}) {
  const [firstName, setFirstName] = React.useState('');
  const [middleName, setMiddleName] = React.useState('');
  const [lastName, setLastName] = React.useState('');
  const [dateOfBirth, setDateOfBirth] = React.useState('');
  const [calculatedAge, setCalculatedAge] = React.useState<number | null>(null);
  const [selectedSex, setSelectedSex] = React.useState('');
  const [selectedBarangay, setSelectedBarangay] = React.useState('');
  const [purok, setPurok] = React.useState('');
  const [contact, setContact] = React.useState('');
  const [selectedOccupation, setSelectedOccupation] = React.useState('');
  const [otherOccupation, setOtherOccupation] = React.useState('');
  const [selectedEducation, setSelectedEducation] = React.useState('');
  const [selectedMaritalStatus, setSelectedMaritalStatus] = React.useState('');
  const [isSaving, setIsSaving] = React.useState(false);

  const calculateAge = (dob: string) => {
    // Format: dd/mm/yyyy
    const parts = dob.split('/');
    if (parts.length === 3) {
      const day = parseInt(parts[0]);
      const month = parseInt(parts[1]) - 1; // months are 0-indexed
      const year = parseInt(parts[2]);
      
      const birthDate = new Date(year, month, day);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      
      return age;
    }
    return null;
  };

  const handleDOBChange = (value: string) => {
    setDateOfBirth(value);
    const age = calculateAge(value);
    setCalculatedAge(age);
  };

  const handleContinue = async () => {
    if (!firstName || !lastName || !dateOfBirth || !calculatedAge || !selectedSex || !selectedBarangay || !purok) {
      toast.error('Please complete all required fields');
      return;
    }
    const occupation = selectedOccupation === 'Other' ? otherOccupation : selectedOccupation;
    if (!occupation || !selectedEducation || !selectedMaritalStatus) {
      toast.error('Please complete all required fields');
      return;
    }
    setIsSaving(true);
    try {
      await onCreatePatient({
        firstName,
        middleName,
        lastName,
        dateOfBirth,
        age: calculatedAge,
        sex: selectedSex === 'male' ? 'Male' : 'Female',
        barangay: selectedBarangay,
        purok,
        address: `${purok}, ${selectedBarangay}`,
        contact,
        occupation,
        education: selectedEducation,
        maritalStatus: selectedMaritalStatus
      });
      onNext();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="h-full bg-slate-50 flex flex-col">
      <div className="bg-white px-6 py-6 border-b border-slate-200">
        <button onClick={onBack} className="text-violet-600 mb-3 flex items-center gap-1 text-sm">
          <ChevronRight className="w-4 h-4 rotate-180" /> Back
        </button>
        <h2 className="text-slate-900">New Patient Profile</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="space-y-4">
          {/* Name Fields */}
          <div className="p-3 bg-violet-50 border border-violet-200 rounded-lg">
            <p className="text-violet-900 text-xs">⚠️ Enter name exactly as shown on legal ID</p>
          </div>

          <div>
            <Label className="text-slate-700 mb-2 block text-sm">
              First Name <span className="text-red-600">*</span>
            </Label>
            <Input className="h-11 bg-white border-slate-200" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
          </div>

          <div>
            <Label className="text-slate-700 mb-2 block text-sm">Middle Name</Label>
            <Input className="h-11 bg-white border-slate-200" value={middleName} onChange={(e) => setMiddleName(e.target.value)} />
          </div>

          <div>
            <Label className="text-slate-700 mb-2 block text-sm">
              Last Name <span className="text-red-600">*</span>
            </Label>
            <Input className="h-11 bg-white border-slate-200" value={lastName} onChange={(e) => setLastName(e.target.value)} />
          </div>

          {/* Date of Birth */}
          <div>
            <Label className="text-slate-700 mb-2 block text-sm">
              Date of Birth <span className="text-red-600">*</span>
            </Label>
            <Input 
              type="text" 
              placeholder="dd/mm/yyyy" 
              value={dateOfBirth}
              onChange={(e) => handleDOBChange(e.target.value)}
              className="h-11 bg-white border-slate-200" 
            />
            {calculatedAge !== null && (
              <p className="text-violet-600 text-xs mt-1">Age: {calculatedAge} years</p>
            )}
          </div>

          <div>
            <Label className="text-slate-700 mb-2 block text-sm">
              Sex <span className="text-red-600">*</span>
            </Label>
            <Select value={selectedSex} onValueChange={setSelectedSex}>
              <SelectTrigger className="h-11 bg-white border-slate-200">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Location */}
          <div>
            <Label className="text-slate-700 mb-2 block text-sm">
              Barangay <span className="text-red-600">*</span>
            </Label>
            <Select value={selectedBarangay} onValueChange={setSelectedBarangay}>
              <SelectTrigger className="h-11 bg-white border-slate-200">
                <SelectValue placeholder="Select barangay" />
              </SelectTrigger>
              <SelectContent>
                {barangays.map((b) => (
                  <SelectItem key={b} value={b}>{b}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-slate-700 mb-2 block text-sm">
              Purok <span className="text-red-600">*</span>
            </Label>
            <Input placeholder="e.g. Purok 3" className="h-11 bg-white border-slate-200" value={purok} onChange={(e) => setPurok(e.target.value)} />
          </div>

          <div>
            <Label className="text-slate-700 mb-2 block text-sm">Contact Number</Label>
            <Input type="tel" placeholder="+63" className="h-11 bg-white border-slate-200" value={contact} onChange={(e) => setContact(e.target.value)} />
          </div>

          {/* Occupation */}
          <div>
            <Label className="text-slate-700 mb-2 block text-sm">
              Occupation <span className="text-red-600">*</span>
            </Label>
            <Select value={selectedOccupation} onValueChange={setSelectedOccupation}>
              <SelectTrigger className="h-11 bg-white border-slate-200">
                <SelectValue placeholder="Select occupation" />
              </SelectTrigger>
              <SelectContent>
                {occupations.map((occ) => (
                  <SelectItem key={occ} value={occ}>{occ}</SelectItem>
                ))}
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Other Occupation Text Field */}
          {selectedOccupation === 'Other' && (
            <div>
              <Label className="text-slate-700 mb-2 block text-sm">
                Please specify occupation <span className="text-red-600">*</span>
              </Label>
              <Input 
                value={otherOccupation}
                onChange={(e) => setOtherOccupation(e.target.value)}
                placeholder="Enter occupation" 
                className="h-11 bg-white border-slate-200" 
              />
            </div>
          )}

          {/* Education */}
          <div>
            <Label className="text-slate-700 mb-2 block text-sm">
              Education Level <span className="text-red-600">*</span>
            </Label>
            <Select value={selectedEducation} onValueChange={setSelectedEducation}>
              <SelectTrigger className="h-11 bg-white border-slate-200">
                <SelectValue placeholder="Select education level" />
              </SelectTrigger>
              <SelectContent>
                {educationLevels.map((edu) => (
                  <SelectItem key={edu} value={edu}>{edu}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Marital Status */}
          <div>
            <Label className="text-slate-700 mb-2 block text-sm">
              Marital Status <span className="text-red-600">*</span>
            </Label>
            <Select value={selectedMaritalStatus} onValueChange={setSelectedMaritalStatus}>
              <SelectTrigger className="h-11 bg-white border-slate-200">
                <SelectValue placeholder="Select marital status" />
              </SelectTrigger>
              <SelectContent>
                {maritalStatuses.map((status) => (
                  <SelectItem key={status} value={status}>{status}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="p-6 border-t border-slate-200 bg-white">
        <Button onClick={handleContinue} className="w-full h-12 bg-violet-600 hover:bg-violet-700 rounded-xl" disabled={isSaving}>
          {isSaving ? 'Saving...' : 'Continue to Screening'}
        </Button>
      </div>
    </div>
  );
}

// Initial Screening Screen
function InitialScreeningScreen({
  onBack,
  onSave,
  patientId,
  onPendingSyncChange
}: {
  onBack: () => void;
  onSave: () => void;
  patientId?: string;
  onPendingSyncChange?: (count: number) => void;
}) {
  const [medicationList, setMedicationList] = React.useState<Array<{ name: string; dosage: string }>>([
    { name: '', dosage: '' }
  ]);
  const [weight, setWeight] = React.useState('');
  const [height, setHeight] = React.useState('');
  const [systolic, setSystolic] = React.useState('');
  const [diastolic, setDiastolic] = React.useState('');
  const [randomGlucose, setRandomGlucose] = React.useState('');
  const [fastingGlucose, setFastingGlucose] = React.useState('');
  const [medicationsProvided, setMedicationsProvided] = React.useState<'Y' | 'N' | null>(null);
  const [medicationsTakenRegularly, setMedicationsTakenRegularly] = React.useState<'Y' | 'N' | null>(null);
  const [previousMedications, setPreviousMedications] = React.useState('');
  const [hasHTN, setHasHTN] = React.useState(false);
  const [hasDM, setHasDM] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);

  const addMedication = () => {
    setMedicationList([...medicationList, { name: '', dosage: '' }]);
  };

  const removeMedication = (index: number) => {
    setMedicationList(medicationList.filter((_, i) => i !== index));
  };

  const parsedWeight = Number(weight);
  const parsedHeight = Number(height);
  const bmiValue = parsedWeight > 0 && parsedHeight > 0 ? parsedWeight / ((parsedHeight / 100) ** 2) : null;
  const bmiRounded = bmiValue ? Math.round(bmiValue * 10) / 10 : null;
  const bmiLabel = bmiRounded === null
    ? ''
    : bmiRounded < 18.5
      ? 'Underweight'
      : bmiRounded < 23
        ? 'Normal'
        : bmiRounded < 25
          ? 'Overweight'
          : bmiRounded < 30
            ? 'Obese I'
            : 'Obese II';

  const handleSave = async () => {
    if (!patientId) {
      toast.error('No patient selected');
      return;
    }
    setIsSaving(true);
    let visitPayload: any;
    try {
      const currentMeds = medicationList
        .filter((m) => m.name && m.dosage)
        .map((m) => ({ name: m.name, dosage: m.dosage, quantity: 30, instructions: 'Take as prescribed' }));
      const parsedSystolic = systolic ? Number(systolic) : undefined;
      const parsedDiastolic = diastolic ? Number(diastolic) : undefined;
      const parsedRandomGlucose = randomGlucose ? Number(randomGlucose) : undefined;
      const parsedFastingGlucose = fastingGlucose ? Number(fastingGlucose) : undefined;
      const shouldFlag = (parsedSystolic !== undefined && parsedDiastolic !== undefined && parsedSystolic >= 140 && parsedDiastolic >= 90)
        || (parsedRandomGlucose !== undefined && parsedRandomGlucose >= 200)
        || (parsedFastingGlucose !== undefined && parsedFastingGlucose >= 126)
        || (bmiRounded !== null && bmiRounded >= 30);
      visitPayload = {
        patient_id: patientId,
        visit_type: 'screening',
        vitals: {
          weight: weight ? Number(weight) : undefined,
          height: height ? Number(height) : undefined,
          bmi: bmiRounded !== null ? bmiRounded : undefined,
          systolic: parsedSystolic,
          diastolic: parsedDiastolic,
          glucose_random: parsedRandomGlucose,
          glucose_fasting: parsedFastingGlucose
        },
        current_medications: currentMeds,
        medications_provided: medicationsProvided === 'Y' ? true : medicationsProvided === 'N' ? false : undefined,
        medications_taken_regularly: medicationsTakenRegularly === 'Y' ? true : medicationsTakenRegularly === 'N' ? false : undefined,
        previous_medications: previousMedications || undefined,
        flagged_for_follow_up: shouldFlag
      };
      let conditions: string[] = [];
      if (hasHTN) conditions.push('HTN');
      if (hasDM) conditions.push('DM');
      if (conditions.length === 0) {
        if (parsedSystolic !== undefined && parsedDiastolic !== undefined && parsedSystolic >= 140 && parsedDiastolic >= 90) {
          conditions.push('HTN');
        }
        if (parsedRandomGlucose !== undefined && parsedRandomGlucose >= 200) {
          conditions.push('DM');
        }
        if (parsedFastingGlucose !== undefined && parsedFastingGlucose >= 126) {
          conditions.push('DM');
        }
      }
      if (conditions.length > 0) {
        await apiClient.updatePatient(patientId, { conditions });
      }
      await apiClient.recordVisit(visitPayload);
      toast.success('Screening saved');
      onSave();
    } catch (error: any) {
      const isOffline = typeof navigator !== 'undefined' && !navigator.onLine;
      const isNetworkError = (error?.message || '').toLowerCase().includes('failed to fetch');
      if (isOffline || isNetworkError) {
        const count = enqueuePendingVisit({
          ...visitPayload,
          sync_status: 'pending',
          created_at: new Date().toISOString()
        });
        onPendingSyncChange?.(count);
        toast.success('Screening saved locally', {
          description: 'Will sync when back online',
          icon: <WifiOff className="w-4 h-4" />
        });
        onSave();
        return;
      }
      toast.error(error.message || 'Failed to save screening');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="h-full bg-slate-50 flex flex-col">
      <div className="bg-white px-6 py-6 border-b border-slate-200">
        <button onClick={onBack} className="text-violet-600 mb-3 flex items-center gap-1 text-sm">
          <ChevronRight className="w-4 h-4 rotate-180" /> Back
        </button>
        <h2 className="text-slate-900">Initial Screening</h2>
        <p className="text-slate-500 text-sm">Health Assessment</p>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="space-y-6">
          {/* Vitals */}
          <div>
            <h3 className="text-slate-900 mb-3 text-sm"><strong>Vital Signs</strong></h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-slate-700 mb-2 block text-xs">Weight (kg)</Label>
                <Input type="text" inputMode="numeric" pattern="[0-9]*" className="h-11 bg-white border-slate-200" value={weight} onChange={(e) => setWeight(e.target.value)} />
              </div>
              <div>
                <Label className="text-slate-700 mb-2 block text-xs">Height (cm)</Label>
                <Input type="text" inputMode="numeric" pattern="[0-9]*" className="h-11 bg-white border-slate-200" value={height} onChange={(e) => setHeight(e.target.value)} />
              </div>
              <div>
                <Label className="text-slate-700 mb-2 block text-xs">Systolic BP</Label>
                <Input type="text" inputMode="numeric" pattern="[0-9]*" className="h-11 bg-white border-slate-200" value={systolic} onChange={(e) => setSystolic(e.target.value)} />
              </div>
              <div>
                <Label className="text-slate-700 mb-2 block text-xs">Diastolic BP</Label>
                <Input type="text" inputMode="numeric" pattern="[0-9]*" className="h-11 bg-white border-slate-200" value={diastolic} onChange={(e) => setDiastolic(e.target.value)} />
              </div>
            </div>

            <div className="p-4 bg-violet-50 rounded-xl border border-violet-200 mt-3">
              <div className="flex justify-between items-center">
                <span className="text-slate-700 text-sm">BMI:</span>
              <span className="text-violet-900">
                {bmiRounded !== null ? `${bmiRounded} (${bmiLabel})` : '—'}
              </span>
              </div>
            </div>
          </div>

          {/* Lab Results */}
          <div>
            <h3 className="text-slate-900 mb-3 text-sm"><strong>Laboratory Results</strong></h3>
            <div className="space-y-3">
              <div>
                <Label className="text-slate-700 mb-2 block text-xs">Random Blood Sugar (mg/dL)</Label>
                <Input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  className="h-11 bg-white border-slate-200"
                  value={randomGlucose}
                  onChange={(e) => setRandomGlucose(e.target.value)}
                />
              </div>
              <div>
                <Label className="text-slate-700 mb-2 block text-xs">Fasting Blood Sugar (mg/dL)</Label>
                <Input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  className="h-11 bg-white border-slate-200"
                  value={fastingGlucose}
                  onChange={(e) => setFastingGlucose(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Current Medications */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-slate-900 text-sm"><strong>Current Medications</strong></h3>
              <Button
                type="button"
                onClick={addMedication}
                variant="outline"
                size="sm"
                className="h-8 text-xs"
              >
                <Plus className="w-3 h-3 mr-1" />
                Add
              </Button>
            </div>
            <div className="space-y-3">
              {medicationList.map((med, index) => (
                <div key={index} className="grid grid-cols-[1fr_1fr_auto] gap-2">
                  <div>
                    <Label className="text-slate-700 mb-1 block text-xs">Medication</Label>
                    <Select
                      value={med.name}
                      onValueChange={(value) => {
                        setMedicationList((prev) =>
                          prev.map((item, i) => (i === index ? { ...item, name: value } : item))
                        );
                      }}
                    >
                      <SelectTrigger className="h-11 bg-white border-slate-200">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        {medications.map((medication) => (
                          <SelectItem key={medication} value={medication}>{medication}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-slate-700 mb-1 block text-xs">Dosage</Label>
                    <Input 
                      placeholder="e.g. 500mg 2x daily" 
                      className="h-11 bg-white border-slate-200"
                      value={med.dosage}
                      onChange={(e) => {
                        const value = e.target.value;
                        setMedicationList((prev) =>
                          prev.map((item, i) => (i === index ? { ...item, dosage: value } : item))
                        );
                      }}
                    />
                  </div>
                  {medicationList.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeMedication(index)}
                      className="mt-6 text-red-600 hover:text-red-700"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Medication Status */}
          <div className="space-y-4">
            <div>
              <Label className="text-slate-700 mb-2 block text-sm">Any medications provided?</Label>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant={medicationsProvided === 'Y' ? 'default' : 'outline'}
                  onClick={() => setMedicationsProvided('Y')}
                  className={`h-11 ${medicationsProvided === 'Y' ? 'bg-green-600 hover:bg-green-700' : ''}`}
                >
                  Yes
                </Button>
                <Button
                  type="button"
                  variant={medicationsProvided === 'N' ? 'default' : 'outline'}
                  onClick={() => setMedicationsProvided('N')}
                  className={`h-11 ${medicationsProvided === 'N' ? 'bg-red-600 hover:bg-red-700' : ''}`}
                >
                  No
                </Button>
              </div>
            </div>

            <div>
              <Label className="text-slate-700 mb-2 block text-sm">Previous medications</Label>
              <Textarea
                placeholder="List previous medications..."
                className="bg-white border-slate-200"
                rows={3}
                value={previousMedications}
                onChange={(e) => setPreviousMedications(e.target.value)}
              />
            </div>

            <div>
              <Label className="text-slate-700 mb-2 block text-sm">Are medications taken regularly?</Label>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant={medicationsTakenRegularly === 'Y' ? 'default' : 'outline'}
                  onClick={() => setMedicationsTakenRegularly('Y')}
                  className={`h-11 ${medicationsTakenRegularly === 'Y' ? 'bg-green-600 hover:bg-green-700' : ''}`}
                >
                  Yes
                </Button>
                <Button
                  type="button"
                  variant={medicationsTakenRegularly === 'N' ? 'default' : 'outline'}
                  onClick={() => setMedicationsTakenRegularly('N')}
                  className={`h-11 ${medicationsTakenRegularly === 'N' ? 'bg-red-600 hover:bg-red-700' : ''}`}
                >
                  No
                </Button>
              </div>
            </div>
          </div>

          {/* Family History */}
          <div>
            <h3 className="text-slate-900 mb-3 text-sm"><strong>Family History</strong></h3>
            <Textarea 
              placeholder="Record patient's family history of HTN, DM, or other relevant conditions..." 
              className="bg-white border-slate-200" 
              rows={4} 
            />
          </div>

          {/* Conditions */}
          <div>
            <h3 className="text-slate-900 mb-3 text-sm"><strong>Diagnosed Conditions</strong></h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="htn"
                  checked={hasHTN}
                  onCheckedChange={(checked) => setHasHTN(Boolean(checked))}
                />
                <Label htmlFor="htn" className="text-slate-700 text-sm">Hypertension</Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="dm"
                  checked={hasDM}
                  onCheckedChange={(checked) => setHasDM(Boolean(checked))}
                />
                <Label htmlFor="dm" className="text-slate-700 text-sm">Diabetes Mellitus</Label>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 border-t border-slate-200 bg-white">
        <Button onClick={handleSave} className="w-full h-12 bg-violet-600 hover:bg-violet-700 rounded-xl" disabled={isSaving}>
          {isSaving ? 'Saving...' : 'Save New Patient Profile'}
        </Button>
      </div>
    </div>
  );
}

// Visit Information Screen
function VisitInformationScreen({ onBack, patientId, patientName }: { onBack: () => void; patientId?: string; patientName?: string }) {
  const [showPrintPreview, setShowPrintPreview] = useState(false);
  const [showSMSPreview, setShowSMSPreview] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [editedData, setEditedData] = useState({
    visitId: 'VST-20251031-001',
    patientId: patientId || '',
    patientName: patientName || '',
    visitDate: '',
    visitType: '',
    systolicBp: '135',
    diastolicBp: '85',
    bloodSugar: '145',
    medicationTaken: 'Yes',
    complications: ['Blurred Vision', 'Numbness in Feet'],
    newMedications: 'Increased Metformin to 1000mg 2x daily',
    visitNotes: 'Patient reports improved adherence to medication schedule. BP slightly elevated, advised on salt reduction.',
    nextFollowUp: '2025-11-30',
    recordedBy: 'BHW-03456789',
    recordedDate: '2025-10-31 10:30 AM'
  });
  
  const visitData = editedData;

  useEffect(() => {
    const loadVisit = async () => {
      if (!patientId) return;
      setIsLoading(true);
      setLoadError(null);
      try {
        const response = await apiClient.getPatientVisits(patientId);
        const latest = (response.visits || []).sort((a: any, b: any) => {
          const aTime = a.visit_date ? new Date(a.visit_date).getTime() : 0;
          const bTime = b.visit_date ? new Date(b.visit_date).getTime() : 0;
          return bTime - aTime;
        })[0];
        if (latest) {
          const visitDate = latest.visit_date ? new Date(latest.visit_date).toISOString().slice(0, 10) : '';
          const recordedDate = latest.created_at ? new Date(latest.created_at).toLocaleString() : '';
          const newMeds = latest.new_medication_prescribed
            ? String(latest.new_medication_prescribed)
            : Array.isArray(latest.medications_dispensed)
              ? latest.medications_dispensed.map((m: any) => `${m.name} ${m.dosage}`).join(', ')
              : '';
          setEditedData((prev) => ({
            ...prev,
            visitId: latest.visit_id || latest._id || prev.visitId,
            patientId: patientId,
            patientName: patientName || prev.patientName,
            visitDate,
            visitType: latest.visit_type || 'Follow-up',
            systolicBp: latest.vitals?.systolic ? String(latest.vitals.systolic) : '',
            diastolicBp: latest.vitals?.diastolic ? String(latest.vitals.diastolic) : '',
            bloodSugar: latest.vitals?.glucose ? String(latest.vitals.glucose) : '',
            medicationTaken: latest.medications_taken_regularly === undefined ? 'Unknown' : latest.medications_taken_regularly ? 'Yes' : 'No',
            complications: latest.complications || [],
            newMedications: newMeds,
            visitNotes: latest.clinical_notes || latest.notes || '',
            nextFollowUp: latest.next_visit_date ? new Date(latest.next_visit_date).toISOString().slice(0, 10) : '',
            recordedBy: latest.recorded_by || '',
            recordedDate: recordedDate || prev.recordedDate
          }));
        }
      } catch (error: any) {
        setLoadError(error.message || 'Failed to load visit');
      } finally {
        setIsLoading(false);
      }
    };
    loadVisit();
  }, [patientId, patientName]);

  const handlePrint = () => {
    setShowPrintPreview(true);
  };

  const confirmPrint = () => {
    // In a real app, this would generate a PDF
    alert('Generating visit sticker PDF for printing...');
    setShowPrintPreview(false);
  };

  const handleSendSMS = () => {
    setShowSMSPreview(true);
  };

  const confirmSMS = () => {
    // In a real app, this would send SMS
    alert('Sending visit summary via SMS to patient...');
    setShowSMSPreview(false);
  };

  const smsMessage = `Jagna Health: Hi ${visitData.patientName}, your visit on ${visitData.visitDate} recorded. BP: ${visitData.systolicBp}/${visitData.diastolicBp}, RBS: ${visitData.bloodSugar} mg/dL. Next follow-up: ${visitData.nextFollowUp}. Take care!`;

  return (
    <div className="h-full bg-slate-50 flex flex-col">
      <div className="bg-white px-6 py-6 border-b border-slate-200">
        <button onClick={onBack} className="text-violet-600 mb-3 flex items-center gap-1 text-sm">
          <ChevronRight className="w-4 h-4 rotate-180" /> Back
        </button>
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-slate-900">Visit Information</h2>
            <p className="text-slate-500 text-sm">Visit ID: {visitData.visitId}</p>
            {isLoading && <p className="text-slate-500 text-xs mt-1">Loading latest visit...</p>}
            {loadError && <p className="text-red-600 text-xs mt-1">{loadError}</p>}
          </div>
          <button
            onClick={() => {
              if (isEditing) {
                toast.success('Visit information updated successfully');
              }
              setIsEditing(!isEditing);
            }}
            className="w-10 h-10 bg-violet-100 rounded-lg flex items-center justify-center flex-shrink-0"
          >
            {isEditing ? (
              <Save className="w-5 h-5 text-violet-600" />
            ) : (
              <Edit2 className="w-5 h-5 text-violet-600" />
            )}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="space-y-4">
          {/* Patient Info */}
          <Card className="p-4 bg-white border border-slate-200 rounded-xl">
            <h3 className="text-slate-900 mb-3 text-sm">Patient Information</h3>
            <div className="space-y-2">
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500 text-sm">Patient ID</span>
                <span className="text-slate-900 text-sm">{visitData.patientId}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-slate-500 text-sm">Patient Name</span>
                <span className="text-slate-900 text-sm">{visitData.patientName}</span>
              </div>
            </div>
          </Card>

          {/* Visit Details */}
          <Card className="p-4 bg-white border border-slate-200 rounded-xl">
            <h3 className="text-slate-900 mb-3 text-sm">Visit Details</h3>
            {isEditing ? (
              <div className="space-y-3">
                <div>
                  <Label className="text-slate-700 mb-1 block text-xs">Visit Date</Label>
                  <Input 
                    type="date"
                    value={editedData.visitDate}
                    onChange={(e) => setEditedData({...editedData, visitDate: e.target.value})}
                    className="h-11 bg-white border-slate-200"
                  />
                </div>
                <div>
                  <Label className="text-slate-700 mb-1 block text-xs">Visit Type</Label>
                  <Select 
                    value={editedData.visitType}
                    onValueChange={(value) => setEditedData({...editedData, visitType: value})}
                  >
                    <SelectTrigger className="h-11 bg-white border-slate-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Initial Screening">Initial Screening</SelectItem>
                      <SelectItem value="Routine Follow-Up">Routine Follow-Up</SelectItem>
                      <SelectItem value="Emergency Visit">Emergency Visit</SelectItem>
                      <SelectItem value="Medication Review">Medication Review</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500 text-sm">Visit Date</span>
                  <span className="text-slate-900 text-sm">{visitData.visitDate}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500 text-sm">Visit Type</span>
                  <span className="text-slate-900 text-sm">{visitData.visitType}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-slate-500 text-sm">Recorded By</span>
                  <span className="text-slate-900 text-sm">{visitData.recordedBy}</span>
                </div>
              </div>
            )}
          </Card>

          {/* Vital Signs */}
          <Card className="p-4 bg-white border border-slate-200 rounded-xl">
            <h3 className="text-slate-900 mb-3 text-sm">Vital Signs</h3>
            {isEditing ? (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-slate-700 mb-1 block text-xs">Systolic BP</Label>
                    <Input 
                      type="text" 
                      value={editedData.systolicBp}
                      onChange={(e) => setEditedData({...editedData, systolicBp: e.target.value})}
                      className="h-11 bg-white border-slate-200"
                    />
                  </div>
                  <div>
                    <Label className="text-slate-700 mb-1 block text-xs">Diastolic BP</Label>
                    <Input 
                      type="text" 
                      value={editedData.diastolicBp}
                      onChange={(e) => setEditedData({...editedData, diastolicBp: e.target.value})}
                      className="h-11 bg-white border-slate-200"
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-slate-700 mb-1 block text-xs">Blood Sugar (mg/dL)</Label>
                  <Input 
                    type="text" 
                    value={editedData.bloodSugar}
                    onChange={(e) => setEditedData({...editedData, bloodSugar: e.target.value})}
                    className="h-11 bg-white border-slate-200"
                  />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-violet-50 rounded-lg">
                  <div className="text-slate-500 text-xs mb-1">Blood Pressure</div>
                  <div className="text-slate-900">{visitData.systolicBp}/{visitData.diastolicBp} mmHg</div>
                </div>
                <div className="p-3 bg-orange-50 rounded-lg">
                  <div className="text-slate-500 text-xs mb-1">Blood Sugar</div>
                  <div className="text-slate-900">{visitData.bloodSugar} mg/dL</div>
                </div>
              </div>
            )}
          </Card>

          {/* Treatment & Adherence */}
          <Card className="p-4 bg-white border border-slate-200 rounded-xl">
            <h3 className="text-slate-900 mb-3 text-sm">Treatment & Adherence</h3>
            <div className="space-y-3">
              {isEditing ? (
                <>
                  <div>
                    <Label className="text-slate-700 mb-1 block text-xs">Medication Taken as Prescribed</Label>
                    <Select 
                      value={editedData.medicationTaken}
                      onValueChange={(value) => setEditedData({...editedData, medicationTaken: value})}
                    >
                      <SelectTrigger className="h-11 bg-white border-slate-200">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Yes">Yes</SelectItem>
                        <SelectItem value="No">No</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-slate-700 mb-1 block text-xs">New Medications Prescribed</Label>
                    <Textarea
                      value={editedData.newMedications}
                      onChange={(e) => setEditedData({...editedData, newMedications: e.target.value})}
                      className="bg-white border-slate-200"
                      rows={2}
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <div className="text-slate-500 text-xs mb-1">Medication Taken as Prescribed</div>
                    <Badge className={visitData.medicationTaken === 'Yes' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
                      {visitData.medicationTaken}
                    </Badge>
                  </div>
                  {visitData.newMedications && (
                    <div>
                      <div className="text-slate-500 text-xs mb-1">New Medications Prescribed</div>
                      <p className="text-slate-900 text-sm">{visitData.newMedications}</p>
                    </div>
                  )}
                </>
              )}
            </div>
          </Card>

          {/* Complications */}
          {visitData.complications.length > 0 && (
            <Card className="p-4 bg-white border border-slate-200 rounded-xl">
              <h3 className="text-slate-900 mb-3 text-sm">Complications Screened</h3>
              <div className="flex flex-wrap gap-2">
                {visitData.complications.map((comp, index) => (
                  <Badge key={index} className="bg-red-100 text-red-700">
                    {comp}
                  </Badge>
                ))}
              </div>
            </Card>
          )}

          {/* Visit Notes */}
          <Card className="p-4 bg-white border border-slate-200 rounded-xl">
            <h3 className="text-slate-900 mb-3 text-sm">Visit Notes</h3>
            {isEditing ? (
              <Textarea
                value={editedData.visitNotes}
                onChange={(e) => setEditedData({...editedData, visitNotes: e.target.value})}
                className="bg-white border-slate-200"
                rows={4}
              />
            ) : (
              <p className="text-slate-700 text-sm">{visitData.visitNotes}</p>
            )}
          </Card>

          {/* Next Follow-up */}
          <Card className="p-4 bg-indigo-50 border border-indigo-200 rounded-xl">
            {isEditing ? (
              <div>
                <Label className="text-slate-700 mb-2 block text-xs">Next Follow-up Date</Label>
                <Input 
                  type="date"
                  value={editedData.nextFollowUp}
                  onChange={(e) => setEditedData({...editedData, nextFollowUp: e.target.value})}
                  className="h-11 bg-white border-slate-200"
                />
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-indigo-600" />
                <div>
                  <div className="text-slate-500 text-xs">Next Follow-up Date</div>
                  <div className="text-indigo-900">{visitData.nextFollowUp}</div>
                </div>
              </div>
            )}
          </Card>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <Button 
              onClick={handlePrint}
              variant="outline"
              className="h-12 rounded-xl"
            >
              <Printer className="w-4 h-4 mr-2" />
              Print Sticker
            </Button>
            <Button 
              onClick={handleSendSMS}
              className="h-12 bg-violet-600 hover:bg-violet-700 rounded-xl"
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              Send SMS
            </Button>
          </div>
        </div>
      </div>

      {/* Print Preview Dialog */}
      <Dialog open={showPrintPreview} onOpenChange={setShowPrintPreview}>
        <DialogContent className="w-80 max-h-[600px] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Sticker Preview</DialogTitle>
            <DialogDescription>
              Preview of patient visit sticker
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="border-2 border-dashed border-slate-300 rounded-lg p-4 bg-white">
              <div className="text-center mb-3">
                <h3 className="text-slate-900">Jagna Community Health</h3>
                <p className="text-slate-500 text-xs">Visit Record Sticker</p>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span className="text-slate-500">Visit ID:</span>
                  <span className="text-slate-900">{visitData.visitId}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span className="text-slate-500">Patient:</span>
                  <span className="text-slate-900">{visitData.patientName}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span className="text-slate-500">Patient ID:</span>
                  <span className="text-slate-900">{visitData.patientId}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span className="text-slate-500">Date:</span>
                  <span className="text-slate-900">{visitData.visitDate}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span className="text-slate-500">BP:</span>
                  <span className="text-slate-900">{visitData.systolicBp}/{visitData.diastolicBp} mmHg</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span className="text-slate-500">RBS:</span>
                  <span className="text-slate-900">{visitData.bloodSugar} mg/dL</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span className="text-slate-500">Next Visit:</span>
                  <span className="text-slate-900">{visitData.nextFollowUp}</span>
                </div>
                <div className="pt-2 text-center">
                  <p className="text-slate-400 text-xs">Recorded by: {visitData.recordedBy}</p>
                </div>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Button 
              onClick={() => setShowPrintPreview(false)}
              variant="outline"
            >
              Cancel
            </Button>
            <Button 
              onClick={confirmPrint}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              <Printer className="w-4 h-4 mr-2" />
              Confirm Print
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* SMS Preview Dialog */}
      <Dialog open={showSMSPreview} onOpenChange={setShowSMSPreview}>
        <DialogContent className="w-80">
          <DialogHeader>
            <DialogTitle>SMS Preview</DialogTitle>
            <DialogDescription>
              Preview of SMS message to be sent
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="border border-slate-300 rounded-lg p-4 bg-slate-50">
              <p className="text-slate-700 text-sm leading-relaxed">{smsMessage}</p>
            </div>
            <p className="text-slate-500 text-xs mt-3">
              To: {visitData.patientName} (Patient)
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Button 
              onClick={() => setShowSMSPreview(false)}
              variant="outline"
            >
              Cancel
            </Button>
            <Button 
              onClick={confirmSMS}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              Send SMS
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Patient Profile Screen
function PatientProfileScreen({ 
  patient, 
  onBack, 
  isEditing, 
  onEdit, 
  onSave,
  onNavigate 
}: { 
  patient: Patient; 
  onBack: () => void; 
  isEditing: boolean;
  onEdit: () => void;
  onSave: () => void;
  onNavigate: (screen: Screen) => void;
}) {
  // Determine controlled/uncontrolled status
  const hasHTN = patient.conditions.includes('HTN');
  const hasDM = patient.conditions.includes('DM');
  const bpParts = patient.latestBP.split('/');
  const systolic = parseInt(bpParts[0]);
  const rbsValue = parseInt(patient.latestRBS);
  const htnControlled = hasHTN && systolic < 140;
  const dmControlled = hasDM && rbsValue < 140;

  return (
    <div className="h-full bg-slate-50 flex flex-col">
      <div className="bg-white px-6 py-6 border-b border-slate-200">
        <button onClick={onBack} className="text-violet-600 mb-3 flex items-center gap-1 text-sm">
          <ChevronRight className="w-4 h-4 rotate-180" /> Patient Registry
        </button>
        <h2 className="text-slate-900 mb-4">Patient Profile</h2>
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <p className="text-slate-500 text-sm mb-1">{patient.id}</p>
            <h2 className="text-slate-900 mb-1 font-bold">{patient.name}</h2>
            <p className="text-slate-600 text-sm mb-2">{patient.age} years old • {patient.sex}</p>
            <div className="flex flex-col gap-1">
              {hasHTN && (
                <div className="flex gap-1 items-center">
                  <Badge variant="outline" className="text-xs border-orange-300 text-orange-700 bg-orange-50">
                    HTN
                  </Badge>
                  <Badge 
                    variant="outline"
                    className={`text-xs ${htnControlled ? 'border-green-300 text-green-700 bg-green-50' : 'border-red-300 text-red-700 bg-red-50'}`}
                  >
                    {htnControlled ? 'Controlled' : 'Uncontrolled'}
                  </Badge>
                </div>
              )}
              {hasDM && (
                <div className="flex gap-1 items-center">
                  <Badge variant="outline" className="text-xs border-blue-300 text-blue-700 bg-blue-50">
                    DM
                  </Badge>
                  <Badge 
                    variant="outline"
                    className={`text-xs ${dmControlled ? 'border-green-300 text-green-700 bg-green-50' : 'border-red-300 text-red-700 bg-red-50'}`}
                  >
                    {dmControlled ? 'Controlled' : 'Uncontrolled'}
                  </Badge>
                </div>
              )}
              <div className="flex gap-1">
                <Badge className={
                  patient.riskLevel === 'Very High' ? 'bg-rose-600 text-white text-xs' :
                  patient.riskLevel === 'High' ? 'bg-red-100 text-red-700 text-xs' :
                  patient.riskLevel === 'Medium' ? 'bg-amber-100 text-amber-700 text-xs' :
                  'bg-green-100 text-green-700 text-xs'
                }>
                  {patient.riskLevel} Risk
                </Badge>
              </div>
            </div>
          </div>
          <button
            onClick={isEditing ? onSave : onEdit}
            className="w-10 h-10 bg-violet-100 rounded-lg flex items-center justify-center flex-shrink-0"
          >
            {isEditing ? (
              <Save className="w-5 h-5 text-violet-600" />
            ) : (
              <Edit2 className="w-5 h-5 text-violet-600" />
            )}
          </button>
        </div>
      </div>

      <Tabs defaultValue="patient" className="flex-1 flex flex-col bg-slate-50 min-h-0">
        <TabsList className="w-full bg-white border-b border-slate-200 rounded-none justify-start px-6">
          <TabsTrigger value="patient" className="data-[state=active]:border-b-2 data-[state=active]:border-violet-600">
            Patient Info
          </TabsTrigger>
          <TabsTrigger value="clinical" className="data-[state=active]:border-b-2 data-[state=active]:border-violet-600">
            Clinical Data
          </TabsTrigger>
        </TabsList>

        <TabsContent value="patient" className="flex-1 overflow-y-auto p-6 pb-24 mt-0 min-h-0">
          <div className="space-y-4">
            {/* Personal Information */}
            <Card className="p-4 bg-white border border-slate-200 rounded-xl">
              <h3 className="text-slate-900 mb-2 text-sm"><strong>Personal Information</strong></h3>
              <div className="space-y-4">
                <div>
                  <Label className="text-slate-500 text-xs mb-1 block">Full Name</Label>
                  <Input 
                    value={`${patient.firstName} ${patient.middleName} ${patient.lastName}`}
                    disabled={!isEditing}
                    className="h-10 bg-white border-slate-200"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-slate-500 text-xs mb-1 block">Date of Birth</Label>
                    <Input 
                      value={patient.dateOfBirth} 
                      disabled={!isEditing}
                      className="h-10 bg-white border-slate-200"
                    />
                  </div>
                  <div>
                    <Label className="text-slate-500 text-xs mb-1 block">Age</Label>
                    <Input 
                      value={`${patient.age} years`}
                      disabled
                      className="h-10 bg-slate-50 border-slate-200"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-slate-500 text-xs mb-1 block">Sex</Label>
                    <Input 
                      value={patient.sex}
                      disabled={!isEditing}
                      className="h-10 bg-white border-slate-200"
                    />
                  </div>
                  <div>
                    <Label className="text-slate-500 text-xs mb-1 block">Marital Status</Label>
                    <Input 
                      value={patient.maritalStatus}
                      disabled={!isEditing}
                      className="h-10 bg-white border-slate-200"
                    />
                  </div>
                </div>
              </div>
            </Card>

            {/* Contact & Location */}
            <Card className="p-4 bg-white border border-slate-200 rounded-xl">
              <h3 className="text-slate-900 mb-2 text-sm"><strong>Contact & Location</strong></h3>
              <div className="space-y-4">
                <div>
                  <Label className="text-slate-500 text-xs mb-1 block">Phone</Label>
                  <Input 
                    value={patient.contact} 
                    disabled={!isEditing}
                    className="h-10 bg-white border-slate-200"
                  />
                </div>
                <div>
                  <Label className="text-slate-500 text-xs mb-1 block">Barangay</Label>
                  <Input 
                    value={patient.barangay} 
                    disabled={!isEditing}
                    className="h-10 bg-white border-slate-200"
                  />
                </div>
                <div>
                  <Label className="text-slate-500 text-xs mb-1 block">Purok</Label>
                  <Input 
                    value={patient.purok} 
                    disabled={!isEditing}
                    className="h-10 bg-white border-slate-200"
                  />
                </div>
              </div>
            </Card>

            {/* Socioeconomic Information */}
            <Card className="p-4 bg-white border border-slate-200 rounded-xl">
              <h3 className="text-slate-900 mb-2 text-sm">Socioeconomic Information</h3>
              <div className="space-y-4">
                <div>
                  <Label className="text-slate-500 text-xs mb-1 block">Occupation</Label>
                  <Input 
                    value={patient.occupation}
                    disabled={!isEditing}
                    className="h-10 bg-white border-slate-200"
                  />
                </div>
                <div>
                  <Label className="text-slate-500 text-xs mb-1 block">Education Level</Label>
                  <Input 
                    value={patient.education}
                    disabled={!isEditing}
                    className="h-10 bg-white border-slate-200"
                  />
                </div>
              </div>
            </Card>

            {/* Conditions */}
            <Card className="p-4 bg-white border border-slate-200 rounded-xl">
              <h3 className="text-slate-900 mb-2 text-sm">Diagnosed Conditions</h3>
              <div className="space-y-3">
                {patient.conditions.map((condition, index) => {
                  const isHTN = condition === 'HTN';
                  const isDM = condition === 'DM';
                  return (
                    <div key={condition} className="p-3 bg-slate-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className={
                          isDM ? 'bg-blue-100 text-blue-700' : 
                          isHTN ? 'bg-orange-100 text-orange-700' : 
                          'bg-slate-100 text-slate-700'
                        }>
                          {condition}
                        </Badge>
                      </div>
                      <div className="text-slate-500 text-xs mt-1">
                        Diagnosed: {index === 0 ? 'May 12, 2023' : 'Aug 5, 2023'}
                      </div>
                      <div className="text-slate-500 text-xs">
                        Severity: {patient.riskLevel === 'High' ? 'Moderate to Severe' : 'Mild to Moderate'}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* Current Medications */}
            {patient.currentMedications && patient.currentMedications.length > 0 && (
              <Card className="p-4 bg-white border border-slate-200 rounded-xl">
                <h3 className="text-slate-900 mb-2 text-sm">Current Medications</h3>
                <div className="space-y-3">
                  {patient.currentMedications.map((med, index) => (
                    <div key={index} className="p-3 bg-slate-50 rounded-lg">
                      <div className="text-slate-900 text-sm mb-1">{med.name}</div>
                      <div className="text-slate-700 text-xs mb-1">{med.dosage}</div>
                      <div className="text-slate-500 text-xs">
                        Prescribed: {index === 0 ? 'May 12, 2023' : index === 1 ? 'May 12, 2023' : 'Sep 10, 2024'}
                      </div>
                      {index === 0 && patient.riskLevel === 'High' && (
                        <div className="text-amber-600 text-xs mt-1">
                          ⚠️ Dosage increased from 500mg on Sep 10, 2024
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Family History */}
            {patient.familyHistory && (
              <Card className="p-4 bg-white border border-slate-200 rounded-xl">
                <h3 className="text-slate-900 mb-2 text-sm">Family History</h3>
                <p className="text-slate-700 text-sm">{patient.familyHistory}</p>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="clinical" className="flex-1 overflow-y-auto p-6 pb-24 mt-0 min-h-0">
          <div className="space-y-4">
            {/* Latest Vitals */}
            <Card className="p-4 bg-white border border-slate-200 rounded-xl">
              <h3 className="text-slate-900 mb-2 text-sm">Latest Vitals</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 rounded-lg">
                  <div className="text-slate-500 text-xs mb-1">Blood Pressure</div>
                  <div className="text-slate-900 text-sm">{patient.latestBP}</div>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg">
                  <div className="text-slate-500 text-xs mb-1">RBS</div>
                  <div className="text-slate-900 text-sm">{patient.latestRBS}</div>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg">
                  <div className="text-slate-500 text-xs mb-1">Weight</div>
                  <div className="text-slate-900 text-sm">{patient.weight}</div>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg">
                  <div className="text-slate-500 text-xs mb-1">BMI</div>
                  <div className="text-slate-900 text-sm">{patient.bmi}</div>
                </div>
              </div>
            </Card>

            {/* Visit Info */}
            <Card className="p-4 bg-white border border-slate-200 rounded-xl">
              <h3 className="text-slate-900 mb-2 text-sm">Visit Information</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center py-1">
                  <span className="text-slate-500 text-sm">Last Visit</span>
                  <span className="text-slate-900 text-sm">{patient.lastVisit}</span>
                </div>
                {patient.nextFollowUp && (
                  <div className="flex justify-between items-center py-1">
                    <span className="text-slate-500 text-sm">Next Follow-up</span>
                    <span className="text-violet-600 text-sm">{patient.nextFollowUp}</span>
                  </div>
                )}
              </div>
            </Card>

            {/* Actions */}
            <div className="grid grid-cols-2 gap-3">
              <Button 
                onClick={() => onNavigate('new-visit')}
                className="h-12 bg-violet-600 hover:bg-violet-700 text-white rounded-xl"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Visit
              </Button>
              <Button 
                onClick={() => onNavigate('visit-history')}
                variant="outline"
                className="h-12 border-slate-200 rounded-xl"
              >
                <FileText className="w-4 h-4 mr-2" />
                History
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Bottom Navigation */}
      <BottomNav onNavigate={onNavigate} currentScreen="patient-profile" />
    </div>
  );
}

// New Visit Screen
function NewVisitScreen({
  onBack,
  onSave,
  patientId,
  onPendingSyncChange
}: {
  onBack: () => void;
  onSave: () => void;
  patientId?: string;
  onPendingSyncChange?: (count: number) => void;
}) {
  const [medicationsProvided, setMedicationsProvided] = React.useState<'Y' | 'N' | null>(null);
  const [medicationsTakenRegularly, setMedicationsTakenRegularly] = React.useState<'Y' | 'N' | null>(null);
  const [treatment, setTreatment] = React.useState('');
  const [newMedicationPrescribed, setNewMedicationPrescribed] = React.useState('');
  const [showComplicationDialog, setShowComplicationDialog] = React.useState(false);
  const [otherComplication, setOtherComplication] = React.useState('');
  const [patientIdInput, setPatientIdInput] = React.useState(patientId || '');
  const [systolic, setSystolic] = React.useState('');
  const [diastolic, setDiastolic] = React.useState('');
  const [randomGlucose, setRandomGlucose] = React.useState('');
  const [fastingGlucose, setFastingGlucose] = React.useState('');
  const [isSaving, setIsSaving] = React.useState(false);

  React.useEffect(() => {
    if (patientId) {
      setPatientIdInput(patientId);
    }
  }, [patientId]);

  const handleSave = async () => {
    if (!patientIdInput) {
      toast.error('Patient ID is required');
      return;
    }
    setIsSaving(true);
    let visitPayload: any;
    try {
      const parsedSystolic = systolic ? Number(systolic) : undefined;
      const parsedDiastolic = diastolic ? Number(diastolic) : undefined;
      const parsedRandomGlucose = randomGlucose ? Number(randomGlucose) : undefined;
      const parsedFastingGlucose = fastingGlucose ? Number(fastingGlucose) : undefined;
      const shouldFlag = (parsedSystolic !== undefined && parsedDiastolic !== undefined && parsedSystolic >= 140 && parsedDiastolic >= 90)
        || (parsedRandomGlucose !== undefined && parsedRandomGlucose >= 200)
        || (parsedFastingGlucose !== undefined && parsedFastingGlucose >= 126);
      visitPayload = {
        patient_id: patientIdInput,
        visit_type: 'follow-up',
        vitals: {
          systolic: parsedSystolic,
          diastolic: parsedDiastolic,
          glucose_random: parsedRandomGlucose,
          glucose_fasting: parsedFastingGlucose
        },
        medications_provided: medicationsProvided === 'Y' ? true : medicationsProvided === 'N' ? false : undefined,
        medications_taken_regularly: medicationsTakenRegularly === 'Y' ? true : medicationsTakenRegularly === 'N' ? false : undefined,
        new_medication_prescribed: newMedicationPrescribed || undefined,
        treatment: treatment || undefined,
        flagged_for_follow_up: shouldFlag
      };
      await apiClient.recordVisit(visitPayload);
      toast.success('Visit saved');
      onSave();
    } catch (error: any) {
      const isOffline = typeof navigator !== 'undefined' && !navigator.onLine;
      const isNetworkError = (error?.message || '').toLowerCase().includes('failed to fetch');
      if (isOffline || isNetworkError) {
        const count = enqueuePendingVisit({
          ...visitPayload,
          sync_status: 'pending',
          created_at: new Date().toISOString()
        });
        onPendingSyncChange?.(count);
        toast.success('Visit saved locally', {
          description: 'Will sync when back online',
          icon: <WifiOff className="w-4 h-4" />
        });
        onSave();
        return;
      }
      toast.error(error.message || 'Failed to save visit');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="h-full bg-slate-50 flex flex-col">
      <div className="bg-white px-6 py-6 border-b border-slate-200">
        <button onClick={onBack} className="text-violet-600 mb-3 flex items-center gap-1 text-sm">
          <ChevronRight className="w-4 h-4 rotate-180" /> Home
        </button>
        <h2 className="text-slate-900">New Visit Record</h2>
        <p className="text-slate-500 text-sm">Follow-up visit</p>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="space-y-6">
          {/* Patient Identification */}
          <div className="p-4 bg-violet-50 border border-violet-200 rounded-xl">
            <h3 className="text-violet-900 mb-3 text-sm">Patient Identification</h3>
            <div className="space-y-3">
              <div>
                <Label className="text-slate-700 mb-2 block text-sm">
                  Patient ID <span className="text-red-600">*</span>
                </Label>
                <Input 
                  placeholder="e.g. JAG-000123" 
                  className="h-11 bg-white border-slate-200"
                  value={patientIdInput}
                  onChange={(e) => setPatientIdInput(e.target.value)}
                />
              </div>
              <div className="text-center text-slate-500 text-xs">OR</div>
              <div>
                <Label className="text-slate-700 mb-2 block text-sm">
                  Patient Name
                </Label>
                <Input 
                  placeholder="Search by name..." 
                  className="h-11 bg-white border-slate-200" 
                />
              </div>
            </div>
          </div>

          <div>
            <Label className="text-slate-700 mb-2 block text-sm">Visit Date</Label>
            <Input type="date" className="h-11 bg-white border-slate-200" />
          </div>

          <div>
            <Label className="text-slate-700 mb-2 block text-sm">Visit Type</Label>
            <Select>
              <SelectTrigger className="h-11 bg-white border-slate-200">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="routine-followup">Routine Follow-Up</SelectItem>
                <SelectItem value="consultation-followup">Consultation Follow-Up</SelectItem>
                <SelectItem value="emergency-followup">Emergency Follow-Up</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-slate-700 mb-2 block text-xs">Systolic BP</Label>
              <Input type="number" className="h-11 bg-white border-slate-200" value={systolic} onChange={(e) => setSystolic(e.target.value)} />
            </div>
            <div>
              <Label className="text-slate-700 mb-2 block text-xs">Diastolic BP</Label>
              <Input type="number" className="h-11 bg-white border-slate-200" value={diastolic} onChange={(e) => setDiastolic(e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-slate-700 mb-2 block text-xs">Random Blood Sugar (mg/dL)</Label>
              <Input type="number" className="h-11 bg-white border-slate-200" value={randomGlucose} onChange={(e) => setRandomGlucose(e.target.value)} />
            </div>
            <div>
              <Label className="text-slate-700 mb-2 block text-xs">Fasting Blood Sugar (mg/dL)</Label>
              <Input type="number" className="h-11 bg-white border-slate-200" value={fastingGlucose} onChange={(e) => setFastingGlucose(e.target.value)} />
            </div>
          </div>

          {/* Treatment & Adherence Section */}
          <div>
            <h3 className="text-slate-900 mb-3 text-sm">Treatment & Adherence</h3>
            
            <div className="space-y-4">
              <div>
                <Label className="text-slate-700 mb-2 block text-sm">Treatment</Label>
                <Textarea
                  placeholder="Enter treatment given..."
                  className="bg-white border-slate-200"
                  rows={2}
                  value={treatment}
                  onChange={(e) => setTreatment(e.target.value)}
                />
              </div>

              <div>
                <Label className="text-slate-700 mb-2 block text-sm">Any meds provided?</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    type="button"
                    variant={medicationsProvided === 'Y' ? 'default' : 'outline'}
                    onClick={() => setMedicationsProvided('Y')}
                    className={`h-11 ${medicationsProvided === 'Y' ? 'bg-green-600 hover:bg-green-700' : ''}`}
                  >
                    Yes
                  </Button>
                  <Button
                    type="button"
                    variant={medicationsProvided === 'N' ? 'default' : 'outline'}
                    onClick={() => setMedicationsProvided('N')}
                    className={`h-11 ${medicationsProvided === 'N' ? 'bg-red-600 hover:bg-red-700' : ''}`}
                  >
                    No
                  </Button>
                </div>
              </div>

              <div>
                <Label className="text-slate-700 mb-2 block text-sm">Are medications taken regularly?</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    type="button"
                    variant={medicationsTakenRegularly === 'Y' ? 'default' : 'outline'}
                    onClick={() => setMedicationsTakenRegularly('Y')}
                    className={`h-11 ${medicationsTakenRegularly === 'Y' ? 'bg-green-600 hover:bg-green-700' : ''}`}
                  >
                    Yes
                  </Button>
                  <Button
                    type="button"
                    variant={medicationsTakenRegularly === 'N' ? 'default' : 'outline'}
                    onClick={() => setMedicationsTakenRegularly('N')}
                    className={`h-11 ${medicationsTakenRegularly === 'N' ? 'bg-red-600 hover:bg-red-700' : ''}`}
                  >
                    No
                  </Button>
                </div>
              </div>

              {medicationsTakenRegularly === 'N' && (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                  <h4 className="text-amber-900 mb-3 text-sm">Medication Adherence Barriers</h4>
                  <div className="space-y-3">
                    <div>
                      <Label className="text-slate-700 mb-1 block text-xs">Barriers Faced</Label>
                      <Textarea 
                        placeholder="E.g., cost, side effects, forgot to take..."
                        className="bg-white border-slate-200" 
                        rows={2} 
                      />
                    </div>
                    <div>
                      <Label className="text-slate-700 mb-1 block text-xs">Actual Frequency Taken</Label>
                      <Input 
                        placeholder="E.g., once daily instead of twice"
                        className="h-11 bg-white border-slate-200" 
                      />
                    </div>
                    <div>
                      <Label className="text-slate-700 mb-1 block text-xs">Additional Notes</Label>
                      <Textarea 
                        placeholder="Any other relevant information..."
                        className="bg-white border-slate-200" 
                        rows={2} 
                      />
                    </div>
                  </div>
                </div>
              )}

              <div>
                <Label className="text-slate-700 mb-2 block text-sm">New Medication Prescribed (if any)</Label>
                <Textarea 
                  placeholder="Enter new medications and dosage..."
                  className="bg-white border-slate-200" 
                  rows={3} 
                  value={newMedicationPrescribed}
                  onChange={(e) => setNewMedicationPrescribed(e.target.value)}
                />
              </div>

              <div>
                <Label className="text-slate-700 mb-3 block text-sm">Complication Screening</Label>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowComplicationDialog(true)}
                  className="w-full h-11 justify-between"
                >
                  <span>Check for Complications</span>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          <div>
            <Label className="text-slate-700 mb-2 block text-sm">Chief Complaint</Label>
            <Textarea 
              placeholder="Enter patient's main complaint or reason for visit..." 
              className="bg-white border-slate-200" 
              rows={3} 
            />
          </div>

          <div>
            <Label className="text-slate-700 mb-2 block text-sm">Visit Notes</Label>
            <Textarea 
              placeholder="Additional notes, observations, and recommendations..."
              className="bg-white border-slate-200" 
              rows={4} 
            />
          </div>

          <div>
            <Label className="text-slate-700 mb-2 block text-sm">Next Follow-up Date</Label>
            <Input type="date" className="h-11 bg-white border-slate-200" />
          </div>
        </div>
      </div>

      <div className="p-6 border-t border-slate-200 bg-white">
        <Button onClick={handleSave} className="w-full h-12 bg-violet-600 hover:bg-violet-700 rounded-xl" disabled={isSaving}>
          {isSaving ? 'Saving...' : 'Save Visit'}
        </Button>
      </div>

      {/* Complication Screening Dialog */}
      <Dialog open={showComplicationDialog} onOpenChange={setShowComplicationDialog}>
        <DialogContent className="w-80">
          <DialogHeader>
            <DialogTitle>Complication Screening</DialogTitle>
            <DialogDescription>Check all symptoms that apply</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-4">
            <div className="flex items-center gap-2">
              <Checkbox id="blurred-vision" />
              <Label htmlFor="blurred-vision" className="text-slate-700 text-sm">Blurred Vision</Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox id="numbness" />
              <Label htmlFor="numbness" className="text-slate-700 text-sm">Numbness in Feet</Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox id="swelling" />
              <Label htmlFor="swelling" className="text-slate-700 text-sm">Swelling (Edema)</Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox id="chest-pain" />
              <Label htmlFor="chest-pain" className="text-slate-700 text-sm">Chest Pain</Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox id="frequent-urination" />
              <Label htmlFor="frequent-urination" className="text-slate-700 text-sm">Frequent Urination</Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox id="excessive-thirst" />
              <Label htmlFor="excessive-thirst" className="text-slate-700 text-sm">Excessive Thirst</Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox id="fatigue" />
              <Label htmlFor="fatigue" className="text-slate-700 text-sm">Unusual Fatigue</Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox id="wounds" />
              <Label htmlFor="wounds" className="text-slate-700 text-sm">Slow-Healing Wounds</Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox id="dizziness" />
              <Label htmlFor="dizziness" className="text-slate-700 text-sm">Dizziness/Headache</Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox id="shortness-breath" />
              <Label htmlFor="shortness-breath" className="text-slate-700 text-sm">Shortness of Breath</Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox id="other-complication" />
              <Label htmlFor="other-complication" className="text-slate-700 text-sm">Other</Label>
            </div>
            <div className="ml-6">
              <Input 
                placeholder="Specify other symptom..."
                value={otherComplication}
                onChange={(e) => setOtherComplication(e.target.value)}
                className="h-11 bg-white border-slate-200" 
              />
            </div>
          </div>
          <Button 
            onClick={() => setShowComplicationDialog(false)} 
            className="w-full bg-violet-600 hover:bg-violet-700"
          >
            Save Screening
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// High Risk Highlights Screen
function HighRiskHighlightsScreen({
  onBack,
  onNavigate,
  onSelectPatient,
  patients
}: {
  onBack: () => void;
  onNavigate: (screen: Screen) => void;
  onSelectPatient: (patient: Patient) => void;
  patients: Patient[];
}) {
  const highRiskPatients = patients.filter(p => p.riskLevel === 'High' || p.riskLevel === 'Very High');
  
  return (
    <div className="h-full bg-slate-50 flex flex-col">
      <div className="bg-white px-6 py-6 border-b border-slate-200">
        <button onClick={onBack} className="text-indigo-600 mb-3 flex items-center gap-1 text-sm">
          <ChevronRight className="w-4 h-4 rotate-180" /> Back
        </button>
        <h2 className="text-slate-900">High & Very High Risk Patients</h2>
        <p className="text-slate-500 text-sm">{highRiskPatients.length} patients require immediate attention</p>
      </div>

      <div className="flex-1 overflow-y-auto p-6 pb-24 space-y-3">
        {highRiskPatients.map((patient) => (
          <Card 
            key={patient.id}
            className={`p-4 bg-white border-l-4 ${patient.riskLevel === 'Very High' ? 'border-l-rose-700' : 'border-l-red-500'} border-r border-t border-b border-slate-200 rounded-xl cursor-pointer hover:shadow-md transition-shadow`}
            onClick={() => {
              onSelectPatient(patient);
              onNavigate('high-risk-details');
            }}
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-slate-900 mb-1">{patient.name}</h3>
                <p className="text-slate-500 text-sm">{patient.id}</p>
              </div>
              <Badge className={patient.riskLevel === 'Very High' ? 'bg-rose-600 text-white' : 'bg-red-100 text-red-700'}>
                {patient.riskLevel} Risk
              </Badge>
            </div>
            
            <div className="grid grid-cols-2 gap-2 mb-3">
              <div className="text-xs">
                <span className="text-slate-500">BP:</span>
                <span className="text-red-700 ml-1">{patient.latestBP}</span>
              </div>
              <div className="text-xs">
                <span className="text-slate-500">RBS:</span>
                <span className="text-red-700 ml-1">{patient.latestRBS}</span>
              </div>
            </div>

            {patient.nextFollowUp && (
              <div className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded">
                <Clock className="w-3 h-3 inline mr-1" />
                Next follow-up: {patient.nextFollowUp}
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}

// High Risk Details Screen
function HighRiskDetailsScreen({ patient, onBack, onNavigate }: { patient: Patient; onBack: () => void; onNavigate: (screen: Screen) => void }) {
  return (
    <div className="h-full bg-slate-50 flex flex-col">
      <div className="bg-white px-6 py-6 border-b border-slate-200">
        <button onClick={onBack} className="text-indigo-600 mb-3 flex items-center gap-1 text-sm">
          <ChevronRight className="w-4 h-4 rotate-180" /> Back
        </button>
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-slate-900">{patient.name}</h2>
            <p className="text-slate-500 text-sm">{patient.id}</p>
          </div>
          <Badge className="bg-red-100 text-red-700">High Risk</Badge>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 pb-24 space-y-4">
        {/* Risk Factors */}
        <Card className="p-4 bg-red-50 border border-red-200 rounded-xl">
          <h3 className="text-red-900 mb-3 text-sm">Risk Factors</h3>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 mt-0.5" />
              <span className="text-red-900">Uncontrolled BP: {patient.latestBP}</span>
            </li>
            <li className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 mt-0.5" />
              <span className="text-red-900">Elevated RBS: {patient.latestRBS}</span>
            </li>
            <li className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 mt-0.5" />
              <span className="text-red-900">Multiple comorbidities</span>
            </li>
          </ul>
        </Card>

        {/* Recommended Actions */}
        <Card className="p-4 bg-white border border-slate-200 rounded-xl">
          <h3 className="text-slate-900 mb-3 text-sm">Recommended Actions</h3>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Checkbox id="action1" />
              <Label htmlFor="action1" className="text-slate-700 text-sm">Schedule immediate follow-up</Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox id="action2" />
              <Label htmlFor="action2" className="text-slate-700 text-sm">Review medication adherence</Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox id="action3" />
              <Label htmlFor="action3" className="text-slate-700 text-sm">Lifestyle counseling</Label>
            </div>
          </div>
        </Card>

        <Button 
          onClick={() => onNavigate('new-visit')}
          className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 rounded-xl"
        >
          Schedule Visit
        </Button>
      </div>
    </div>
  );
}

// Follow Up Patients Screen
function FollowUpPatientsScreen({
  onBack,
  onNavigate,
  onSelectPatient,
  patients
}: {
  onBack: () => void;
  onNavigate: (screen: Screen) => void;
  onSelectPatient: (patient: Patient) => void;
  patients: Patient[];
}) {
  const [selectedStatus, setSelectedStatus] = React.useState<'all' | 'due' | 'overdue'>('all');
  
  // Filter patients with follow-ups
  const followUpPatients = patients.filter(p => p.nextFollowUp);
  
  // Further filter by status
  const filteredPatients = selectedStatus === 'all' 
    ? followUpPatients 
    : followUpPatients.filter(p => p.followUpStatus === selectedStatus);

  return (
    <div className="h-full bg-slate-50 flex flex-col">
      <div className="bg-white px-6 py-4 border-b border-slate-200">
        <button onClick={onBack} className="text-violet-600 mb-3 flex items-center gap-1 text-sm">
          <ChevronLeft className="w-4 h-4" /> Back
        </button>
        <h2 className="text-slate-900 mb-1">Follow-up Patients</h2>
        <p className="text-slate-600 text-sm mb-3">Scheduled and overdue visits</p>
        
        {/* Status Filter */}
        <div className="flex gap-2">
          <button
            onClick={() => setSelectedStatus('all')}
            className={`px-3 py-1.5 rounded-lg text-xs transition-colors ${
              selectedStatus === 'all'
                ? 'bg-violet-600 text-white'
                : 'bg-slate-100 text-slate-600'
            }`}
          >
            All ({followUpPatients.length})
          </button>
          <button
            onClick={() => setSelectedStatus('due')}
            className={`px-3 py-1.5 rounded-lg text-xs transition-colors ${
              selectedStatus === 'due'
                ? 'bg-amber-600 text-white'
                : 'bg-slate-100 text-slate-600'
            }`}
          >
            Due ({followUpPatients.filter(p => p.followUpStatus === 'due').length})
          </button>
          <button
            onClick={() => setSelectedStatus('overdue')}
            className={`px-3 py-1.5 rounded-lg text-xs transition-colors ${
              selectedStatus === 'overdue'
                ? 'bg-red-600 text-white'
                : 'bg-slate-100 text-slate-600'
            }`}
          >
            Overdue ({followUpPatients.filter(p => p.followUpStatus === 'overdue').length})
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 pb-24 space-y-3">
        {filteredPatients.length === 0 ? (
          <EmptyState
            icon={Clock}
            title="No follow-up patients"
            description="All patients are up to date with their visits"
            actionLabel="View All Patients"
            onAction={() => onNavigate('patients-list')}
          />
        ) : (
          filteredPatients.map((patient) => (
            <Card 
              key={patient.id}
              className="p-4 bg-white border border-slate-200 rounded-xl cursor-pointer hover:shadow-lg transition-all duration-200 hover:border-violet-300"
              onClick={() => {
                onSelectPatient(patient);
                onNavigate('patient-profile');
              }}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-slate-900 mb-1">{patient.name}</h3>
                  <p className="text-slate-600 text-sm">{patient.barangay}</p>
                </div>
                {patient.followUpStatus === 'overdue' ? (
                  <Badge className="bg-red-100 text-red-700 border-red-300">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    Overdue
                  </Badge>
                ) : (
                  <Badge className="bg-amber-100 text-amber-700 border-amber-300">
                    <Clock className="w-3 h-3 mr-1" />
                    Due
                  </Badge>
                )}
              </div>
              
              {patient.nextFollowUp && (
                <div className={`text-sm px-3 py-2 rounded-lg mb-2 ${
                  patient.followUpStatus === 'overdue'
                    ? 'text-red-700 bg-red-50 border border-red-200'
                    : 'text-amber-700 bg-amber-50 border border-amber-200'
                }`}>
                  {patient.followUpStatus === 'overdue' ? 'Scheduled for: ' : 'Next visit: '}{patient.nextFollowUp}
                  {patient.followUpStatus === 'overdue' && (
                    <span className="block text-xs text-red-600 mt-1">Follow-up was not completed in previous visit</span>
                  )}
                </div>
              )}

              {patient.followUpReason && (
                <div className="text-xs text-slate-700 bg-slate-50 px-3 py-2 rounded-lg border border-slate-200">
                  <span className="text-slate-500">Reason: </span>{patient.followUpReason}
                </div>
              )}
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

// Flagged Patients Screen (consolidates high risk and follow up)
function FlaggedPatientsScreen({
  onNavigate,
  onSelectPatient,
  patients
}: {
  onNavigate: (screen: Screen) => void;
  onSelectPatient: (patient: Patient) => void;
  patients: Patient[];
}) {
  const [selectedCondition, setSelectedCondition] = React.useState<'all' | 'HTN' | 'DM'>('all');
  const [selectedControl, setSelectedControl] = React.useState<'all' | 'controlled' | 'uncontrolled'>('all');
  const [selectedBarangay, setSelectedBarangay] = React.useState<string>('all');

  // Filter patients who are either high/very high risk or have follow-ups
  const flaggedPatients = patients.filter(p =>
    p.riskLevel === 'High' || p.riskLevel === 'Very High' || p.nextFollowUp || p.flaggedForFollowUp
  );

  const filteredPatients = flaggedPatients.filter(patient => {
    // Filter by condition
    if (selectedCondition === 'HTN' && !patient.conditions.includes('HTN')) return false;
    if (selectedCondition === 'DM' && !patient.conditions.includes('DM')) return false;

    // Filter by control status
    if (selectedControl !== 'all') {
      const hasHTN = patient.conditions.includes('HTN');
      const hasDM = patient.conditions.includes('DM');
      const bpParts = patient.latestBP.split('/');
      const systolic = parseInt(bpParts[0]);
      const rbsValue = parseInt(patient.latestRBS);
      const htnControlled = hasHTN && systolic < 140;
      const dmControlled = hasDM && rbsValue < 200;
      const isControlled = (hasHTN ? htnControlled : true) && (hasDM ? dmControlled : true);
      
      if (selectedControl === 'controlled' && !isControlled) return false;
      if (selectedControl === 'uncontrolled' && isControlled) return false;
    }

    // Filter by barangay
    if (selectedBarangay !== 'all' && patient.barangay !== selectedBarangay) return false;

    return true;
  });

  const uniqueBarangays = ['all', ...Array.from(new Set(flaggedPatients.map(p => p.barangay)))];

  return (
    <div className="h-full bg-slate-50 flex flex-col">
      {/* Condensed Header */}
      <div className="bg-white px-6 py-4 border-b border-slate-200 sticky top-0 z-10">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-slate-900">Flagged Patients</h2>
            <p className="text-slate-600 text-sm">High risk & follow up ({filteredPatients.length})</p>
          </div>
        </div>
        
        {/* Compact Filters in Single Row */}
        <div className="flex gap-2 mb-3">
          <button
            onClick={() => setSelectedCondition('all')}
            className={`px-3 py-1.5 rounded-lg text-xs transition-colors ${
              selectedCondition === 'all'
                ? 'bg-violet-600 text-white'
                : 'bg-slate-100 text-slate-600'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setSelectedCondition('HTN')}
            className={`px-3 py-1.5 rounded-lg text-xs transition-colors ${
              selectedCondition === 'HTN'
                ? 'bg-orange-600 text-white'
                : 'bg-slate-100 text-slate-600'
            }`}
          >
            HTN
          </button>
          <button
            onClick={() => setSelectedCondition('DM')}
            className={`px-3 py-1.5 rounded-lg text-xs transition-colors ${
              selectedCondition === 'DM'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 text-slate-600'
            }`}
          >
            DM
          </button>
          <button
            onClick={() => setSelectedControl('controlled')}
            className={`px-3 py-1.5 rounded-lg text-xs transition-colors ${
              selectedControl === 'controlled'
                ? 'bg-green-600 text-white'
                : 'bg-slate-100 text-slate-600'
            }`}
          >
            <Check className="w-3 h-3 inline mr-1" />
            Controlled
          </button>
          <button
            onClick={() => setSelectedControl('uncontrolled')}
            className={`px-3 py-1.5 rounded-lg text-xs transition-colors ${
              selectedControl === 'uncontrolled'
                ? 'bg-red-600 text-white'
                : 'bg-slate-100 text-slate-600'
            }`}
          >
            <X className="w-3 h-3 inline mr-1" />
            Uncontrolled
          </button>
        </div>

        {/* Compact Barangay Select */}
        <Select value={selectedBarangay} onValueChange={setSelectedBarangay}>
          <SelectTrigger className="w-full h-9 bg-slate-50 border-slate-200 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {uniqueBarangays.map((brgy) => (
              <SelectItem key={brgy} value={brgy}>
                {brgy === 'all' ? 'All Barangays' : brgy}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Patient List */}
      <div className="flex-1 overflow-y-auto p-6 pb-24 space-y-3">
        {filteredPatients.length === 0 ? (
          <div className="text-center py-12">
            <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">No flagged patients found</p>
          </div>
        ) : (
          filteredPatients.map((patient) => {
            const hasHTN = patient.conditions.includes('HTN');
            const hasDM = patient.conditions.includes('DM');
            const bpParts = patient.latestBP.split('/');
            const systolic = parseInt(bpParts[0]);
            const rbsValue = parseInt(patient.latestRBS);
            const htnControlled = hasHTN && systolic < 140;
            const dmControlled = hasDM && rbsValue < 200;

            return (
              <Card 
                key={patient.id}
                className="p-4 bg-white border border-slate-200 rounded-xl cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => {
                  onSelectPatient(patient);
                  onNavigate('patient-profile');
                }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-slate-900">{patient.name}</h3>
                      {patient.riskLevel === 'High' && (
                        <Badge className="bg-red-100 text-red-700 text-xs">
                          High Risk
                        </Badge>
                      )}
                      {patient.nextFollowUp && (
                        <Badge className="bg-amber-100 text-amber-700 text-xs">
                          <Clock className="w-3 h-3 mr-1" />
                          Due
                        </Badge>
                      )}
                    </div>
                    <p className="text-slate-500 text-sm">{patient.id} • {patient.age}yo {patient.sex}</p>
                    <p className="text-slate-500 text-xs mt-1">{patient.barangay}</p>
                  </div>
                </div>

                {/* Condition and Control Status */}
                <div className="flex flex-col gap-1 mb-3">
                  {hasHTN && (
                    <div className="flex gap-1 items-center">
                      <Badge variant="outline" className="text-xs border-orange-300 text-orange-700 bg-orange-50">
                        HTN
                      </Badge>
                      <Badge 
                        variant="outline"
                        className={`text-xs ${htnControlled ? 'border-green-300 text-green-700 bg-green-50' : 'border-red-300 text-red-700 bg-red-50'}`}
                      >
                        {htnControlled ? 'Controlled' : 'Uncontrolled'}
                      </Badge>
                    </div>
                  )}
                  {hasDM && (
                    <div className="flex gap-1 items-center">
                      <Badge variant="outline" className="text-xs border-blue-300 text-blue-700 bg-blue-50">
                        DM
                      </Badge>
                      <Badge 
                        variant="outline"
                        className={`text-xs ${dmControlled ? 'border-green-300 text-green-700 bg-green-50' : 'border-red-300 text-red-700 bg-red-50'}`}
                      >
                        {dmControlled ? 'Controlled' : 'Uncontrolled'}
                      </Badge>
                    </div>
                  )}
                </div>

                {/* Latest Vitals */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-slate-50 px-2 py-1.5 rounded">
                    <span className="text-slate-500">BP:</span> <span className="text-slate-900">{patient.latestBP}</span>
                  </div>
                  <div className="bg-slate-50 px-2 py-1.5 rounded">
                    <span className="text-slate-500">RBS:</span> <span className="text-slate-900">{patient.latestRBS}</span>
                  </div>
                </div>

                {patient.nextFollowUp && (
                  <div className="text-xs text-amber-600 bg-amber-50 px-3 py-2 rounded-lg mt-2">
                    Next visit: {patient.nextFollowUp}
                  </div>
                )}
              </Card>
            );
          })
        )}
      </div>
      
      <BottomNav onNavigate={onNavigate} currentScreen="flagged-patients" />
    </div>
  );
}

// Barangay Overview Screen
function BarangayOverviewScreen({ onNavigate }: { onNavigate: (screen: Screen) => void }) {
  const [selectedBarangay, setSelectedBarangay] = React.useState<typeof barangayFollowUps[0] | null>(null);

  return (
    <div className="h-full bg-slate-50 flex flex-col">
      <div className="bg-white px-6 py-6 border-b border-slate-200">
        <h2 className="text-slate-900">Barangay Overview</h2>
        <p className="text-slate-500 text-sm">Field operations across 33 barangays</p>
      </div>

      <div className="flex-1 overflow-y-auto p-6 pb-24 space-y-3">
        {barangayFollowUps.map((item) => (
          <Card 
            key={item.barangay}
            className="p-4 bg-white border border-slate-200 rounded-xl cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => {
              setSelectedBarangay(item);
              onNavigate('barangay-profile');
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-slate-900"><strong>{item.barangay}</strong></h3>
                <p className="text-slate-500 text-xs mt-1">
                  {item.patientsRegistered} / {item.totalPopulation} ({((item.patientsRegistered / item.totalPopulation) * 100).toFixed(1)}% registered)
                </p>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-400" />
            </div>
            
            <div className="grid grid-cols-2 gap-2 mb-3">
              <div className="p-3 bg-orange-50 rounded-lg">
                <div className="text-orange-600 text-xs mb-1">HTN Patients</div>
                <div className="text-orange-900">{item.htnPatients}</div>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <div className="text-blue-600 text-xs mb-1">DM Patients</div>
                <div className="text-blue-900">{item.dmPatients}</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="p-3 bg-red-50 rounded-lg">
                <div className="text-red-600 text-xs mb-1">High Risk</div>
                <div className="text-red-900">{item.highRisk}</div>
              </div>
              <div className="p-3 bg-amber-50 rounded-lg">
                <div className="text-amber-600 text-xs mb-1">Follow Up</div>
                <div className="text-amber-900">{item.followUp}</div>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-slate-200">
              <div className="text-xs text-slate-600">
                <User className="w-3 h-3 inline mr-1" />
                Head: {item.villageHead}
              </div>
              <div className="text-xs text-slate-500 mt-1">
                <Phone className="w-3 h-3 inline mr-1" />
                {item.villageHeadContact}
              </div>
            </div>
          </Card>
        ))}
      </div>
      
      <BottomNav onNavigate={onNavigate} currentScreen="barangay-overview" />
    </div>
  );
}

// Barangay Profile Screen
function BarangayProfileScreen({ onBack, onNavigate }: { onBack: () => void; onNavigate: (screen: Screen) => void }) {
  // Using first barangay as default - in real app this would be passed as prop
  const barangayData = barangayFollowUps[0];
  const registrationPercentage = ((barangayData.patientsRegistered / barangayData.totalPopulation) * 100).toFixed(1);

  return (
    <div className="h-full bg-slate-50 flex flex-col">
      <div className="bg-white px-6 py-6 border-b border-slate-200">
        <button onClick={onBack} className="text-violet-600 mb-3 flex items-center gap-1 text-sm">
          <ChevronLeft className="w-4 h-4" /> Back
        </button>
        <h2 className="text-slate-900">{barangayData.barangay}</h2>
        <p className="text-slate-600 text-sm">Barangay Health Profile</p>
      </div>

      <div className="flex-1 overflow-y-auto p-6 pb-24">
        <div className="space-y-4">
          {/* Barangay Leadership */}
          <Card className="p-4 bg-white border border-slate-200 rounded-xl">
            <h3 className="text-slate-900 mb-3 text-sm">Barangay Leadership</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between py-2">
                <span className="text-slate-500 text-sm">Purok Head</span>
                <span className="text-slate-900 text-sm">{barangayData.villageHead}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-t border-slate-100">
                <span className="text-slate-500 text-sm">Contact</span>
                <span className="text-slate-900 text-sm">{barangayData.villageHeadContact}</span>
              </div>
            </div>
          </Card>

          {/* Population Overview */}
          <Card className="p-4 bg-white border border-slate-200 rounded-xl">
            <h3 className="text-slate-900 mb-3 text-sm">Population Overview</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between py-2">
                <span className="text-slate-500 text-sm">Total Population</span>
                <span className="text-slate-900">{barangayData.totalPopulation.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-t border-slate-100">
                <span className="text-slate-500 text-sm">Patients Registered</span>
                <span className="text-indigo-600">{barangayData.patientsRegistered}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-t border-slate-100">
                <span className="text-slate-500 text-sm">Registration Rate</span>
                <Badge className="bg-indigo-100 text-indigo-700">{registrationPercentage}%</Badge>
              </div>
            </div>
          </Card>

          {/* Disease Statistics - Clickable */}
          <Card className="p-4 bg-white border border-slate-200 rounded-xl">
            <h3 className="text-slate-900 mb-3 text-sm">Disease Statistics</h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => {
                  toast.info('Viewing DM patients in ' + barangayData.barangay);
                  onNavigate('patients-list');
                }}
                className="p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors text-left group relative"
              >
                <div className="text-blue-600 text-xs mb-1">DM Patients</div>
                <div className="text-blue-900 text-2xl">{barangayData.dmPatients}</div>
                <ChevronRight className="w-4 h-4 absolute top-3 right-3 text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
              <button
                onClick={() => {
                  toast.info('Viewing HTN patients in ' + barangayData.barangay);
                  onNavigate('patients-list');
                }}
                className="p-3 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors text-left group relative"
              >
                <div className="text-orange-600 text-xs mb-1">HTN Patients</div>
                <div className="text-orange-900 text-2xl">{barangayData.htnPatients}</div>
                <ChevronRight className="w-4 h-4 absolute top-3 right-3 text-orange-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            </div>
          </Card>

          {/* Risk & Follow-up - Clickable */}
          <Card className="p-4 bg-white border border-slate-200 rounded-xl">
            <h3 className="text-slate-900 mb-3 text-sm">Risk & Follow-up</h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => {
                  toast.info('Viewing high risk patients in ' + barangayData.barangay);
                  onNavigate('high-risk-highlights');
                }}
                className="p-3 bg-red-50 hover:bg-red-100 rounded-lg transition-colors text-left group relative"
              >
                <div className="text-red-600 text-xs mb-1">High Risk</div>
                <div className="text-red-900 text-2xl">{barangayData.highRisk}</div>
                <ChevronRight className="w-4 h-4 absolute top-3 right-3 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
              <button
                onClick={() => {
                  toast.info('Viewing follow-up patients in ' + barangayData.barangay);
                  onNavigate('follow-up-patients');
                }}
                className="p-3 bg-amber-50 hover:bg-amber-100 rounded-lg transition-colors text-left group relative"
              >
                <div className="text-amber-600 text-xs mb-1">Follow Up</div>
                <div className="text-amber-900 text-2xl">{barangayData.followUp}</div>
                <ChevronRight className="w-4 h-4 absolute top-3 right-3 text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

// Scanner Screen
function ScannerScreen({ onBack, onNavigate }: { onBack: () => void; onNavigate: (screen: Screen) => void }) {
  return (
    <div className="h-full bg-slate-50 flex flex-col">
      <div className="bg-white px-6 py-6 border-b border-slate-200">
        <button onClick={onBack} className="text-indigo-600 mb-3 flex items-center gap-1 text-sm">
          <ChevronRight className="w-4 h-4 rotate-180" /> Back
        </button>
        <h2 className="text-slate-900">QR/Barcode Scanner</h2>
        <p className="text-slate-500 text-sm">Scan patient ID or medication</p>
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <div className="aspect-square bg-slate-900 rounded-2xl flex items-center justify-center mb-6 border-4 border-indigo-600">
            <ScanLine className="w-32 h-32 text-indigo-600" />
          </div>
          <p className="text-center text-slate-600">Position QR code or barcode within the frame</p>
        </div>
      </div>
    </div>
  );
}

// Sync History Screen
function SyncHistoryScreen({ onBack, onNavigate }: { onBack: () => void; onNavigate: (screen: Screen) => void }) {
  const syncRecords = [
    { date: 'Oct 29, 2025 2:45 PM', status: 'Success', records: 12 },
    { date: 'Oct 29, 2025 9:30 AM', status: 'Success', records: 8 },
    { date: 'Oct 28, 2025 4:15 PM', status: 'Success', records: 15 },
  ];

  return (
    <div className="h-full bg-slate-50 flex flex-col">
      <div className="bg-white px-6 py-6 border-b border-slate-200">
        <button onClick={onBack} className="text-indigo-600 mb-3 flex items-center gap-1 text-sm">
          <ChevronRight className="w-4 h-4 rotate-180" /> Back
        </button>
        <h2 className="text-slate-900">Sync History</h2>
        <p className="text-slate-500 text-sm">Data synchronization records</p>
      </div>

      <div className="flex-1 overflow-y-auto p-6 pb-24 space-y-3">
        {syncRecords.map((record, idx) => (
          <Card key={idx} className="p-4 bg-white border border-slate-200 rounded-xl">
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="text-slate-900 text-sm">{record.date}</p>
                <p className="text-slate-500 text-xs">{record.records} records synced</p>
              </div>
              <Badge className="bg-green-100 text-green-700">
                <Check className="w-3 h-3 mr-1" />
                {record.status}
              </Badge>
            </div>
          </Card>
        ))}
      </div>
      
      <BottomNav onNavigate={onNavigate} currentScreen="sync-history" />
    </div>
  );
}

// Visit History Screen
function VisitHistoryScreen({ onBack, patientId }: { onBack: () => void; patientId?: string }) {
  const [visits, setVisits] = React.useState<Array<{ date: string; type: string; bp?: string; notes?: string }>>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const loadVisits = async () => {
      if (!patientId) {
        setVisits([]);
        return;
      }
      setIsLoading(true);
      setError(null);
      try {
        const response = await apiClient.getPatientVisits(patientId);
        const mapped = (response.visits || []).map((visit: any) => ({
          date: visit.visit_date ? new Date(visit.visit_date).toLocaleDateString() : '',
          type: visit.visit_type || 'Follow-up',
          bp: visit.vitals?.systolic && visit.vitals?.diastolic ? `${visit.vitals.systolic}/${visit.vitals.diastolic}` : '',
          notes: visit.clinical_notes || ''
        }));
        setVisits(mapped);
      } catch (err: any) {
        setError(err.message || 'Failed to load visits');
      } finally {
        setIsLoading(false);
      }
    };
    loadVisits();
  }, [patientId]);

  return (
    <div className="h-full bg-slate-50 flex flex-col">
      <div className="bg-white px-6 py-6 border-b border-slate-200">
        <button onClick={onBack} className="text-indigo-600 mb-3 flex items-center gap-1 text-sm">
          <ChevronRight className="w-4 h-4 rotate-180" /> Back
        </button>
        <h2 className="text-slate-900">Visit History</h2>
        <p className="text-slate-500 text-sm">Patient visit records</p>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-3">
        {isLoading && <p className="text-slate-500 text-sm">Loading visits...</p>}
        {error && <p className="text-red-600 text-sm">{error}</p>}
        {!isLoading && visits.length === 0 && <p className="text-slate-500 text-sm">No visits recorded</p>}
        {visits.map((visit, idx) => (
          <Card key={idx} className="p-4 bg-white border border-slate-200 rounded-xl">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-slate-900">{visit.date}</h3>
                <p className="text-slate-500 text-sm">{visit.type}</p>
              </div>
              {visit.bp && <Badge className="bg-indigo-100 text-indigo-700">{visit.bp}</Badge>}
            </div>
            {visit.notes && <p className="text-slate-600 text-sm">{visit.notes}</p>}
          </Card>
        ))}
      </div>
    </div>
  );
}

// Admin Screen
function AdminScreen({ onBack, onNavigate }: { onBack: () => void; onNavigate: (screen: Screen) => void }) {
  const [isEditing, setIsEditing] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  
  // BHW Profile data
  const [bhwProfile, setBhwProfile] = useState({
    firstName: 'Maria',
    middleName: 'Santos',
    lastName: 'Cruz',
    bhwId: '03456789',
    email: 'maria.cruz@jagna.gov.ph',
    contact: '+63 912 345 6789',
    assignedBarangay: 'Poblacion (Pondol)',
    dateStarted: 'January 15, 2023',
    status: 'Active'
  });

  const handleSave = () => {
    setIsEditing(false);
    toast.success('Profile updated successfully');
  };

  const handleLogout = () => {
    setShowLogoutDialog(false);
    toast.success('Logged out successfully');
    onNavigate('login');
  };

  return (
    <div className="h-full bg-slate-50 flex flex-col">
      <div className="bg-white px-6 py-6 border-b border-slate-200">
        <button onClick={onBack} className="text-indigo-600 mb-3 flex items-center gap-1 text-sm">
          <ChevronRight className="w-4 h-4 rotate-180" /> Back
        </button>
        <h2 className="text-slate-900">Admin Settings</h2>
        <p className="text-slate-500 text-sm">Manage your profile and account settings</p>
      </div>

      <div className="flex-1 overflow-y-auto p-6 pb-24">
        <div className="space-y-6">
          {/* BHW Profile Section */}
          <Card className="p-6 bg-white border border-slate-200 rounded-xl">
            <div className="mb-3">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-violet-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-slate-900 mb-1">Barangay Health Worker Profile</h3>
                  <p className="text-slate-500 text-xs">Your personal information and credentials</p>
                </div>
              </div>
              {!isEditing && (
                <Button
                  onClick={() => setIsEditing(true)}
                  variant="outline"
                  className="flex items-center gap-2 w-full"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit
                </Button>
              )}
            </div>

            <div className="space-y-4">
              {/* Name Field */}
              <div>
                <Label className="text-slate-900 font-semibold mb-2 block">Name</Label>
                {isEditing ? (
                  <div className="space-y-2">
                    <Input
                      value={bhwProfile.firstName}
                      onChange={(e) => setBhwProfile({ ...bhwProfile, firstName: e.target.value })}
                      className="w-full"
                      placeholder="First Name"
                    />
                    <Input
                      value={bhwProfile.middleName}
                      onChange={(e) => setBhwProfile({ ...bhwProfile, middleName: e.target.value })}
                      className="w-full"
                      placeholder="Middle Name"
                    />
                    <Input
                      value={bhwProfile.lastName}
                      onChange={(e) => setBhwProfile({ ...bhwProfile, lastName: e.target.value })}
                      className="w-full"
                      placeholder="Last Name"
                    />
                  </div>
                ) : (
                  <p className="text-slate-900">{bhwProfile.firstName} {bhwProfile.middleName} {bhwProfile.lastName}</p>
                )}
              </div>

              {/* BHW ID */}
              <div>
                <Label className="text-slate-900 font-semibold mb-2 block">BHW ID</Label>
                <Badge className="bg-violet-100 text-violet-700 border-0">ID {bhwProfile.bhwId}</Badge>
              </div>

              {/* Contact Number */}
              <div>
                <Label className="text-slate-900 font-semibold mb-2 block">Contact Number</Label>
                {isEditing ? (
                  <Input
                    type="tel"
                    value={bhwProfile.contact}
                    onChange={(e) => setBhwProfile({ ...bhwProfile, contact: e.target.value })}
                    className="w-full"
                  />
                ) : (
                  <p className="text-slate-900">{bhwProfile.contact}</p>
                )}
              </div>

              {/* Email Address */}
              <div>
                <Label className="text-slate-900 font-semibold mb-2 block">Email Address</Label>
                {isEditing ? (
                  <Input
                    type="email"
                    value={bhwProfile.email}
                    onChange={(e) => setBhwProfile({ ...bhwProfile, email: e.target.value })}
                    className="w-full"
                  />
                ) : (
                  <p className="text-slate-900 break-words">{bhwProfile.email}</p>
                )}
              </div>

              {/* Assigned Barangay */}
              <div>
                <Label className="text-slate-900 font-semibold mb-2 block">Assigned Barangay</Label>
                {isEditing ? (
                  <Select
                    value={bhwProfile.assignedBarangay}
                    onValueChange={(value) => setBhwProfile({ ...bhwProfile, assignedBarangay: value })}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {barangays.map((barangay) => (
                        <SelectItem key={barangay} value={barangay}>
                          {barangay}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <p className="text-slate-900">{bhwProfile.assignedBarangay}</p>
                )}
              </div>

              {/* Date Started */}
              <div>
                <Label className="text-slate-900 font-semibold mb-2 block">Date Started</Label>
                <p className="text-slate-900">{bhwProfile.dateStarted}</p>
              </div>

              {/* Status Badge */}
              <div>
                <Label className="text-slate-900 font-semibold mb-2 block">Status</Label>
                <Badge className="bg-green-100 text-green-700 border-green-200">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  {bhwProfile.status}
                </Badge>
              </div>

              {/* Action Buttons */}
              {isEditing && (
                <div className="flex gap-3 pt-4">
                  <Button onClick={handleSave} className="flex-1 bg-indigo-600 hover:bg-indigo-700">
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </Button>
                  <Button
                    onClick={() => setIsEditing(false)}
                    variant="outline"
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              )}
            </div>
          </Card>

          {/* App Information */}
          <Card className="p-6 bg-white border border-slate-200 rounded-xl">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center flex-shrink-0">
                <Info className="w-5 h-5 text-violet-600" />
              </div>
              <div>
                <h3 className="text-slate-900 mb-1">App Information</h3>
                <p className="text-slate-600 text-sm">HealthHive version and details</p>
              </div>
            </div>
            <div className="space-y-3 pl-13">
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-600 text-sm">Version</span>
                <span className="text-slate-900 text-sm">1.0.0</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-600 text-sm">Build</span>
                <span className="text-slate-900 text-sm">2024.11.07</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-slate-600 text-sm">Last Updated</span>
                <span className="text-slate-900 text-sm">November 7, 2024</span>
              </div>
            </div>
          </Card>

          {/* Logout Section */}
          <Card className="p-6 bg-white border border-red-200 rounded-xl">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                <Lock className="w-5 h-5 text-red-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-slate-900 mb-1">Account Access</h3>
                <p className="text-slate-600 text-sm mb-4">Sign out of your HealthHive account</p>
                <Button
                  onClick={() => setShowLogoutDialog(true)}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  <Lock className="w-4 h-4 mr-2" />
                  Log Out
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Logout Confirmation Dialog */}
      <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Logout</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to log out? Make sure all your data is synced before logging out.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleLogout} className="bg-red-600 hover:bg-red-700">
              Log Out
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// User Guide Screen
function UserGuideScreen({ onBack }: { onBack: () => void }) {
  return (
    <div className="h-full bg-slate-50 flex flex-col">
      <div className="bg-white px-6 py-6 border-b border-slate-200">
        <button onClick={onBack} className="text-indigo-600 mb-3 flex items-center gap-1 text-sm">
          <ChevronRight className="w-4 h-4 rotate-180" /> Back
        </button>
        <h2 className="text-slate-900">User Guide</h2>
        <p className="text-slate-500 text-sm">Healthcare worker navigation guide</p>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="space-y-4">
          {/* Getting Started */}
          <Card className="p-4 bg-white border border-slate-200 rounded-xl">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                <Home className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <h3 className="text-slate-900 mb-2">Getting Started</h3>
                <p className="text-slate-600 text-sm mb-2">
                  The <strong>Home Screen</strong> shows your overview dashboard with quick cards for logging new visits, tracking high-risk patients, and viewing follow-up patients.
                </p>
                <p className="text-slate-600 text-sm">
                  Use the bottom navigation bar to quickly switch between Home, Patients, and Flagged sections. The <strong>Follow Up</strong> card shows patients who need scheduled visits.
                </p>
              </div>
            </div>
          </Card>

          {/* Registering New Patients */}
          <Card className="p-4 bg-white border border-slate-200 rounded-xl">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                <Plus className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h3 className="text-slate-900 mb-2">Registering New Patients</h3>
                <p className="text-slate-600 text-sm mb-2">
                  1. Tap <strong>"New Patient"</strong> from the home screen or use the + button in the bottom navigation.
                </p>
                <p className="text-slate-600 text-sm mb-2">
                  2. Fill in patient details as they appear on their legal ID. Fields marked with a red asterisk (*) are mandatory.
                </p>
                <p className="text-slate-600 text-sm mb-2">
                  3. Complete the <strong>Initial Screening</strong> with blood pressure, Random Blood Sugar, medications, and family history.
                </p>
                <p className="text-slate-600 text-sm">
                  4. The system will automatically calculate risk levels based on clinical data.
                </p>
              </div>
            </div>
          </Card>

          {/* Recording Visits */}
          <Card className="p-4 bg-white border border-slate-200 rounded-xl">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-slate-900 mb-2">Recording Follow-up Visits</h3>
                <p className="text-slate-600 text-sm mb-2">
                  1. Access the <strong>Follow Up</strong> card from Home or tap "Log New Visit" to record an existing patient visit.
                </p>
                <p className="text-slate-600 text-sm mb-2">
                  2. Patients are tagged as <strong>Due</strong> (on schedule) or <strong>Overdue</strong> (past scheduled date).
                </p>
                <p className="text-slate-600 text-sm mb-2">
                  3. Record vital signs (BP, blood sugar), assess medication adherence, and use <strong>Complication Screening</strong> for DM/HTN checks.
                </p>
                <p className="text-slate-600 text-sm">
                  4. Schedule the next follow-up date before saving the visit.
                </p>
              </div>
            </div>
          </Card>

          {/* Managing Patients */}
          <Card className="p-4 bg-white border border-slate-200 rounded-xl">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                <Users className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h3 className="text-slate-900 mb-2">Managing Patients</h3>
                <p className="text-slate-600 text-sm mb-2">
                  Access the <strong>Patients</strong> tab to view all registered patients. Use filters to narrow by risk level, condition (DM/HTN), or barangay.
                </p>
                <p className="text-slate-600 text-sm mb-2">
                  Tap any patient card to view their full profile, edit information, or record a new visit.
                </p>
                <p className="text-slate-600 text-sm">
                  Patient profiles show personal info, clinical data, medication history, and visit records.
                </p>
              </div>
            </div>
          </Card>

          {/* High-Risk Patients */}
          <Card className="p-4 bg-white border border-slate-200 rounded-xl">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-slate-900 mb-2">Tracking High-Risk & Follow-Up Patients</h3>
                <p className="text-slate-600 text-sm mb-2">
                  The <strong>Flagged</strong> tab combines high-risk patients and those needing follow-up visits in one view.
                </p>
                <p className="text-slate-600 text-sm mb-2">
                  High-risk criteria include: uncontrolled BP (≥160/100), RBS ≥200 mg/dL, poor medication adherence, or complications. Follow-up patients show <strong>Due</strong> or <strong>Overdue</strong> badges.
                </p>
                <p className="text-slate-600 text-sm">
                  Prioritize high-risk and overdue patients during field visits for immediate attention.
                </p>
              </div>
            </div>
          </Card>

          {/* Barangay Operations */}
          <Card className="p-4 bg-white border border-slate-200 rounded-xl">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                <MapPin className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <h3 className="text-slate-900 mb-2">Barangay Field Operations</h3>
                <p className="text-slate-600 text-sm mb-2">
                  Use <strong>Field Ops</strong> to plan visits across all 33 barangays of Jagna.
                </p>
                <p className="text-slate-600 text-sm mb-2">
                  Each barangay card shows HTN/DM patient counts, high-risk cases, and purok head contact information.
                </p>
                <p className="text-slate-600 text-sm">
                  Tap a barangay to see detailed statistics and patient registration rates.
                </p>
              </div>
            </div>
          </Card>

          {/* Scanner */}
          <Card className="p-4 bg-white border border-slate-200 rounded-xl">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center flex-shrink-0">
                <ScanLine className="w-5 h-5 text-teal-600" />
              </div>
              <div>
                <h3 className="text-slate-900 mb-2">Using the Scanner</h3>
                <p className="text-slate-600 text-sm mb-2">
                  Access the <strong>Scanner</strong> from the side menu to quickly look up patients using QR codes or barcodes.
                </p>
                <p className="text-slate-600 text-sm">
                  This is useful for rapid patient identification during busy field visits.
                </p>
              </div>
            </div>
          </Card>

          {/* Offline Mode */}
          <Card className="p-4 bg-white border border-slate-200 rounded-xl">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
                <WifiOff className="w-5 h-5 text-slate-600" />
              </div>
              <div>
                <h3 className="text-slate-900 mb-2">Working Offline</h3>
                <p className="text-slate-600 text-sm mb-2">
                  The app works fully offline. All data is stored locally on your device and will sync automatically when internet is available.
                </p>
                <p className="text-slate-600 text-sm mb-2">
                  The WiFi icon in the top-right shows your connection status.
                </p>
                <p className="text-slate-600 text-sm">
                  Use the blue sync button (bottom-right) to manually sync data when you have connectivity.
                </p>
              </div>
            </div>
          </Card>

          {/* Sync History */}
          <Card className="p-4 bg-white border border-slate-200 rounded-xl">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                <Database className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <h3 className="text-slate-900 mb-2">Sync History</h3>
                <p className="text-slate-600 text-sm mb-2">
                  View all your data synchronization records in <strong>Sync History</strong> from the side menu.
                </p>
                <p className="text-slate-600 text-sm">
                  This helps you track when patient data was last uploaded to the central server.
                </p>
              </div>
            </div>
          </Card>

          {/* Best Practices */}
          <Card className="p-4 bg-indigo-50 border border-indigo-200 rounded-xl">
            <h3 className="text-indigo-900 mb-2">Best Practices</h3>
            <ul className="space-y-2 text-slate-700 text-sm">
              <li>• Always verify patient identity before recording data</li>
              <li>• Sync your data at the end of each field visit when WiFi is available</li>
              <li>• Prioritize high-risk patients for more frequent follow-ups</li>
              <li>• Record medication adherence and complications during every visit</li>
              <li>• Keep purok head contacts updated for barangay coordination</li>
            </ul>
          </Card>

          {/* FAQs */}
          <Card className="p-4 bg-white border border-slate-200 rounded-xl">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center flex-shrink-0">
                <HelpCircle className="w-5 h-5 text-yellow-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-slate-900 mb-3">Frequently Asked Questions</h3>
                
                <Accordion type="single" collapsible className="space-y-2">
                  <AccordionItem value="item-1" className="border border-slate-200 rounded-lg px-4">
                    <AccordionTrigger className="text-slate-900 text-sm hover:no-underline">
                      What should I do if I can't find a patient in the system?
                    </AccordionTrigger>
                    <AccordionContent className="text-slate-600 text-sm">
                      First, try searching by different criteria (name, ID, barangay). If the patient is truly not registered, use the "New Patient" feature to register them with their proper identification details.
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-2" className="border border-slate-200 rounded-lg px-4">
                    <AccordionTrigger className="text-slate-900 text-sm hover:no-underline">
                      How do I know if my data has been synced?
                    </AccordionTrigger>
                    <AccordionContent className="text-slate-600 text-sm">
                      Check the WiFi icon in the top-right corner. When you have connectivity, the blue sync button will upload your data. Visit "Sync History" from the side menu to see detailed sync records with timestamps.
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-3" className="border border-slate-200 rounded-lg px-4">
                    <AccordionTrigger className="text-slate-900 text-sm hover:no-underline">
                      What happens if I enter wrong patient data?
                    </AccordionTrigger>
                    <AccordionContent className="text-slate-600 text-sm">
                      You can edit patient information by going to the patient's profile and tapping the "Edit" button. Make corrections and save. All changes are tracked for data quality purposes.
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-4" className="border border-slate-200 rounded-lg px-4">
                    <AccordionTrigger className="text-slate-900 text-sm hover:no-underline">
                      Can I use the app without internet connection?
                    </AccordionTrigger>
                    <AccordionContent className="text-slate-600 text-sm">
                      Yes! The app is designed for offline-first operation. All features work without internet. Your data is saved locally and will sync automatically when you reconnect.
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-5" className="border border-slate-200 rounded-lg px-4">
                    <AccordionTrigger className="text-slate-900 text-sm hover:no-underline">
                      How do I identify a bug or issue in the app?
                    </AccordionTrigger>
                    <AccordionContent className="text-slate-600 text-sm">
                      Common signs of bugs include: unexpected app crashes, data not saving properly, buttons not responding, incorrect calculations, or screens not loading. Take note of what you were doing when the issue occurred.
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-6" className="border border-slate-200 rounded-lg px-4">
                    <AccordionTrigger className="text-slate-900 text-sm hover:no-underline">
                      How do I report a bug or technical issue?
                    </AccordionTrigger>
                    <AccordionContent className="text-slate-600 text-sm">
                      <p className="mb-2">Report bugs through these steps:</p>
                      <ol className="ml-4 space-y-1">
                        <li>1. Note the exact screen where the issue occurred</li>
                        <li>2. Write down the steps to reproduce the problem</li>
                        <li>3. Check your BHW ID (shown in header, e.g., BHW-03456789)</li>
                        <li>4. Contact your supervisor or the IT support team immediately</li>
                        <li>5. If possible, take a screenshot of the error</li>
                      </ol>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-7" className="border border-slate-200 rounded-lg px-4">
                    <AccordionTrigger className="text-slate-900 text-sm hover:no-underline">
                      What should I do if patient data seems incorrect or missing?
                    </AccordionTrigger>
                    <AccordionContent className="text-slate-600 text-sm">
                      First, check "Sync History" to ensure your last sync was successful. If data is still missing after a successful sync, report this as a potential bug following the bug reporting steps above.
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-8" className="border border-slate-200 rounded-lg px-4">
                    <AccordionTrigger className="text-slate-900 text-sm hover:no-underline">
                      How often should I sync my data?
                    </AccordionTrigger>
                    <AccordionContent className="text-slate-600 text-sm">
                      Sync at least once at the end of each field visit when WiFi is available. For longer field operations (multiple days), try to sync daily if possible to ensure data backup.
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-9" className="border border-slate-200 rounded-lg px-4">
                    <AccordionTrigger className="text-slate-900 text-sm hover:no-underline">
                      What is the difference between HTN and DM patients in the system?
                    </AccordionTrigger>
                    <AccordionContent className="text-slate-600 text-sm">
                      HTN (Hypertension) patients have high blood pressure conditions, while DM (Diabetes Mellitus) patients have diabetes. Some patients may have both conditions. The app tracks them separately for proper disease management.
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-10" className="border border-slate-200 rounded-lg px-4">
                    <AccordionTrigger className="text-slate-900 text-sm hover:no-underline">
                      Who should I contact for training or additional help?
                    </AccordionTrigger>
                    <AccordionContent className="text-slate-600 text-sm">
                      Contact your supervising nurse or the Jagna Community Health program coordinator for additional training, questions about clinical protocols, or technical support.
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

// Component removed - Goal Cards feature discontinued

export default function AppWithToaster() {
  return (
    <>
      <App />
      <Toaster position="top-center" richColors closeButton expand={false} />
    </>
  );
}