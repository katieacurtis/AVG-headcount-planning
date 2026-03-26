// ─── Site Types ─────────────────────────────────────────────────────────────

export type SiteType = '24h' | 'mon-fri';

export interface Site {
  id: string;
  name: string;
  type: SiteType;
  color: string; // for charts/badges
}

// ─── Roles ───────────────────────────────────────────────────────────────────

export type Role =
  | 'vet'
  | 'vet_nurse'
  | 'student_vet_nurse'
  | 'animal_nursing_assistant'
  | 'receptionist'
  | 'central_support';

export const ROLE_LABELS: Record<Role, string> = {
  vet: 'Vet',
  vet_nurse: 'Vet Nurse',
  student_vet_nurse: 'Student Vet Nurse',
  animal_nursing_assistant: 'Animal Nursing Assistant',
  receptionist: 'Receptionist',
  central_support: 'Central Support',
};

export const ROLE_ORDER: Role[] = [
  'vet',
  'vet_nurse',
  'student_vet_nurse',
  'animal_nursing_assistant',
  'receptionist',
  'central_support',
];

export type Team = 'day' | 'night' | 'any';

// ─── Staff ───────────────────────────────────────────────────────────────────

export type StaffStatus = 'active' | 'leaving' | 'planned';

export interface StaffMember {
  id: string;
  firstName: string;
  lastName: string;
  role: Role;
  siteId: string; // 'central' for central support team
  team: Team;     // 'day' | 'night' for 24h sites; 'any' otherwise
  salary: number; // annual, full-time equivalent
  hoursPerWeek: number; // contracted hours (e.g. 40 = full-time)
  startDate: string;   // ISO date
  endDate?: string;    // ISO date, if leaving/fixed term
  status: StaffStatus;
  notes?: string;
}

export interface StaffMemberWithComputed extends StaffMember {
  fullName: string;
  annualCost: number;  // includes NI + pension (employer)
  monthlyCost: number;
  fte: number; // full-time equivalent (hoursPerWeek / 40)
}

// ─── Headcount Model ─────────────────────────────────────────────────────────

// Ideal headcount requirements
export interface HeadcountRequirement {
  id: string;
  siteId: string;
  role: Role;
  team: Team; // 'day' | 'night' for 24h sites
  // day-specific requirements (0=Sun,1=Mon,...,6=Sat), null means same all days
  monday: number;
  tuesday: number;
  wednesday: number;
  thursday: number;
  friday: number;
  saturday: number;
  sunday: number;
}

// ─── Recruitment ─────────────────────────────────────────────────────────────

export type RecruitmentStatus =
  | 'planned'
  | 'advertising'
  | 'interviewing'
  | 'offered'
  | 'filled'
  | 'cancelled';

export const RECRUITMENT_STATUS_LABELS: Record<RecruitmentStatus, string> = {
  planned: 'Planned',
  advertising: 'Advertising',
  interviewing: 'Interviewing',
  offered: 'Offer Made',
  filled: 'Filled',
  cancelled: 'Cancelled',
};

export interface RecruitmentRecord {
  id: string;
  role: Role;
  siteId: string;
  team: Team;
  targetStartDate: string; // ISO date
  salaryBudget: number;
  status: RecruitmentStatus;
  linkedStaffId?: string; // set once filled
  notes?: string;
  createdAt: string;
}

// ─── Constants ───────────────────────────────────────────────────────────────

export const WEEKS_HOLIDAY = 7; // including bank holidays
export const WORKING_WEEKS_PER_YEAR = 52 - WEEKS_HOLIDAY; // 45
export const FULL_TIME_HOURS_PER_WEEK = 40;

// Rough employer on-cost multiplier (NI ~13.8%, pension ~5%)
export const EMPLOYER_ONCOST_MULTIPLIER = 1.188;

// Days of week labels
export const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
export const DAY_KEYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'] as const;
export type DayKey = typeof DAY_KEYS[number];
