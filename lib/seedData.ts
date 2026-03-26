import { Site, StaffMember, HeadcountRequirement, RecruitmentRecord } from './types';

export const SITES: Site[] = [
  { id: 'north', name: 'North Clinic', type: '24h', color: '#6366f1' },
  { id: 'south', name: 'South Hospital', type: '24h', color: '#8b5cf6' },
  { id: 'east', name: 'East Practice', type: 'mon-fri', color: '#10b981' },
  { id: 'west', name: 'West Practice', type: 'mon-fri', color: '#f59e0b' },
  { id: 'central_clinic', name: 'Central Clinic', type: 'mon-fri', color: '#ef4444' },
  { id: 'riverside', name: 'Riverside Practice', type: 'mon-fri', color: '#0ea5e9' },
  { id: 'meadow', name: 'Meadow Practice', type: 'mon-fri', color: '#84cc16' },
  { id: 'central', name: 'Central Support', type: 'mon-fri', color: '#94a3b8' },
];

export const INITIAL_STAFF: StaffMember[] = [
  // ── North (24h) – Day Team ──────────────────────────────────────────────
  { id: 's001', firstName: 'Dr Sarah', lastName: 'Mitchell', role: 'vet', siteId: 'north', team: 'day', salary: 65000, hoursPerWeek: 40, startDate: '2021-03-01', status: 'active' },
  { id: 's002', firstName: 'Dr James', lastName: 'Harper', role: 'vet', siteId: 'north', team: 'day', salary: 60000, hoursPerWeek: 40, startDate: '2022-06-01', status: 'active' },
  { id: 's003', firstName: 'Dr Priya', lastName: 'Patel', role: 'vet', siteId: 'north', team: 'day', salary: 58000, hoursPerWeek: 32, startDate: '2023-01-01', status: 'active' },
  { id: 's004', firstName: 'Emma', lastName: 'Clarke', role: 'vet_nurse', siteId: 'north', team: 'day', salary: 32000, hoursPerWeek: 40, startDate: '2020-09-01', status: 'active' },
  { id: 's005', firstName: 'Liam', lastName: 'Turner', role: 'vet_nurse', siteId: 'north', team: 'day', salary: 30000, hoursPerWeek: 40, startDate: '2021-11-01', status: 'active' },
  { id: 's006', firstName: 'Sophie', lastName: 'Reed', role: 'vet_nurse', siteId: 'north', team: 'day', salary: 31000, hoursPerWeek: 32, startDate: '2022-04-01', status: 'active' },
  { id: 's007', firstName: 'Chloe', lastName: 'Evans', role: 'student_vet_nurse', siteId: 'north', team: 'day', salary: 22000, hoursPerWeek: 40, startDate: '2023-09-01', status: 'active' },
  { id: 's008', firstName: 'Raj', lastName: 'Singh', role: 'animal_nursing_assistant', siteId: 'north', team: 'day', salary: 24000, hoursPerWeek: 40, startDate: '2022-02-01', status: 'active' },
  { id: 's009', firstName: 'Amy', lastName: 'Jones', role: 'receptionist', siteId: 'north', team: 'day', salary: 26000, hoursPerWeek: 40, startDate: '2021-07-01', status: 'active' },
  { id: 's010', firstName: 'Ben', lastName: 'White', role: 'receptionist', siteId: 'north', team: 'day', salary: 25000, hoursPerWeek: 24, startDate: '2022-10-01', status: 'active' },

  // ── North (24h) – Night Team ────────────────────────────────────────────
  { id: 's011', firstName: 'Dr Tom', lastName: 'Knight', role: 'vet', siteId: 'north', team: 'night', salary: 72000, hoursPerWeek: 40, startDate: '2020-06-01', status: 'active' },
  { id: 's012', firstName: 'Dr Zoe', lastName: 'Adams', role: 'vet', siteId: 'north', team: 'night', salary: 68000, hoursPerWeek: 40, startDate: '2021-09-01', status: 'active', endDate: '2026-06-30', notes: 'Relocating abroad' },
  { id: 's013', firstName: 'Dan', lastName: 'Brown', role: 'vet_nurse', siteId: 'north', team: 'night', salary: 34000, hoursPerWeek: 40, startDate: '2020-01-01', status: 'active' },
  { id: 's014', firstName: 'Mia', lastName: 'Taylor', role: 'vet_nurse', siteId: 'north', team: 'night', salary: 33000, hoursPerWeek: 40, startDate: '2022-03-01', status: 'active' },
  { id: 's015', firstName: 'Jack', lastName: 'Wilson', role: 'animal_nursing_assistant', siteId: 'north', team: 'night', salary: 25000, hoursPerWeek: 40, startDate: '2023-01-01', status: 'active' },

  // ── South (24h) – Day Team ──────────────────────────────────────────────
  { id: 's016', firstName: 'Dr Hannah', lastName: 'Moore', role: 'vet', siteId: 'south', team: 'day', salary: 70000, hoursPerWeek: 40, startDate: '2019-05-01', status: 'active' },
  { id: 's017', firstName: 'Dr Luke', lastName: 'Davis', role: 'vet', siteId: 'south', team: 'day', salary: 62000, hoursPerWeek: 40, startDate: '2022-01-01', status: 'active' },
  { id: 's018', firstName: 'Dr Aisha', lastName: 'Khan', role: 'vet', siteId: 'south', team: 'day', salary: 59000, hoursPerWeek: 40, startDate: '2023-06-01', status: 'active' },
  { id: 's019', firstName: 'Grace', lastName: 'Hill', role: 'vet_nurse', siteId: 'south', team: 'day', salary: 32000, hoursPerWeek: 40, startDate: '2021-02-01', status: 'active' },
  { id: 's020', firstName: 'Noah', lastName: 'Young', role: 'vet_nurse', siteId: 'south', team: 'day', salary: 31000, hoursPerWeek: 32, startDate: '2022-08-01', status: 'active' },
  { id: 's021', firstName: 'Lily', lastName: 'Scott', role: 'student_vet_nurse', siteId: 'south', team: 'day', salary: 22000, hoursPerWeek: 40, startDate: '2024-09-01', status: 'active' },
  { id: 's022', firstName: 'Owen', lastName: 'Martin', role: 'animal_nursing_assistant', siteId: 'south', team: 'day', salary: 24000, hoursPerWeek: 40, startDate: '2022-05-01', status: 'active' },
  { id: 's023', firstName: 'Ella', lastName: 'Lewis', role: 'receptionist', siteId: 'south', team: 'day', salary: 26000, hoursPerWeek: 40, startDate: '2020-11-01', status: 'active' },
  { id: 's024', firstName: 'Finn', lastName: 'Walker', role: 'receptionist', siteId: 'south', team: 'day', salary: 25500, hoursPerWeek: 40, startDate: '2021-04-01', status: 'active' },

  // ── South (24h) – Night Team ────────────────────────────────────────────
  { id: 's025', firstName: 'Dr Maya', lastName: 'Roberts', role: 'vet', siteId: 'south', team: 'night', salary: 74000, hoursPerWeek: 40, startDate: '2019-09-01', status: 'active' },
  { id: 's026', firstName: 'Dr Sam', lastName: 'Green', role: 'vet', siteId: 'south', team: 'night', salary: 70000, hoursPerWeek: 40, startDate: '2021-01-01', status: 'active' },
  { id: 's027', firstName: 'Isla', lastName: 'Baker', role: 'vet_nurse', siteId: 'south', team: 'night', salary: 34000, hoursPerWeek: 40, startDate: '2020-07-01', status: 'active' },
  { id: 's028', firstName: 'Ethan', lastName: 'Hall', role: 'vet_nurse', siteId: 'south', team: 'night', salary: 33500, hoursPerWeek: 40, startDate: '2022-11-01', status: 'active' },
  { id: 's029', firstName: 'Ruby', lastName: 'Allen', role: 'animal_nursing_assistant', siteId: 'south', team: 'night', salary: 25000, hoursPerWeek: 40, startDate: '2023-03-01', status: 'active' },

  // ── East Practice (Mon-Fri) ─────────────────────────────────────────────
  { id: 's030', firstName: 'Dr Oliver', lastName: 'Carter', role: 'vet', siteId: 'east', team: 'any', salary: 58000, hoursPerWeek: 40, startDate: '2020-03-01', status: 'active' },
  { id: 's031', firstName: 'Dr Ava', lastName: 'Phillips', role: 'vet', siteId: 'east', team: 'any', salary: 55000, hoursPerWeek: 32, startDate: '2022-09-01', status: 'active' },
  { id: 's032', firstName: 'Charlotte', lastName: 'Campbell', role: 'vet_nurse', siteId: 'east', team: 'any', salary: 30000, hoursPerWeek: 40, startDate: '2021-05-01', status: 'active' },
  { id: 's033', firstName: 'George', lastName: 'Mitchell', role: 'vet_nurse', siteId: 'east', team: 'any', salary: 29000, hoursPerWeek: 40, startDate: '2023-02-01', status: 'active' },
  { id: 's034', firstName: 'Amelia', lastName: 'Roberts', role: 'student_vet_nurse', siteId: 'east', team: 'any', salary: 21000, hoursPerWeek: 40, startDate: '2024-09-01', status: 'active' },
  { id: 's035', firstName: 'Harry', lastName: 'Turner', role: 'animal_nursing_assistant', siteId: 'east', team: 'any', salary: 23000, hoursPerWeek: 40, startDate: '2022-06-01', status: 'active' },
  { id: 's036', firstName: 'Freya', lastName: 'Wood', role: 'receptionist', siteId: 'east', team: 'any', salary: 25000, hoursPerWeek: 40, startDate: '2021-09-01', status: 'active' },

  // ── West Practice (Mon-Fri) ─────────────────────────────────────────────
  { id: 's037', firstName: 'Dr Poppy', lastName: 'Hughes', role: 'vet', siteId: 'west', team: 'any', salary: 59000, hoursPerWeek: 40, startDate: '2021-01-01', status: 'active' },
  { id: 's038', firstName: 'Dr Archie', lastName: 'Cox', role: 'vet', siteId: 'west', team: 'any', salary: 56000, hoursPerWeek: 40, startDate: '2022-04-01', status: 'active' },
  { id: 's039', firstName: 'Daisy', lastName: 'Ward', role: 'vet_nurse', siteId: 'west', team: 'any', salary: 30000, hoursPerWeek: 40, startDate: '2021-06-01', status: 'active' },
  { id: 's040', firstName: 'Toby', lastName: 'Richardson', role: 'vet_nurse', siteId: 'west', team: 'any', salary: 29500, hoursPerWeek: 32, startDate: '2023-03-01', status: 'active' },
  { id: 's041', firstName: 'Alice', lastName: 'Watson', role: 'animal_nursing_assistant', siteId: 'west', team: 'any', salary: 23000, hoursPerWeek: 40, startDate: '2022-08-01', status: 'active' },
  { id: 's042', firstName: 'Charlie', lastName: 'Brooks', role: 'receptionist', siteId: 'west', team: 'any', salary: 25000, hoursPerWeek: 40, startDate: '2020-10-01', status: 'active' },

  // ── Central Clinic (Mon-Fri) ────────────────────────────────────────────
  { id: 's043', firstName: 'Dr Isabel', lastName: 'Price', role: 'vet', siteId: 'central_clinic', team: 'any', salary: 60000, hoursPerWeek: 40, startDate: '2020-06-01', status: 'active' },
  { id: 's044', firstName: 'Dr Ryan', lastName: 'Bennett', role: 'vet', siteId: 'central_clinic', team: 'any', salary: 57000, hoursPerWeek: 40, startDate: '2022-02-01', status: 'active', endDate: '2026-05-31', notes: 'Moving to a hospital role' },
  { id: 's045', firstName: 'Rosie', lastName: 'Morgan', role: 'vet_nurse', siteId: 'central_clinic', team: 'any', salary: 31000, hoursPerWeek: 40, startDate: '2021-04-01', status: 'active' },
  { id: 's046', firstName: 'Jake', lastName: 'Coleman', role: 'vet_nurse', siteId: 'central_clinic', team: 'any', salary: 29000, hoursPerWeek: 40, startDate: '2023-07-01', status: 'active' },
  { id: 's047', firstName: 'Millie', lastName: 'Fisher', role: 'animal_nursing_assistant', siteId: 'central_clinic', team: 'any', salary: 23000, hoursPerWeek: 40, startDate: '2022-09-01', status: 'active' },
  { id: 's048', firstName: 'Alfie', lastName: 'Stone', role: 'receptionist', siteId: 'central_clinic', team: 'any', salary: 25500, hoursPerWeek: 40, startDate: '2021-11-01', status: 'active' },

  // ── Riverside (Mon-Fri) ─────────────────────────────────────────────────
  { id: 's049', firstName: 'Dr Violet', lastName: 'James', role: 'vet', siteId: 'riverside', team: 'any', salary: 57000, hoursPerWeek: 40, startDate: '2022-05-01', status: 'active' },
  { id: 's050', firstName: 'Dr Felix', lastName: 'Lawson', role: 'vet', siteId: 'riverside', team: 'any', salary: 54000, hoursPerWeek: 40, startDate: '2023-01-01', status: 'active' },
  { id: 's051', firstName: 'Penelope', lastName: 'Sanders', role: 'vet_nurse', siteId: 'riverside', team: 'any', salary: 30000, hoursPerWeek: 40, startDate: '2022-06-01', status: 'active' },
  { id: 's052', firstName: 'Max', lastName: 'Griffin', role: 'animal_nursing_assistant', siteId: 'riverside', team: 'any', salary: 23000, hoursPerWeek: 40, startDate: '2023-04-01', status: 'active' },
  { id: 's053', firstName: 'Eva', lastName: 'Howard', role: 'receptionist', siteId: 'riverside', team: 'any', salary: 25000, hoursPerWeek: 40, startDate: '2022-09-01', status: 'active' },

  // ── Meadow (Mon-Fri) ────────────────────────────────────────────────────
  { id: 's054', firstName: 'Dr Leo', lastName: 'Bailey', role: 'vet', siteId: 'meadow', team: 'any', salary: 56000, hoursPerWeek: 40, startDate: '2023-03-01', status: 'active' },
  { id: 's055', firstName: 'Dr Nora', lastName: 'Reid', role: 'vet', siteId: 'meadow', team: 'any', salary: 53000, hoursPerWeek: 32, startDate: '2024-01-01', status: 'active' },
  { id: 's056', firstName: 'Jasper', lastName: 'Dixon', role: 'vet_nurse', siteId: 'meadow', team: 'any', salary: 29000, hoursPerWeek: 40, startDate: '2023-05-01', status: 'active' },
  { id: 's057', firstName: 'Harriet', lastName: 'Fox', role: 'animal_nursing_assistant', siteId: 'meadow', team: 'any', salary: 22500, hoursPerWeek: 40, startDate: '2024-02-01', status: 'active' },
  { id: 's058', firstName: 'Spencer', lastName: 'Murray', role: 'receptionist', siteId: 'meadow', team: 'any', salary: 24500, hoursPerWeek: 40, startDate: '2023-08-01', status: 'active' },

  // ── Central Support ─────────────────────────────────────────────────────
  { id: 's059', firstName: 'Victoria', lastName: 'Shaw', role: 'central_support', siteId: 'central', team: 'any', salary: 45000, hoursPerWeek: 40, startDate: '2019-01-01', status: 'active', notes: 'Head of Operations' },
  { id: 's060', firstName: 'Nathan', lastName: 'Cole', role: 'central_support', siteId: 'central', team: 'any', salary: 38000, hoursPerWeek: 40, startDate: '2020-04-01', status: 'active', notes: 'HR Manager' },
  { id: 's061', firstName: 'Diana', lastName: 'Grant', role: 'central_support', siteId: 'central', team: 'any', salary: 40000, hoursPerWeek: 40, startDate: '2021-06-01', status: 'active', notes: 'Finance Manager' },
  { id: 's062', firstName: 'Marcus', lastName: 'Bell', role: 'central_support', siteId: 'central', team: 'any', salary: 35000, hoursPerWeek: 40, startDate: '2022-02-01', status: 'active', notes: 'IT & Systems' },
  { id: 's063', firstName: 'Serena', lastName: 'Fox', role: 'central_support', siteId: 'central', team: 'any', salary: 33000, hoursPerWeek: 32, startDate: '2023-01-01', status: 'active', notes: 'Marketing' },
];

