'use client';

import { useMemo, useState } from 'react';
import { useStore } from '@/store/useStore';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Modal } from '@/components/ui/modal';
import { ROLE_LABELS, ROLE_ORDER, Role, Team, DAY_KEYS, DayKey, HeadcountRequirement } from '@/lib/types';
import { getActualFte, formatCurrency, computeStaffMember } from '@/lib/utils';
import { Moon, Sun, Plus, Pencil, Trash2 } from 'lucide-react';

const DAY_DISPLAY: { key: DayKey; label: string }[] = [
  { key: 'monday', label: 'Mon' },
  { key: 'tuesday', label: 'Tue' },
  { key: 'wednesday', label: 'Wed' },
  { key: 'thursday', label: 'Thu' },
  { key: 'friday', label: 'Fri' },
  { key: 'saturday', label: 'Sat' },
  { key: 'sunday', label: 'Sun' },
];

function GapBadge({ actual, required }: { actual: number; required: number }) {
  if (actual >= required) return <Badge variant="success">{actual} / {required}</Badge>;
  if (actual >= required * 0.8) return <Badge variant="warning">{actual} / {required}</Badge>;
  return <Badge variant="danger">{actual} / {required}</Badge>;
}

interface ReqFormData {
  role: Role;
  team: Team;
  monday: number; tuesday: number; wednesday: number; thursday: number;
  friday: number; saturday: number; sunday: number;
}

const DEFAULT_FORM: ReqFormData = {
  role: 'vet', team: 'any',
  monday: 1, tuesday: 1, wednesday: 1, thursday: 1, friday: 1, saturday: 0, sunday: 0,
};

