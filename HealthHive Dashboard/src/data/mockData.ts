import { Patient, Barangay, StockItem, Visit } from '../types';

export const patients: Patient[] = [
  {
    id: 'JAG-000123',
    name: 'Ana Reyes',
    sex: 'F',
    age: 54,
    barangay: 'Tubod Monte',
    conditions: ['HTN', 'DM'],
    lastVisit: '2025-10-10',
    nextDue: '2025-11-10',
    risk: 'High',
    controlStatus: 'Uncontrolled',
    flaggedForFollowUp: true,
    followUpReason: 'Uncontrolled HTN & DM - BP 156/92, HbA1c 8.6%',
    contact: '+63 912 345 6789',
    latestBP: '156/92',
    latestRBG: 245,
    latestFBG: 158,
    latestHbA1c: '8.6%',
    latestBMI: 28.4,
    height: 152,
    weight: 66,
    medications: ['Metformin 500mg', 'Amlodipine 5mg'],
    occupation: 'Farmer / Agricultural Worker',
    education: 'Elementary',
    maritalStatus: 'Married',
    householdIncome: '5k-10k',
    religion: 'Roman Catholic'
  },
  {
    id: 'JAG-000124',
    name: 'Carlos Santos',
    sex: 'M',
    age: 62,
    barangay: 'Poblacion',
    conditions: ['HTN'],
    lastVisit: '2025-10-15',
    nextDue: '2025-12-15',
    risk: 'Medium',
    controlStatus: 'Controlled',
    contact: '+63 918 234 5678',
    latestBP: '128/82',
    latestBMI: 26.8,
    height: 168,
    weight: 76,
    medications: ['Losartan 50mg'],
    occupation: 'Unemployed / Seeking Work',
    education: 'College',
    maritalStatus: 'Married',
    householdIncome: '10k-20k',
    religion: 'Roman Catholic'
  },
  {
    id: 'JAG-000125',
    name: 'Maria Cruz',
    sex: 'F',
    age: 48,
    barangay: 'Naatang',
    conditions: ['DM'],
    lastVisit: '2025-09-20',
    nextDue: '2025-10-20',
    risk: 'Very High',
    controlStatus: 'Uncontrolled',
    flaggedForFollowUp: true,
    followUpReason: 'Follow-up overdue 12 days - Very high HbA1c 9.8%',
    contact: '+63 920 345 6789',
    latestRBG: 312,
    latestFBG: 198,
    latestHbA1c: '9.8%',
    latestBMI: 31.2,
    height: 155,
    weight: 75,
    medications: ['Metformin 1000mg', 'Glimepiride 2mg'],
    occupation: 'Vendor / Market Trader',
    education: 'High School',
    maritalStatus: 'Widowed',
    householdIncome: 'Below 5k',
    religion: 'Roman Catholic'
  },
  {
    id: 'JAG-000126',
    name: 'Ramon Garcia',
    sex: 'M',
    age: 58,
    barangay: 'Cantagay',
    conditions: ['HTN', 'DM'],
    lastVisit: '2025-10-18',
    nextDue: '2025-11-18',
    risk: 'Medium',
    controlStatus: 'Controlled',
    latestBP: '134/84',
    latestRBG: 152,
    latestFBG: 118,
    latestHbA1c: '6.8%',
    latestBMI: 24.9,
    height: 165,
    weight: 68,
    medications: ['Metformin 500mg', 'Amlodipine 10mg'],
    occupation: 'Fisherman / Fish Vendor',
    education: 'Elementary',
    maritalStatus: 'Married',
    householdIncome: '5k-10k',
    religion: 'Roman Catholic'
  },
  {
    id: 'JAG-000127',
    name: 'Elena Villanueva',
    sex: 'F',
    age: 51,
    barangay: 'Looc',
    conditions: ['HTN'],
    lastVisit: '2025-10-12',
    nextDue: '2025-12-12',
    risk: 'Low',
    controlStatus: 'Controlled',
    latestBP: '122/78',
    latestBMI: 23.4,
    height: 158,
    weight: 58,
    medications: ['Amlodipine 5mg'],
    occupation: 'Health Worker / Barangay Volunteer',
    education: 'High School',
    maritalStatus: 'Married',
    householdIncome: '10k-20k',
    religion: 'Roman Catholic'
  },
  {
    id: 'JAG-000128',
    name: 'Jose Mendoza',
    sex: 'M',
    age: 66,
    barangay: 'Tubod Monte',
    conditions: ['DM'],
    lastVisit: '2025-08-15',
    nextDue: '2025-09-15',
    risk: 'High',
    controlStatus: 'Uncontrolled',
    flaggedForFollowUp: true,
    followUpReason: 'Follow-up overdue 47 days - HbA1c 8.2%',
    latestHbA1c: '8.2%',
    latestBMI: 27.3,
    height: 162,
    weight: 72,
    medications: ['Metformin 850mg'],
    occupation: 'Farmer / Agricultural Worker',
    education: 'Elementary',
    maritalStatus: 'Widowed',
    householdIncome: 'Below 5k',
    religion: 'Roman Catholic'
  },
  {
    id: 'JAG-000129',
    name: 'Lorna Mendez',
    sex: 'F',
    age: 45,
    barangay: 'Poblacion',
    conditions: ['HTN'],
    lastVisit: '2025-10-20',
    nextDue: '2025-12-20',
    risk: 'Low',
    controlStatus: 'Controlled',
    latestBP: '124/78',
    latestBMI: 25.6,
    height: 157,
    weight: 63,
    medications: ['Losartan 50mg'],
    occupation: 'Vendor / Market Trader',
    education: 'High School',
    maritalStatus: 'Married',
    householdIncome: '5k-10k',
    religion: 'Roman Catholic'
  },
  {
    id: 'JAG-000130',
    name: 'Roberto Diaz',
    sex: 'M',
    age: 52,
    barangay: 'Cantagay',
    conditions: ['DM', 'HTN'],
    lastVisit: '2025-10-18',
    nextDue: '2025-11-18',
    risk: 'High',
    controlStatus: 'Uncontrolled',
    flaggedForFollowUp: true,
    followUpReason: 'Uncontrolled HTN & DM - BP 152/94, HbA1c 8.4%',
    latestBP: '152/94',
    latestHbA1c: '8.4%',
    latestBMI: 29.8,
    height: 170,
    weight: 86,
    medications: ['Metformin 1000mg', 'Amlodipine 10mg'],
    occupation: 'Transport / Driver (Tricycle / Cargo)',
    education: 'Elementary',
    maritalStatus: 'Married',
    householdIncome: '5k-10k',
    religion: 'Roman Catholic'
  },
  {
    id: 'JAG-000131',
    name: 'Gloria Tan',
    sex: 'F',
    age: 58,
    barangay: 'Looc',
    conditions: ['DM'],
    lastVisit: '2025-10-14',
    nextDue: '2025-11-14',
    risk: 'Medium',
    controlStatus: 'Controlled',
    latestHbA1c: '6.9%',
    latestBMI: 26.1,
    height: 153,
    weight: 61,
    medications: ['Metformin 500mg'],
    occupation: 'Homemaker / Housewife',
    education: 'High School',
    maritalStatus: 'Married',
    householdIncome: '10k-20k',
    religion: 'Roman Catholic'
  },
  {
    id: 'JAG-000132',
    name: 'Pedro Cortez',
    sex: 'M',
    age: 63,
    barangay: 'Canjulao',
    conditions: ['HTN'],
    lastVisit: '2025-10-22',
    nextDue: '2025-12-22',
    risk: 'Medium',
    controlStatus: 'Controlled',
    latestBP: '134/86',
    latestBMI: 24.3,
    height: 164,
    weight: 65,
    medications: ['Amlodipine 5mg', 'Losartan 50mg'],
    occupation: 'Fisherman / Fish Vendor',
    education: 'Elementary',
    maritalStatus: 'Married',
    householdIncome: '5k-10k',
    religion: 'Roman Catholic'
  },
  {
    id: 'JAG-000133',
    name: 'Rosario Bautista',
    sex: 'F',
    age: 41,
    barangay: 'Naatang',
    conditions: ['DM'],
    lastVisit: '2025-10-16',
    nextDue: '2025-11-16',
    risk: 'Low',
    controlStatus: 'Controlled',
    latestHbA1c: '6.5%',
    latestBMI: 24.7,
    height: 160,
    weight: 63,
    medications: ['Metformin 500mg'],
    occupation: 'Teacher / Educator',
    education: 'College',
    maritalStatus: 'Single',
    householdIncome: '10k-20k',
    religion: 'Roman Catholic'
  },
  {
    id: 'JAG-000134',
    name: 'Emilio Santos',
    sex: 'M',
    age: 49,
    barangay: 'Cabungaan',
    conditions: ['HTN', 'DM'],
    lastVisit: '2025-10-11',
    nextDue: '2025-11-11',
    risk: 'Very High',
    controlStatus: 'Uncontrolled',
    flaggedForFollowUp: true,
    followUpReason: 'Uncontrolled HTN & DM - BP 164/98, HbA1c 9.2%',
    latestBP: '164/98',
    latestHbA1c: '9.2%',
    latestBMI: 32.1,
    height: 167,
    weight: 90,
    medications: ['Metformin 1000mg', 'Glimepiride 2mg', 'Amlodipine 10mg'],
    occupation: 'Construction Worker / Labourer',
    education: 'Elementary',
    maritalStatus: 'Married',
    householdIncome: 'Below 5k',
    religion: 'Roman Catholic'
  },
  {
    id: 'JAG-000135',
    name: 'Luisa Ramos',
    sex: 'F',
    age: 56,
    barangay: 'Poblacion',
    conditions: ['HTN'],
    lastVisit: '2025-10-19',
    nextDue: '2025-12-19',
    risk: 'Medium',
    controlStatus: 'Controlled',
    latestBP: '136/84',
    latestBMI: 27.8,
    height: 156,
    weight: 68,
    medications: ['Losartan 50mg'],
    occupation: 'Office / Government Employee',
    education: 'College',
    maritalStatus: 'Married',
    householdIncome: '20k-40k',
    religion: 'Roman Catholic'
  },
  {
    id: 'JAG-000136',
    name: 'Miguel Torres',
    sex: 'M',
    age: 44,
    barangay: 'Lonoy',
    conditions: ['DM'],
    lastVisit: '2025-10-13',
    nextDue: '2025-11-13',
    risk: 'Low',
    controlStatus: 'Controlled',
    latestHbA1c: '6.7%',
    latestBMI: 25.8,
    height: 169,
    weight: 74,
    medications: ['Metformin 500mg'],
    occupation: 'Port / Cargo Handler / Dock Worker',
    education: 'High School',
    maritalStatus: 'Married',
    householdIncome: '5k-10k',
    religion: 'Roman Catholic'
  },
  {
    id: 'JAG-000137',
    name: 'Carmen dela Cruz',
    sex: 'F',
    age: 67,
    barangay: 'Tubod Monte',
    conditions: ['HTN', 'DM'],
    lastVisit: '2025-10-17',
    nextDue: '2025-11-17',
    risk: 'High',
    controlStatus: 'Controlled',
    latestBP: '138/88',
    latestHbA1c: '7.2%',
    latestBMI: 28.9,
    height: 151,
    weight: 66,
    medications: ['Metformin 850mg', 'Amlodipine 5mg'],
    occupation: 'Unemployed / Seeking Work',
    education: 'Elementary',
    maritalStatus: 'Widowed',
    householdIncome: 'Below 5k',
    religion: 'Roman Catholic'
  },
  {
    id: 'JAG-000138',
    name: 'Fernando Lopez',
    sex: 'M',
    age: 53,
    barangay: 'Cantagay',
    conditions: ['HTN'],
    lastVisit: '2025-10-21',
    nextDue: '2025-12-21',
    risk: 'Low',
    controlStatus: 'Controlled',
    latestBP: '126/80',
    latestBMI: 23.8,
    height: 166,
    weight: 66,
    medications: ['Amlodipine 5mg'],
    occupation: 'Livestock / Poultry Raiser',
    education: 'Elementary',
    maritalStatus: 'Married',
    householdIncome: '5k-10k',
    religion: 'Roman Catholic'
  },
  {
    id: 'JAG-000139',
    name: 'Teresa Aquino',
    sex: 'F',
    age: 39,
    barangay: 'Looc',
    conditions: ['DM'],
    lastVisit: '2025-10-10',
    nextDue: '2025-11-10',
    risk: 'Medium',
    controlStatus: 'Controlled',
    latestHbA1c: '7.1%',
    latestBMI: 26.4,
    height: 159,
    weight: 67,
    medications: ['Metformin 500mg'],
    occupation: 'Tourism / Hospitality Worker',
    education: 'College',
    maritalStatus: 'Single',
    householdIncome: '10k-20k',
    religion: 'Roman Catholic'
  },
  {
    id: 'JAG-000140',
    name: 'Antonio Reyes',
    sex: 'M',
    age: 71,
    barangay: 'Poblacion',
    conditions: ['HTN'],
    lastVisit: '2025-10-23',
    nextDue: '2025-12-23',
    risk: 'High',
    controlStatus: 'Controlled',
    latestBP: '142/86',
    latestBMI: 25.2,
    height: 168,
    weight: 71,
    medications: ['Losartan 50mg', 'Amlodipine 5mg'],
    occupation: 'Unemployed / Seeking Work',
    education: 'College',
    maritalStatus: 'Married',
    householdIncome: '10k-20k',
    religion: 'Roman Catholic'
  },
  {
    id: 'JAG-000141',
    name: 'Bella Garcia',
    sex: 'F',
    age: 47,
    barangay: 'Canjulao',
    conditions: ['DM', 'HTN'],
    lastVisit: '2025-10-12',
    nextDue: '2025-11-12',
    risk: 'Medium',
    controlStatus: 'Controlled',
    latestBP: '132/82',
    latestHbA1c: '6.8%',
    latestBMI: 27.2,
    height: 154,
    weight: 65,
    medications: ['Metformin 500mg', 'Amlodipine 5mg'],
    occupation: 'Artisan / Calamay / Food Processor',
    education: 'High School',
    maritalStatus: 'Married',
    householdIncome: '5k-10k',
    religion: 'Roman Catholic'
  },
  {
    id: 'JAG-000142',
    name: 'Ricardo Morales',
    sex: 'M',
    age: 55,
    barangay: 'Naatang',
    conditions: ['HTN'],
    lastVisit: '2025-10-24',
    nextDue: '2025-12-24',
    risk: 'Medium',
    controlStatus: 'Controlled',
    latestBP: '134/84',
    latestBMI: 24.6,
    height: 167,
    weight: 69,
    medications: ['Losartan 50mg'],
    occupation: 'Farmer / Agricultural Worker',
    education: 'Elementary',
    maritalStatus: 'Married',
    householdIncome: '5k-10k',
    religion: 'Roman Catholic'
  },
  {
    id: 'JAG-000143',
    name: 'Maricel Fernandez',
    sex: 'F',
    age: 34,
    barangay: 'Lonoy',
    conditions: ['DM'],
    lastVisit: '2025-10-08',
    nextDue: '2025-11-08',
    risk: 'Low',
    controlStatus: 'Controlled',
    latestHbA1c: '6.6%',
    latestBMI: 22.8,
    height: 161,
    weight: 59,
    medications: ['Metformin 500mg'],
    occupation: 'Health Worker / Barangay Volunteer',
    education: 'College',
    maritalStatus: 'Single',
    householdIncome: '10k-20k',
    religion: 'Roman Catholic'
  },
  {
    id: 'JAG-000144',
    name: 'Jorge Salazar',
    sex: 'M',
    age: 60,
    barangay: 'Cabungaan',
    conditions: ['HTN', 'DM'],
    lastVisit: '2025-10-15',
    nextDue: '2025-11-15',
    risk: 'High',
    controlStatus: 'Uncontrolled',
    latestBP: '158/96',
    latestHbA1c: '8.7%',
    latestBMI: 30.5,
    height: 163,
    weight: 81,
    medications: ['Metformin 850mg', 'Amlodipine 10mg', 'Losartan 50mg'],
    occupation: 'Fisherman / Fish Vendor',
    education: 'Elementary',
    maritalStatus: 'Married',
    householdIncome: 'Below 5k',
    religion: 'Roman Catholic'
  },
  {
    id: 'JAG-000145',
    name: 'Nilda Santiago',
    sex: 'F',
    age: 50,
    barangay: 'Tubod Monte',
    conditions: ['HTN'],
    lastVisit: '2025-10-09',
    nextDue: '2025-12-09',
    risk: 'Low',
    controlStatus: 'Controlled',
    latestBP: '122/76',
    latestBMI: 25.3,
    height: 155,
    weight: 61,
    medications: ['Amlodipine 5mg'],
    occupation: 'Manufacturing / Factory Worker',
    education: 'High School',
    maritalStatus: 'Married',
    householdIncome: '10k-20k',
    religion: 'Roman Catholic'
  },
  // Healthy patients without conditions
  {
    id: 'JAG-000146',
    name: 'Sarah Flores',
    sex: 'F',
    age: 28,
    barangay: 'Poblacion',
    conditions: [],
    lastVisit: '2025-10-15',
    nextDue: '2026-10-15',
    risk: 'Normal',
    controlStatus: 'N/A',
    contact: '+63 917 123 4567',
    latestBP: '118/75',
    latestBMI: 21.5,
    height: 160,
    weight: 55,
    occupation: 'Teacher / Educator',
    education: 'College',
    maritalStatus: 'Single',
    religion: 'Roman Catholic'
  },
  {
    id: 'JAG-000147',
    name: 'Mark Alvarez',
    sex: 'M',
    age: 35,
    barangay: 'Cantagay',
    conditions: [],
    lastVisit: '2025-10-08',
    nextDue: '2026-10-08',
    risk: 'Normal',
    controlStatus: 'N/A',
    contact: '+63 918 765 4321',
    latestBP: '120/78',
    latestBMI: 22.8,
    height: 172,
    weight: 68,
    occupation: 'Office / Government Employee',
    education: 'College',
    maritalStatus: 'Married',
    religion: 'Roman Catholic'
  },
  {
    id: 'JAG-000148',
    name: 'Lisa Gomez',
    sex: 'F',
    age: 42,
    barangay: 'Looc',
    conditions: [],
    lastVisit: '2025-09-22',
    nextDue: '2026-09-22',
    risk: 'Normal',
    controlStatus: 'N/A',
    contact: '+63 920 456 7890',
    latestBP: '115/72',
    latestBMI: 20.3,
    height: 158,
    weight: 51,
    occupation: 'Health Worker / Barangay Volunteer',
    education: 'College',
    maritalStatus: 'Married',
    religion: 'Roman Catholic'
  },
  {
    id: 'JAG-000149',
    name: 'David Cruz',
    sex: 'M',
    age: 31,
    barangay: 'Canjulao',
    conditions: [],
    lastVisit: '2025-10-20',
    nextDue: '2026-10-20',
    risk: 'Normal',
    controlStatus: 'N/A',
    contact: '+63 915 234 5678',
    latestBP: '122/80',
    latestBMI: 23.1,
    height: 175,
    weight: 71,
    occupation: 'Fisherman / Fish Vendor',
    education: 'High School',
    maritalStatus: 'Single',
    religion: 'Roman Catholic'
  },
  {
    id: 'JAG-000150',
    name: 'Anna Martinez',
    sex: 'F',
    age: 26,
    barangay: 'Naatang',
    conditions: [],
    lastVisit: '2025-10-12',
    nextDue: '2026-10-12',
    risk: 'Normal',
    controlStatus: 'N/A',
    contact: '+63 919 876 5432',
    latestBP: '116/74',
    latestBMI: 19.8,
    height: 155,
    weight: 48,
    occupation: 'Vendor / Market Trader',
    education: 'High School',
    maritalStatus: 'Single',
    religion: 'Roman Catholic'
  },
  {
    id: 'JAG-000151',
    name: 'Robert Solis',
    sex: 'M',
    age: 38,
    barangay: 'Tubod Monte',
    conditions: [],
    lastVisit: '2025-10-05',
    nextDue: '2026-10-05',
    risk: 'Normal',
    controlStatus: 'N/A',
    contact: '+63 916 345 6789',
    latestBP: '119/76',
    latestBMI: 22.4,
    height: 168,
    weight: 63,
    occupation: 'Farmer / Agricultural Worker',
    education: 'Elementary',
    maritalStatus: 'Married',
    religion: 'Roman Catholic'
  },
  {
    id: 'JAG-000152',
    name: 'Jennifer Perez',
    sex: 'F',
    age: 29,
    barangay: 'Poblacion',
    conditions: [],
    lastVisit: '2025-10-18',
    nextDue: '2026-10-18',
    risk: 'Normal',
    controlStatus: 'N/A',
    contact: '+63 921 567 8901',
    latestBP: '117/73',
    latestBMI: 21.0,
    height: 162,
    weight: 55,
    occupation: 'Tourism / Hospitality Worker',
    education: 'College',
    maritalStatus: 'Single',
    religion: 'Roman Catholic'
  },
  {
    id: 'JAG-000153',
    name: 'Carlos Ramirez',
    sex: 'M',
    age: 45,
    barangay: 'Lonoy',
    conditions: [],
    lastVisit: '2025-09-30',
    nextDue: '2026-09-30',
    risk: 'Normal',
    controlStatus: 'N/A',
    contact: '+63 922 678 9012',
    latestBP: '121/79',
    latestBMI: 24.2,
    height: 170,
    weight: 70,
    occupation: 'Construction Worker / Labourer',
    education: 'High School',
    maritalStatus: 'Married',
    religion: 'Roman Catholic'
  }
];