export const INITIAL_HEADCOUNT_REQUIREMENTS: HeadcountRequirement[] = [
  // ── North 24h – Day ──────────────────────────────────────────────────────
  { id: 'r001', siteId: 'north', role: 'vet', team: 'day', monday: 3, tuesday: 3, wednesday: 3, thursday: 3, friday: 3, saturday: 2, sunday: 2 },
  { id: 'r002', siteId: 'north', role: 'vet_nurse', team: 'day', monday: 3, tuesday: 3, wednesday: 3, thursday: 3, friday: 3, saturday: 2, sunday: 2 },
  { id: 'r003', siteId: 'north', role: 'student_vet_nurse', team: 'day', monday: 1, tuesday: 1, wednesday: 1, thursday: 1, friday: 1, saturday: 1, sunday: 1 },
  { id: 'r004', siteId: 'north', role: 'animal_nursing_assistant', team: 'day', monday: 1, tuesday: 1, wednesday: 1, thursday: 1, friday: 1, saturday: 1, sunday: 1 },
  { id: 'r005', siteId: 'north', role: 'receptionist', team: 'day', monday: 2, tuesday: 2, wednesday: 2, thursday: 2, friday: 2, saturday: 1, sunday: 1 },
  // ── North 24h – Night ────────────────────────────────────────────────────
  { id: 'r006', siteId: 'north', role: 'vet', team: 'night', monday: 2, tuesday: 2, wednesday: 2, thursday: 2, friday: 2, saturday: 2, sunday: 2 },
  { id: 'r007', siteId: 'north', role: 'vet_nurse', team: 'night', monday: 2, tuesday: 2, wednesday: 2, thursday: 2, friday: 2, saturday: 2, sunday: 2 },
  { id: 'r008', siteId: 'north', role: 'animal_nursing_assistant', team: 'night', monday: 1, tuesday: 1, wednesday: 1, thursday: 1, friday: 1, saturday: 1, sunday: 1 },

  // ── South 24h – Day ──────────────────────────────────────────────────────
  { id: 'r009', siteId: 'south', role: 'vet', team: 'day', monday: 3, tuesday: 3, wednesday: 3, thursday: 3, friday: 3, saturday: 2, sunday: 2 },
  { id: 'r010', siteId: 'south', role: 'vet_nurse', team: 'day', monday: 3, tuesday: 3, wednesday: 3, thursday: 3, friday: 3, saturday: 2, sunday: 2 },
  { id: 'r011', siteId: 'south', role: 'student_vet_nurse', team: 'day', monday: 1, tuesday: 1, wednesday: 1, thursday: 1, friday: 1, saturday: 0, sunday: 0 },
  { id: 'r012', siteId: 'south', role: 'animal_nursing_assistant', team: 'day', monday: 1, tuesday: 1, wednesday: 1, thursday: 1, friday: 1, saturday: 1, sunday: 1 },
  { id: 'r013', siteId: 'south', role: 'receptionist', team: 'day', monday: 2, tuesday: 2, wednesday: 2, thursday: 2, friday: 2, saturday: 1, sunday: 1 },
  // ── South 24h – Night ────────────────────────────────────────────────────
  { id: 'r014', siteId: 'south', role: 'vet', team: 'night', monday: 2, tuesday: 2, wednesday: 2, thursday: 2, friday: 2, saturday: 2, sunday: 2 },
  { id: 'r015', siteId: 'south', role: 'vet_nurse', team: 'night', monday: 2, tuesday: 2, wednesday: 2, thursday: 2, friday: 2, saturday: 2, sunday: 2 },
  { id: 'r016', siteId: 'south', role: 'animal_nursing_assistant', team: 'night', monday: 1, tuesday: 1, wednesday: 1, thursday: 1, friday: 1, saturday: 1, sunday: 1 },

  // ── East (Mon-Fri) ───────────────────────────────────────────────────────
  { id: 'r017', siteId: 'east', role: 'vet', team: 'any', monday: 2, tuesday: 2, wednesday: 2, thursday: 2, friday: 2, saturday: 0, sunday: 0 },
  { id: 'r018', siteId: 'east', role: 'vet_nurse', team: 'any', monday: 2, tuesday: 2, wednesday: 2, thursday: 2, friday: 2, saturday: 0, sunday: 0 },
  { id: 'r019', siteId: 'east', role: 'student_vet_nurse', team: 'any', monday: 1, tuesday: 1, wednesday: 1, thursday: 1, friday: 1, saturday: 0, sunday: 0 },
  { id: 'r020', siteId: 'east', role: 'animal_nursing_assistant', team: 'any', monday: 1, tuesday: 1, wednesday: 1, thursday: 1, friday: 1, saturday: 0, sunday: 0 },
  { id: 'r021', siteId: 'east', role: 'receptionist', team: 'any', monday: 1, tuesday: 1, wednesday: 1, thursday: 1, friday: 1, saturday: 0, sunday: 0 },

  // ── West (Mon-Fri) ───────────────────────────────────────────────────────
  { id: 'r022', siteId: 'west', role: 'vet', team: 'any', monday: 2, tuesday: 2, wednesday: 2, thursday: 2, friday: 2, saturday: 0, sunday: 0 },
  { id: 'r023', siteId: 'west', role: 'vet_nurse', team: 'any', monday: 2, tuesday: 2, wednesday: 2, thursday: 2, friday: 2, saturday: 0, sunday: 0 },
  { id: 'r024', siteId: 'west', role: 'animal_nursing_assistant', team: 'any', monday: 1, tuesday: 1, wednesday: 1, thursday: 1, friday: 1, saturday: 0, sunday: 0 },
  { id: 'r025', siteId: 'west', role: 'receptionist', team: 'any', monday: 1, tuesday: 1, wednesday: 1, thursday: 1, friday: 1, saturday: 0, sunday: 0 },

  // ── Central Clinic (Mon-Fri) ─────────────────────────────────────────────
  { id: 'r026', siteId: 'central_clinic', role: 'vet', team: 'any', monday: 2, tuesday: 2, wednesday: 2, thursday: 2, friday: 2, saturday: 0, sunday: 0 },
  { id: 'r027', siteId: 'central_clinic', role: 'vet_nurse', team: 'any', monday: 2, tuesday: 2, wednesday: 2, thursday: 2, friday: 2, saturday: 0, sunday: 0 },
  { id: 'r028', siteId: 'central_clinic', role: 'animal_nursing_assistant', team: 'any', monday: 1, tuesday: 1, wednesday: 1, thursday: 1, friday: 1, saturday: 0, sunday: 0 },
  { id: 'r029', siteId: 'central_clinic', role: 'receptionist', team: 'any', monday: 1, tuesday: 1, wednesday: 1, thursday: 1, friday: 1, saturday: 0, sunday: 0 },

  // ── Riverside (Mon-Fri) ──────────────────────────────────────────────────
  { id: 'r030', siteId: 'riverside', role: 'vet', team: 'any', monday: 2, tuesday: 2, wednesday: 2, thursday: 2, friday: 2, saturday: 0, sunday: 0 },
  { id: 'r031', siteId: 'riverside', role: 'vet_nurse', team: 'any', monday: 1, tuesday: 1, wednesday: 1, thursday: 1, friday: 1, saturday: 0, sunday: 0 },
  { id: 'r032', siteId: 'riverside', role: 'animal_nursing_assistant', team: 'any', monday: 1, tuesday: 1, wednesday: 1, thursday: 1, friday: 1, saturday: 0, sunday: 0 },
  { id: 'r033', siteId: 'riverside', role: 'receptionist', team: 'any', monday: 1, tuesday: 1, wednesday: 1, thursday: 1, friday: 1, saturday: 0, sunday: 0 },

  // ── Meadow (Mon-Fri) ─────────────────────────────────────────────────────
  { id: 'r034', siteId: 'meadow', role: 'vet', team: 'any', monday: 2, tuesday: 2, wednesday: 2, thursday: 2, friday: 2, saturday: 0, sunday: 0 },
  { id: 'r035', siteId: 'meadow', role: 'vet_nurse', team: 'any', monday: 1, tuesday: 1, wednesday: 1, thursday: 1, friday: 1, saturday: 0, sunday: 0 },
  { id: 'r036', siteId: 'meadow', role: 'animal_nursing_assistant', team: 'any', monday: 1, tuesday: 1, wednesday: 1, thursday: 1, friday: 1, saturday: 0, sunday: 0 },
  { id: 'r037', siteId: 'meadow', role: 'receptionist', team: 'any', monday: 1, tuesday: 1, wednesday: 1, thursday: 1, friday: 1, saturday: 0, sunday: 0 },
];

export const INITIAL_RECRUITMENT: RecruitmentRecord[] = [
  {
    id: 'rec001',
    role: 'vet',
    siteId: 'north',
    team: 'night',
    targetStartDate: '2026-08-01',
    salaryBudget: 70000,
    status: 'advertising',
    notes: 'Replacing Dr Zoe Adams who is leaving in June 2026',
    createdAt: '2026-03-01',
  },
  {
    id: 'rec002',
    role: 'vet',
    siteId: 'central_clinic',
    team: 'any',
    targetStartDate: '2026-07-01',
    salaryBudget: 60000,
    status: 'interviewing',
    notes: 'Replacing Dr Ryan Bennett',
    createdAt: '2026-02-15',
  },
  {
    id: 'rec003',
    role: 'vet_nurse',
    siteId: 'riverside',
    team: 'any',
    targetStartDate: '2026-05-01',
    salaryBudget: 30000,
    status: 'planned',
    notes: 'New position to meet growing demand',
    createdAt: '2026-03-10',
  },
];
