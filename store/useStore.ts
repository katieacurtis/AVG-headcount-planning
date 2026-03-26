'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import {
  Site,
  StaffMember,
  HeadcountRequirement,
  RecruitmentRecord,
  RecruitmentStatus,
  Role,
  Team,
  StaffStatus,
} from '@/lib/types';
import {
  SITES,
  INITIAL_STAFF,
  INITIAL_HEADCOUNT_REQUIREMENTS,
  INITIAL_RECRUITMENT,
} from '@/lib/seedData';
import { generateId } from '@/lib/utils';

interface AppStore {
  // ── Data ──────────────────────────────────────────────────────────────────
  sites: Site[];
  staff: StaffMember[];
  requirements: HeadcountRequirement[];
  recruitment: RecruitmentRecord[];

  // ── Staff actions ─────────────────────────────────────────────────────────
  addStaff: (s: Omit<StaffMember, 'id'>) => void;
  updateStaff: (id: string, updates: Partial<StaffMember>) => void;
  deleteStaff: (id: string) => void;

  // ── Requirement actions ───────────────────────────────────────────────────
  updateRequirement: (id: string, updates: Partial<HeadcountRequirement>) => void;
  addRequirement: (r: Omit<HeadcountRequirement, 'id'>) => void;
  deleteRequirement: (id: string) => void;

  // ── Recruitment actions ───────────────────────────────────────────────────
  addRecruitment: (r: Omit<RecruitmentRecord, 'id' | 'createdAt'>) => void;
  updateRecruitment: (id: string, updates: Partial<RecruitmentRecord>) => void;
  deleteRecruitment: (id: string) => void;

  // ── Reset ─────────────────────────────────────────────────────────────────
  resetToDefaults: () => void;
}

export const useStore = create<AppStore>()(
  persist(
    (set) => ({
      sites: SITES,
      staff: INITIAL_STAFF,
      requirements: INITIAL_HEADCOUNT_REQUIREMENTS,
      recruitment: INITIAL_RECRUITMENT,

      // ── Staff ──────────────────────────────────────────────────────────
      addStaff: (s) =>
        set((state) => ({
          staff: [...state.staff, { ...s, id: generateId() }],
        })),

      updateStaff: (id, updates) =>
        set((state) => ({
          staff: state.staff.map((s) => (s.id === id ? { ...s, ...updates } : s)),
        })),

      deleteStaff: (id) =>
        set((state) => ({ staff: state.staff.filter((s) => s.id !== id) })),

      // ── Requirements ───────────────────────────────────────────────────
      updateRequirement: (id, updates) =>
        set((state) => ({
          requirements: state.requirements.map((r) =>
            r.id === id ? { ...r, ...updates } : r
          ),
        })),

      addRequirement: (r) =>
        set((state) => ({
          requirements: [...state.requirements, { ...r, id: generateId() }],
        })),

      deleteRequirement: (id) =>
        set((state) => ({
          requirements: state.requirements.filter((r) => r.id !== id),
        })),

      // ── Recruitment ────────────────────────────────────────────────────
      addRecruitment: (r) =>
        set((state) => ({
          recruitment: [
            ...state.recruitment,
            { ...r, id: generateId(), createdAt: new Date().toISOString().split('T')[0] },
          ],
        })),

      updateRecruitment: (id, updates) =>
        set((state) => ({
          recruitment: state.recruitment.map((r) =>
            r.id === id ? { ...r, ...updates } : r
          ),
        })),

      deleteRecruitment: (id) =>
        set((state) => ({
          recruitment: state.recruitment.filter((r) => r.id !== id),
        })),

      // ── Reset ──────────────────────────────────────────────────────────
      resetToDefaults: () =>
        set({
          sites: SITES,
          staff: INITIAL_STAFF,
          requirements: INITIAL_HEADCOUNT_REQUIREMENTS,
          recruitment: INITIAL_RECRUITMENT,
        }),
    }),
    {
      name: 'avg-headcount-store',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