export const barangays: Barangay[] = [
  { id: 'bg-001', name: 'Alejawan', population: 1845, registered: 142, screenedPercent: 73, uncontrolledDM: 12, uncontrolledHTN: 16, lastClinicDate: '2025-10-05' },
  { id: 'bg-002', name: 'Balili', population: 2134, registered: 165, screenedPercent: 68, uncontrolledDM: 14, uncontrolledHTN: 18, lastClinicDate: '2025-09-28' },
  { id: 'bg-003', name: 'Banlasan', population: 1678, registered: 128, screenedPercent: 71, uncontrolledDM: 10, uncontrolledHTN: 15, lastClinicDate: '2025-10-12' },
  { id: 'bg-004', name: 'Basdio', population: 1523, registered: 118, screenedPercent: 65, uncontrolledDM: 9, uncontrolledHTN: 13, lastClinicDate: '2025-10-08' },
  { id: 'bg-005', name: 'Bunga Ilaya', population: 2345, registered: 182, screenedPercent: 76, uncontrolledDM: 15, uncontrolledHTN: 20, lastClinicDate: '2025-10-18' },
  { id: 'bg-006', name: 'Bunga Mar', population: 2156, registered: 168, screenedPercent: 74, uncontrolledDM: 13, uncontrolledHTN: 19, lastClinicDate: '2025-10-15' },
  { id: 'bg-007', name: 'Cabungaan', population: 3421, registered: 265, screenedPercent: 81, uncontrolledDM: 20, uncontrolledHTN: 28, lastClinicDate: '2025-10-22' },
  { id: 'bg-008', name: 'Calabacita', population: 1890, registered: 146, screenedPercent: 70, uncontrolledDM: 11, uncontrolledHTN: 17, lastClinicDate: '2025-10-10' },
  { id: 'bg-009', name: 'Can-ipol', population: 2567, registered: 199, screenedPercent: 78, uncontrolledDM: 16, uncontrolledHTN: 22, lastClinicDate: '2025-10-20' },
  { id: 'bg-010', name: 'Cantagay', population: 4200, registered: 298, screenedPercent: 87, uncontrolledDM: 15, uncontrolledHTN: 28, lastClinicDate: '2025-10-18' },
  { id: 'bg-011', name: 'Canjulao', population: 3845, registered: 297, screenedPercent: 85, uncontrolledDM: 23, uncontrolledHTN: 31, lastClinicDate: '2025-10-24' },
  { id: 'bg-012', name: 'Can-uba', population: 2234, registered: 173, screenedPercent: 75, uncontrolledDM: 14, uncontrolledHTN: 19, lastClinicDate: '2025-10-14' },
  { id: 'bg-013', name: 'Causwagan Norte', population: 2678, registered: 207, screenedPercent: 79, uncontrolledDM: 17, uncontrolledHTN: 23, lastClinicDate: '2025-10-16' },
  { id: 'bg-014', name: 'Causwagan Sur', population: 2456, registered: 190, screenedPercent: 77, uncontrolledDM: 15, uncontrolledHTN: 21, lastClinicDate: '2025-10-11' },
  { id: 'bg-015', name: 'Faraon', population: 1967, registered: 152, screenedPercent: 72, uncontrolledDM: 12, uncontrolledHTN: 17, lastClinicDate: '2025-10-09' },
  { id: 'bg-016', name: 'Kinagbaan', population: 2890, registered: 224, screenedPercent: 80, uncontrolledDM: 18, uncontrolledHTN: 25, lastClinicDate: '2025-10-21' },
  { id: 'bg-017', name: 'Larapan', population: 2123, registered: 164, screenedPercent: 73, uncontrolledDM: 13, uncontrolledHTN: 18, lastClinicDate: '2025-10-07' },
  { id: 'bg-018', name: 'Lonoy', population: 3234, registered: 250, screenedPercent: 82, uncontrolledDM: 19, uncontrolledHTN: 26, lastClinicDate: '2025-10-19' },
  { id: 'bg-019', name: 'Looc', population: 3600, registered: 265, screenedPercent: 76, uncontrolledDM: 19, uncontrolledHTN: 22, lastClinicDate: '2025-10-10' },
  { id: 'bg-020', name: 'Malbog', population: 2745, registered: 212, screenedPercent: 78, uncontrolledDM: 17, uncontrolledHTN: 23, lastClinicDate: '2025-10-17' },
  { id: 'bg-021', name: 'Mayana', population: 1834, registered: 142, screenedPercent: 69, uncontrolledDM: 11, uncontrolledHTN: 16, lastClinicDate: '2025-10-06' },
  { id: 'bg-022', name: 'Naatang', population: 2100, registered: 156, screenedPercent: 68, uncontrolledDM: 22, uncontrolledHTN: 19, lastClinicDate: '2025-09-28' },
  { id: 'bg-023', name: 'Nausok', population: 2456, registered: 190, screenedPercent: 75, uncontrolledDM: 15, uncontrolledHTN: 21, lastClinicDate: '2025-10-13' },
  { id: 'bg-024', name: 'Odiong', population: 1723, registered: 133, screenedPercent: 67, uncontrolledDM: 10, uncontrolledHTN: 15, lastClinicDate: '2025-10-04' },
  { id: 'bg-025', name: 'Pagina', population: 2890, registered: 224, screenedPercent: 79, uncontrolledDM: 18, uncontrolledHTN: 24, lastClinicDate: '2025-10-20' },
  { id: 'bg-026', name: 'Pangdan', population: 3123, registered: 242, screenedPercent: 81, uncontrolledDM: 19, uncontrolledHTN: 26, lastClinicDate: '2025-10-22' },
  { id: 'bg-027', name: 'Poblacion', population: 5800, registered: 412, screenedPercent: 91, uncontrolledDM: 28, uncontrolledHTN: 35, lastClinicDate: '2025-10-20' },
  { id: 'bg-028', name: 'Puting Bato', population: 2234, registered: 173, screenedPercent: 74, uncontrolledDM: 14, uncontrolledHTN: 19, lastClinicDate: '2025-10-15' },
  { id: 'bg-029', name: 'Tejero', population: 2567, registered: 199, screenedPercent: 77, uncontrolledDM: 16, uncontrolledHTN: 22, lastClinicDate: '2025-10-18' },
  { id: 'bg-030', name: 'Tubod Monte', population: 3200, registered: 248, screenedPercent: 82, uncontrolledDM: 18, uncontrolledHTN: 24, lastClinicDate: '2025-10-15' },
  { id: 'bg-031', name: 'Tubod Bitoon', population: 2678, registered: 207, screenedPercent: 78, uncontrolledDM: 16, uncontrolledHTN: 22, lastClinicDate: '2025-10-16' },
  { id: 'bg-032', name: 'Ubayon', population: 1945, registered: 150, screenedPercent: 71, uncontrolledDM: 12, uncontrolledHTN: 17, lastClinicDate: '2025-10-11' },
  { id: 'bg-033', name: 'Can-upao', population: 2345, registered: 182, screenedPercent: 76, uncontrolledDM: 14, uncontrolledHTN: 20, lastClinicDate: '2025-10-19' }
];