export default function PlanningPage() {
  const { sites, requirements, staff, addRequirement, updateRequirement, deleteRequirement } = useStore();
  const [selectedSiteId, setSelectedSiteId] = useState(sites[0]?.id ?? '');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ReqFormData>(DEFAULT_FORM);

  const selectedSite = sites.find((s) => s.id === selectedSiteId);
  const siteRequirements = requirements.filter((r) => r.siteId === selectedSiteId);

  const activeStaff = useMemo(() => staff.filter((s) => s.status !== 'planned'), [staff]);

  const openAdd = () => {
    setEditingId(null);
    setForm({ ...DEFAULT_FORM, team: selectedSite?.type === '24h' ? 'day' : 'any' });
    setModalOpen(true);
  };

  const openEdit = (req: HeadcountRequirement) => {
    setEditingId(req.id);
    setForm({
      role: req.role,
      team: req.team,
      monday: req.monday,
      tuesday: req.tuesday,
      wednesday: req.wednesday,
      thursday: req.thursday,
      friday: req.friday,
      saturday: req.saturday,
      sunday: req.sunday,
    });
    setModalOpen(true);
  };

  const handleSave = () => {
    if (editingId) {
      updateRequirement(editingId, { ...form, siteId: selectedSiteId });
    } else {
      addRequirement({ ...form, siteId: selectedSiteId });
    }
    setModalOpen(false);
  };

  const dayField = (key: DayKey) => (
    <input
      type="number"
      min={0}
      max={20}
      value={form[key]}
      onChange={(e) => setForm((f) => ({ ...f, [key]: Number(e.target.value) }))}
      className="w-14 rounded border border-slate-300 px-2 py-1 text-sm text-center"
    />
  );

  // Group by role then team
  const groupedReqs = useMemo(() => {
    const map = new Map<string, HeadcountRequirement[]>();
    for (const role of ROLE_ORDER) {
      const roleReqs = siteRequirements.filter((r) => r.role === role);
      if (roleReqs.length > 0) map.set(role, roleReqs);
    }
    return map;
  }, [siteRequirements]);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Headcount Planning</h1>
          <p className="text-sm text-slate-500 mt-0.5">Model ideal requirements and compare with actual staffing</p>
        </div>
        <div className="flex items-center gap-3">
          <Select
            value={selectedSiteId}
            onChange={(e) => setSelectedSiteId(e.target.value)}
          >
            {sites.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </Select>
          <Button variant="primary" onClick={openAdd}>
            <Plus className="w-4 h-4" /> Add Requirement
          </Button>
        </div>
      </div>

      {selectedSite && (
        <div className="flex items-center gap-3 text-sm text-slate-600">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: selectedSite.color }} />
          <span className="font-medium">{selectedSite.name}</span>
          <Badge variant={selectedSite.type === '24h' ? 'info' : 'default'}>
            {selectedSite.type === '24h' ? '24h · Day & Night · 7 days' : 'Mon–Fri only'}
          </Badge>
        </div>
      )}

      {groupedReqs.size === 0 ? (
        <Card>
          <CardContent>
            <p className="text-sm text-slate-500 py-4">No headcount requirements defined for this site. Click "Add Requirement" to get started.</p>
          </CardContent>
        </Card>
      ) : (
        Array.from(groupedReqs.entries()).map(([role, reqs]) => (
          <Card key={role}>
            <CardHeader>
              <CardTitle>{ROLE_LABELS[role as Role]}</CardTitle>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    <th className="px-6 py-2.5 text-left text-xs font-medium text-slate-500 w-28">Team</th>
                    {DAY_DISPLAY.map(({ key, label }) => {
                      const isWeekend = key === 'saturday' || key === 'sunday';
                      return (
                        <th key={key} className={`px-3 py-2.5 text-center text-xs font-medium ${isWeekend ? 'text-indigo-400' : 'text-slate-500'}`}>
                          {label}
                          {isWeekend && <span className="ml-0.5 text-indigo-300">*</span>}
                        </th>
                      );
                    })}
                    <th className="px-6 py-2.5 text-left text-xs font-medium text-slate-500">Actual FTE</th>
                    <th className="px-2 py-2.5" />
                  </tr>
                </thead>
                <tbody>
                  {reqs.map((req) => {
                    const actual = getActualFte(activeStaff, req.siteId, req.role, req.team);
                    const actualRounded = Math.round(actual * 10) / 10;
                    const peakRequired = Math.max(
                      req.monday, req.tuesday, req.wednesday, req.thursday, req.friday,
                      ...(selectedSite?.type === '24h' ? [req.saturday, req.sunday] : [])
                    );
                    return (
                      <tr key={req.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-3">
                          <div className="flex items-center gap-1.5">
                            {req.team === 'day' && <Sun className="w-3.5 h-3.5 text-amber-500" />}
                            {req.team === 'night' && <Moon className="w-3.5 h-3.5 text-indigo-400" />}
                            <span className="capitalize font-medium text-slate-700">{req.team}</span>
                          </div>
                        </td>
                        {DAY_DISPLAY.map(({ key }) => {
                          const val = req[key];
                          const isWeekend = key === 'saturday' || key === 'sunday';
                          const inactive = isWeekend && selectedSite?.type === 'mon-fri';
                          return (
                            <td key={key} className={`px-3 py-3 text-center ${inactive ? 'text-slate-300' : 'text-slate-700 font-medium'}`}>
                              {inactive ? '—' : val}
                            </td>
                          );
                        })}
                        <td className="px-6 py-3">
                          <GapBadge actual={actualRounded} required={peakRequired} />
                        </td>
                        <td className="px-2 py-3">
                          <div className="flex items-center gap-1">
                            <button onClick={() => openEdit(req)} className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-700">
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={() => deleteRequirement(req.id)} className="p-1 rounded hover:bg-red-50 text-slate-400 hover:text-red-500">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </CardContent>
          </Card>
        ))
      )}

      <div className="text-xs text-slate-400">
        * Weekend columns apply to 24h sites only. FTE = Full-Time Equivalent (40h/week = 1.0 FTE).
        Green = at/above requirement, Amber = within 80%, Red = below 80%.
      </div>

      {/* Add/Edit Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? 'Edit Requirement' : 'Add Headcount Requirement'}
      >
        <div className="space-y-4">
          <Select
            label="Role"
            value={form.role}
            onChange={(e) => setForm((f) => ({ ...f, role: e.target.value as Role }))}
          >
            {ROLE_ORDER.map((r) => (
              <option key={r} value={r}>{ROLE_LABELS[r]}</option>
            ))}
          </Select>

          {selectedSite?.type === '24h' && (
            <Select
              label="Team"
              value={form.team}
              onChange={(e) => setForm((f) => ({ ...f, team: e.target.value as Team }))}
            >
              <option value="day">Day</option>
              <option value="night">Night</option>
              <option value="any">Any / Flexible</option>
            </Select>
          )}

          <div>
            <p className="text-xs font-medium text-slate-600 mb-2">Required headcount by day</p>
            <div className="grid grid-cols-7 gap-2">
              {DAY_DISPLAY.map(({ key, label }) => (
                <div key={key} className="flex flex-col items-center gap-1">
                  <span className="text-xs text-slate-500">{label}</span>
                  {dayField(key)}
                </div>
              ))}
            </div>
            <p className="text-xs text-slate-400 mt-2">Set 0 for days the site is closed.</p>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleSave}>{editingId ? 'Save Changes' : 'Add'}</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
