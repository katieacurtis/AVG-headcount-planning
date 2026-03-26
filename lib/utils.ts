import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import {
  StaffMember,
  StaffMemberWithComputed,
  EMPLOYER_ONCOST_MULTIPLIER,
  FULL_TIME_HOURS_PER_WEEK,
  HeadcountRequirement,
  DayKey,
  DAY_KEYS,
  Role,
} from './types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function computeStaffMember(s: StaffMember): StaffMemberWithComputed {
  const fte = s.hoursPerWeek / FULL_TIME_HOURS_PER_WEEK;
  const annualCost = s.salary * fte * EMPLOYER_ONCOST_MULTIPLIER;
  return {
    ...s,
    fullName: `${s.firstName} ${s.lastName}`,
    fte,
    annualCost,
    monthlyCost: annualCost / 12,
  };
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatCurrencyFull(value: number): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

// Get actual headcount (FTE) for a site/role/team combination
export function getActualFte(
  staff: StaffMember[],
  siteId: string,
  role: Role,
  team?: string
): number {
  return staff
    .filter(
      (s) =>
        s.status !== 'planned' &&
        s.siteId === siteId &&
        s.role === role &&
        (team === undefined || s.team === team || s.team === 'any')
    )
    .reduce((sum, s) => sum + s.hoursPerWeek / FULL_TIME_HOURS_PER_WEEK, 0);
}

// Get headcount for a specific day from a requirement
export function getRequiredForDay(req: HeadcountRequirement, dayKey: DayKey): number {
  return req[dayKey];
}

// Average required across operating days
export function avgRequired(req: HeadcountRequirement, siteType: '24h' | 'mon-fri'): number {
  if (siteType === '24h') {
    const days: DayKey[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    return days.reduce((s, d) => s + req[d], 0) / 7;
  } else {
    const days: DayKey[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
    return days.reduce((s, d) => s + req[d], 0) / 5;
  }
}

// Maximum required across any day
export function maxRequired(req: HeadcountRequirement, siteType: '24h' | 'mon-fri'): number {
  const days: DayKey[] = siteType === '24h'
    ? ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    : ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
  return Math.max(...days.map((d) => req[d]));
}

export function formatDate(iso: string): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function monthsFromNow(iso: string): number {
  const target = new Date(iso);
  const now = new Date();
  return (
    (target.getFullYear() - now.getFullYear()) * 12 +
    (target.getMonth() - now.getMonth())
  );
}

// Generate array of next N month labels
export function nextMonths(n: number): string[] {
  const result: string[] = [];
  const now = new Date();
  for (let i = 0; i < n; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
    result.push(
      d.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })
    );
  }
  return result;
}

// Check if a staff member is active in a given month
export function isActiveInMonth(staff: StaffMember, year: number, month: number): boolean {
  const start = new Date(staff.startDate);
  const startOk = start.getFullYear() < year || (start.getFullYear() === year && start.getMonth() <= month);
  if (!startOk) return false;
  if (staff.endDate) {
    const end = new Date(staff.endDate);
    const endOk = end.getFullYear() > year || (end.getFullYear() === year && end.getMonth() >= month);
    if (!endOk) return false;
  }
  return staff.status !== 'planned' || (staff.status === 'planned' && staff.startDate !== '');
}

export function generateId(): string {
  return Math.random().toString(36).slice(2, 10);
}