export const stockItems: StockItem[] = [
  {
    id: 'med-001',
    name: 'Metformin 500mg',
    currentStock: 4800,
    avgMonthlyUse: 1200,
    reorderPoint: 2400,
    nextDeliveryETA: '2025-11-15',
    daysOfSupply: 120
  },
  {
    id: 'med-002',
    name: 'Amlodipine 5mg',
    currentStock: 1800,
    avgMonthlyUse: 900,
    reorderPoint: 1800,
    nextDeliveryETA: '2025-11-10',
    daysOfSupply: 60
  },
  {
    id: 'med-003',
    name: 'Losartan 50mg',
    currentStock: 800,
    avgMonthlyUse: 600,
    reorderPoint: 1200,
    nextDeliveryETA: '2025-11-05',
    daysOfSupply: 40
  },
  {
    id: 'supply-001',
    name: 'Glucose Test Strips',
    currentStock: 2400,
    avgMonthlyUse: 1800,
    reorderPoint: 3600,
    nextDeliveryETA: '2025-11-08',
    daysOfSupply: 40
  },
  {
    id: 'supply-002',
    name: 'Lancets',
    currentStock: 5000,
    avgMonthlyUse: 2000,
    reorderPoint: 4000,
    nextDeliveryETA: '2025-12-01',
    daysOfSupply: 75
  }
];

export const monthlyScreenings = [
  { month: 'May', screenings: 145, diagnoses: 12 },
  { month: 'Jun', screenings: 168, diagnoses: 15 },
  { month: 'Jul', screenings: 192, diagnoses: 18 },
  { month: 'Aug', screenings: 156, diagnoses: 14 },
  { month: 'Sep', screenings: 178, diagnoses: 16 },
  { month: 'Oct', screenings: 201, diagnoses: 21 }
];

export const controlFunnelData = [
  { stage: 'Eligible', DM: 420, HTN: 580 },
  { stage: 'On Treatment', DM: 385, HTN: 542 },
  { stage: 'Recent Test', DM: 340, HTN: 498 },
  { stage: 'Controlled', DM: 265, HTN: 412 }
];

export const hbA1cDistribution = [
  { range: '<6.5', count: 85 },
  { range: '6.5-7.0', count: 120 },
  { range: '7.0-8.0', count: 95 },
  { range: '8.0-9.0', count: 68 },
  { range: '>9.0', count: 42 }
];

// Fasting Blood Glucose (FBG) distribution - more commonly used in rural settings
export const fbgDistribution = [
  { range: '<100', count: 142, status: 'Normal' },
  { range: '100-125', count: 98, status: 'Pre-diabetic' },
  { range: '126-180', count: 112, status: 'Diabetic (Controlled)' },
  { range: '181-250', count: 48, status: 'Diabetic (Uncontrolled)' },
  { range: '>250', count: 20, status: 'Diabetic (Very High)' }
];

// Random Blood Glucose (RBG) distribution - most accessible in rural areas
export const rbgDistribution = [
  { range: '<140', count: 156, status: 'Normal' },
  { range: '140-199', count: 89, status: 'Borderline' },
  { range: '200-250', count: 102, status: 'Diabetic (Controlled)' },
  { range: '251-350', count: 52, status: 'Diabetic (Uncontrolled)' },
  { range: '>350', count: 21, status: 'Diabetic (Very High)' }
];

// Demographics data
export const occupationDistribution = [
  { occupation: 'Farmer / Agricultural Worker', count: 2178, percent: 32 },
  { occupation: 'Fisherman / Fish Vendor', count: 1156, percent: 17 },
  { occupation: 'Homemaker / Housewife', count: 748, percent: 11 },
  { occupation: 'Vendor / Market Trader', count: 544, percent: 8 },
  { occupation: 'Unemployed / Seeking Work', count: 476, percent: 7 },
  { occupation: 'Livestock / Poultry Raiser', count: 408, percent: 6 },
  { occupation: 'Transport / Driver (Tricycle / Cargo)', count: 272, percent: 4 },
  { occupation: 'Construction Worker / Labourer', count: 272, percent: 4 },
  { occupation: 'Student', count: 204, percent: 3 },
  { occupation: 'Office / Government Employee', count: 136, percent: 2 },
  { occupation: 'Port / Cargo Handler / Dock Worker', count: 136, percent: 2 },
  { occupation: 'Teacher / Educator', count: 68, percent: 1 },
  { occupation: 'Artisan / Calamay / Food Processor', count: 68, percent: 1 },
  { occupation: 'Tourism / Hospitality Worker', count: 68, percent: 1 },
  { occupation: 'Health Worker / Barangay Volunteer', count: 68, percent: 1 },
  { occupation: 'Manufacturing / Factory Worker', count: 68, percent: 1 },
  { occupation: 'Other', count: 68, percent: 1 }
];

export const educationDistribution = [
  { level: 'Elementary', count: 3264, percent: 48 },
  { level: 'High School', count: 2176, percent: 32 },
  { level: 'College', count: 952, percent: 14 },
  { level: 'No formal education', count: 340, percent: 5 },
  { level: 'Graduate', count: 68, percent: 1 }
];

export const incomeDistribution = [
  { range: 'Below 5k', count: 2448, percent: 36 },
  { range: '5k-10k', count: 2380, percent: 35 },
  { range: '10k-20k', count: 1360, percent: 20 },
  { range: '20k-40k', count: 476, percent: 7 },
  { range: 'Above 40k', count: 136, percent: 2 }
];

// Hypertension complications
export const htnComplications = [
  { complication: 'None', count: 412, percent: 71 },
  { complication: 'Left Ventricular Hypertrophy', count: 81, percent: 14 },
  { complication: 'Chronic Kidney Disease', count: 52, percent: 9 },
  { complication: 'Stroke/TIA', count: 23, percent: 4 },
  { complication: 'Heart Failure', count: 12, percent: 2 }
];

// HTN risk stratification (based on BP levels and risk factors)
export const htnRiskStratification = [
  { risk: 'Low', count: 168, percent: 29, description: 'Stage 1 HTN, no other risk factors' },
  { risk: 'Moderate', count: 232, percent: 40, description: 'Stage 1-2 HTN with 1-2 risk factors' },
  { risk: 'High', count: 127, percent: 22, description: 'Stage 2 HTN or multiple risk factors' },
  { risk: 'Very High', count: 53, percent: 9, description: 'Stage 3 HTN or complications' }
];

// DM risk stratification (based on glucose control and complications)
export const dmRiskStratification = [
  { risk: 'Low', count: 184, percent: 44, description: 'Well-controlled glucose, no complications' },
  { risk: 'Moderate', count: 126, percent: 30, description: 'Moderate control, 1-2 risk factors' },
  { risk: 'High', count: 68, percent: 16, description: 'Poor control or multiple risk factors' },
  { risk: 'Very High', count: 42, percent: 10, description: 'Very poor control or complications' }
];

// HTN Treatment adherence data
export const htnTreatmentAdherence = [
  { category: 'Good Adherence', count: 378, percent: 65, description: '≥80% doses taken' },
  { category: 'Moderate Adherence', count: 139, percent: 24, description: '50-79% doses taken' },
  { category: 'Poor Adherence', count: 63, percent: 11, description: '<50% doses taken' }
];

// DM Treatment adherence data
export const dmTreatmentAdherence = [
  { category: 'Good Adherence', count: 285, percent: 68, description: '≥80% doses taken' },
  { category: 'Moderate Adherence', count: 92, percent: 22, description: '50-79% doses taken' },
  { category: 'Poor Adherence', count: 43, percent: 10, description: '<50% doses taken' }
];

// Occupation-disease correlation (shows disease prevalence by occupation)
export const occupationDiseaseCorrelation = [
  { 
    occupation: 'Farmer / Agricultural Worker', 
    total: 2178,
    dmCount: 142,
    htnCount: 174,
    dmPrevalence: 6.5,
    htnPrevalence: 8.0,
    notes: 'High physical activity, but diet high in salt/carbs'
  },
  { 
    occupation: 'Fisherman / Fish Vendor', 
    total: 1156,
    dmCount: 55,
    htnCount: 104,
    dmPrevalence: 4.8,
    htnPrevalence: 9.0,
    notes: 'High sodium diet from preserved fish, irregular meals'
  },
  { 
    occupation: 'Homemaker / Housewife', 
    total: 748,
    dmCount: 53,
    htnCount: 59,
    dmPrevalence: 7.1,
    htnPrevalence: 7.9,
    notes: 'Varied activity levels, stress-related factors'
  },
  { 
    occupation: 'Vendor / Market Trader', 
    total: 544,
    dmCount: 38,
    htnCount: 44,
    dmPrevalence: 7.0,
    htnPrevalence: 8.1,
    notes: 'Sedentary lifestyle, easy access to processed foods'
  },
  { 
    occupation: 'Unemployed / Seeking Work', 
    total: 476,
    dmCount: 43,
    htnCount: 71,
    dmPrevalence: 9.1,
    htnPrevalence: 15.0,
    notes: 'Age-related increase (many are retired), reduced activity'
  },
  { 
    occupation: 'Livestock / Poultry Raiser', 
    total: 408,
    dmCount: 25,
    htnCount: 33,
    dmPrevalence: 6.1,
    htnPrevalence: 8.1,
    notes: 'Physical activity from farm work'
  },
  { 
    occupation: 'Transport / Driver', 
    total: 272,
    dmCount: 19,
    htnCount: 25,
    dmPrevalence: 7.0,
    htnPrevalence: 9.2,
    notes: 'Sedentary, irregular eating, stress'
  },
  { 
    occupation: 'Construction Worker', 
    total: 272,
    dmCount: 11,
    htnCount: 22,
    dmPrevalence: 4.0,
    htnPrevalence: 8.1,
    notes: 'High physical activity, younger demographic'
  },
  { 
    occupation: 'Student', 
    total: 204,
    dmCount: 2,
    htnCount: 4,
    dmPrevalence: 1.0,
    htnPrevalence: 2.0,
    notes: 'Youngest group, very low prevalence'
  },
  { 
    occupation: 'Office / Government Employee', 
    total: 136,
    dmCount: 10,
    htnCount: 11,
    dmPrevalence: 7.4,
    htnPrevalence: 8.1,
    notes: 'Sedentary work environment'
  },
  { 
    occupation: 'Port / Cargo Handler', 
    total: 136,
    dmCount: 5,
    htnCount: 11,
    dmPrevalence: 3.7,
    htnPrevalence: 8.1,
    notes: 'Heavy physical labor'
  },
  { 
    occupation: 'Teacher / Educator', 
    total: 68,
    dmCount: 5,
    htnCount: 5,
    dmPrevalence: 7.4,
    htnPrevalence: 7.4,
    notes: 'Moderate stress, relatively sedentary'
  },
  { 
    occupation: 'Artisan / Food Processor', 
    total: 68,
    dmCount: 5,
    htnCount: 5,
    dmPrevalence: 7.4,
    htnPrevalence: 7.4,
    notes: 'Traditional work, moderate activity'
  },
  { 
    occupation: 'Tourism / Hospitality Worker', 
    total: 68,
    dmCount: 3,
    htnCount: 5,
    dmPrevalence: 4.4,
    htnPrevalence: 7.4,
    notes: 'Active work, irregular schedules'
  },
  { 
    occupation: 'Health Worker / Volunteer', 
    total: 68,
    dmCount: 3,
    htnCount: 5,
    dmPrevalence: 4.4,
    htnPrevalence: 7.4,
    notes: 'Health awareness, active lifestyle'
  },
  { 
    occupation: 'Manufacturing Worker', 
    total: 68,
    dmCount: 3,
    htnCount: 5,
    dmPrevalence: 4.4,
    htnPrevalence: 7.4,
    notes: 'Varied activity depending on role'
  },
  { 
    occupation: 'Other', 
    total: 68,
    dmCount: 3,
    htnCount: 5,
    dmPrevalence: 4.4,
    htnPrevalence: 7.4,
    notes: 'Mixed occupations'
  }
];

export const bpCategories = [
  { month: 'May', Normal: 145, Elevated: 68, Stage1: 82, Stage2: 35 },
  { month: 'Jun', Normal: 152, Elevated: 72, Stage1: 78, Stage2: 32 },
  { month: 'Jul', Normal: 168, Elevated: 75, Stage1: 74, Stage2: 28 },
  { month: 'Aug', Normal: 158, Elevated: 71, Stage1: 76, Stage2: 30 },
  { month: 'Sep', Normal: 172, Elevated: 78, Stage1: 72, Stage2: 26 },
  { month: 'Oct', Normal: 185, Elevated: 82, Stage1: 68, Stage2: 24 }
];

// Cohort retention data - tracking patient retention in program
export const cohortRetention = [
  { month: 'Jan 25', enrolled: 45, month6: 42, month12: null },
  { month: 'Feb 25', enrolled: 52, month6: 48, month12: null },
  { month: 'Mar 25', enrolled: 48, month6: 44, month12: null },
  { month: 'Apr 25', enrolled: 56, month6: 51, month12: 47 },
  { month: 'May 25', enrolled: 61, month6: null, month12: 54 },
  { month: 'Jun 25', enrolled: 58, month6: null, month12: 51 },
];

// Medication distribution data
export const medicationDistribution = [
  { medication: 'Amlodipine 5mg', distributed: 542, patients: 580, percent: 93 },
  { medication: 'Losartan 50mg', distributed: 485, patients: 580, percent: 84 },
  { medication: 'Metformin 500mg', distributed: 385, patients: 420, percent: 92 },
  { medication: 'Glimepiride 2mg', distributed: 142, patients: 420, percent: 34 },
  { medication: 'Atorvastatin 20mg', distributed: 245, patients: 1000, percent: 25 }
];

// Age-group disease correlation
export const ageGroupDiseaseCorrelation = [
  { ageGroup: '<30', dmPrevalence: 1.2, htnPrevalence: 1.8, dmCount: 15, htnCount: 22 },
  { ageGroup: '30-39', dmPrevalence: 3.5, htnPrevalence: 5.2, dmCount: 42, htnCount: 64 },
  { ageGroup: '40-49', dmPrevalence: 7.8, htnPrevalence: 9.5, dmCount: 98, htnCount: 124 },
  { ageGroup: '50-59', dmPrevalence: 10.2, htnPrevalence: 13.8, dmCount: 134, htnCount: 182 },
  { ageGroup: '60-69', dmPrevalence: 12.0, htnPrevalence: 16.2, dmCount: 102, htnCount: 138 },
  { ageGroup: '70+', dmPrevalence: 8.5, htnPrevalence: 11.8, dmCount: 29, htnCount: 50 }
];

// BMI distribution - Based on WHO Asian-Pacific cutoffs
export const bmiDistribution = [
  { category: 'Underweight (<18.5)', count: 34, percent: 2.5, color: '#3F5FF1' },
  { category: 'Normal (18.5-22.9)', count: 320, percent: 23.2, color: '#4D6186' },
  { category: 'Overweight (23-24.9)', count: 272, percent: 19.7, color: '#92A4C1' },
  { category: 'Obese I (25-29.9)', count: 524, percent: 38.0, color: '#E6B99B' },
  { category: 'Obese II (≥30)', count: 230, percent: 16.7, color: '#CD5E31' }
];

// BMI by condition
export const bmiByCondition = [
  { 
    condition: 'DM Only',
    avgBMI: 27.2,
    underweight: 8,
    normal: 52,
    overweight: 38,
    obeseI: 82,
    obeseII: 35
  },
  { 
    condition: 'HTN Only',
    avgBMI: 26.8,
    underweight: 12,
    normal: 102,
    overweight: 76,
    obeseI: 142,
    obeseII: 48
  },
  { 
    condition: 'DM + HTN',
    avgBMI: 28.9,
    underweight: 4,
    normal: 48,
    overweight: 42,
    obeseI: 98,
    obeseII: 58
  }
];

// BMI trends over time
export const bmiTrends = [
  { month: 'May', avgBMI: 26.8, obesePercent: 52.1 },
  { month: 'Jun', avgBMI: 26.9, obesePercent: 52.8 },
  { month: 'Jul', avgBMI: 27.1, obesePercent: 53.4 },
  { month: 'Aug', avgBMI: 27.3, obesePercent: 54.2 },
  { month: 'Sep', avgBMI: 27.4, obesePercent: 54.5 },
  { month: 'Oct', avgBMI: 27.5, obesePercent: 54.7 }
];

// BMI distribution for HTN patients only - Based on WHO Asian-Pacific cutoffs
export const bmiDistributionHTN = [
  { category: 'Underweight (<18.5)', count: 16, percent: 2.8, color: '#3F5FF1' },
  { category: 'Normal (18.5-22.9)', count: 150, percent: 25.9, color: '#4D6186' },
  { category: 'Overweight (23-24.9)', count: 118, percent: 20.3, color: '#92A4C1' },
  { category: 'Obese I (25-29.9)', count: 240, percent: 41.4, color: '#E6B99B' },
  { category: 'Obese II (≥30)', count: 56, percent: 9.7, color: '#CD5E31' }
];

// BMI and HTN trend over time
export const bmiHtnTrends = [
  { month: 'May', avgBMI: 26.3, controlledPercent: 66.2, stage1Percent: 22.3, stage2Percent: 11.5 },
  { month: 'Jun', avgBMI: 26.5, controlledPercent: 67.5, stage1Percent: 21.8, stage2Percent: 10.7 },
  { month: 'Jul', avgBMI: 26.6, controlledPercent: 68.4, stage1Percent: 21.2, stage2Percent: 10.4 },
  { month: 'Aug', avgBMI: 26.7, controlledPercent: 69.1, stage1Percent: 20.8, stage2Percent: 10.1 },
  { month: 'Sep', avgBMI: 26.8, controlledPercent: 70.3, stage1Percent: 20.1, stage2Percent: 9.6 },
  { month: 'Oct', avgBMI: 26.8, controlledPercent: 71.0, stage1Percent: 19.5, stage2Percent: 9.5 }
];

// Age distribution of patient registry
export const ageDistribution = [
  { ageGroup: '18-29', count: 48, percent: 7 },
  { ageGroup: '30-39', count: 136, percent: 20 },
  { ageGroup: '40-49', count: 204, percent: 30 },
  { ageGroup: '50-59', count: 170, percent: 25 },
  { ageGroup: '60-69', count: 102, percent: 15 },
  { ageGroup: '70+', count: 20, percent: 3 }
];

export const visits: Visit[] = [
  {
    patientId: 'JAG-000123',
    patientName: 'Ana Reyes',
    barangay: 'Tubod Monte',
    reason: 'Uncontrolled HTN & DM - BP 156/92, HbA1c 8.6%',
    distance: '2.3 km',
    lastBP: '156/92',
    lastHbA1c: '8.6%'
  },
  {
    patientId: 'JAG-000125',
    patientName: 'Maria Cruz',
    barangay: 'Naatang',
    reason: 'Follow-up overdue 12 days - Very high HbA1c 9.8%',
    distance: '5.8 km',
    lastHbA1c: '9.8%'
  },
  {
    patientId: 'JAG-000128',
    patientName: 'Jose Mendoza',
    barangay: 'Tubod Monte',
    reason: 'Follow-up overdue 47 days - HbA1c 8.2%',
    distance: '2.1 km',
    lastHbA1c: '8.2%'
  },
  {
    patientId: 'JAG-000134',
    patientName: 'Emilio Santos',
    barangay: 'Cabungaan',
    reason: 'Uncontrolled HTN & DM - BP 164/98, HbA1c 9.2%',
    distance: '4.5 km',
    lastBP: '164/98',
    lastHbA1c: '9.2%'
  }
];
