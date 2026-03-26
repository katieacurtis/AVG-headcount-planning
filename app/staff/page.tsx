'use client';

import { useMemo, useState } from 'react';
import { useStore } from '@/store/useStore';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Modal } from '@/components/ui/modal';
import { ROLE_LABELS, ROLE_ORDER, Role, Team, StaffStatus, StaffMember } from '@/lib/types';
import { computeStaffMember, formatCurrency, formatDate } from '@/lib/utils';
import { Plus, Pencil, Trash2, Moon, Sun, Search } from 'lucide-react';

interface StaffFormData {
  firstName: string;
  lastName: string;
  role: Role;
  siteId: string;
  team: Team;
  salary: number;
  hoursPerWeek: number;
  startDate: string;
  endDate: string;
  status: StaffStatus;
  notes: string;
}

const emptyForm = (siteId: string): StaffFormData => ({
  firstName: '', lastName: '', role: 'vet', siteId,
  team: 'any', salary: 45000, hoursPerWeek: 40,
  startDate: new Date().toISOString().split('T')[0],
  endDate: '', status: 'active', notes: '',
});

const STATUS_COLORS: Record<StaffStatus, 'success' | 'warning' | 'info'> = {
  active: 'success', leaving: 'warning', planned: 'info',
};

export default function StaffPage() {
  const { sites, staff, addStaff, updateStaff, deleteStaff } = useStore();
  const [filterSite, setFilterSite] = useState('all');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<StaffFormData>(emptyForm(sites[0]?.id ?? ''));
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const computed = useMemo(() => staff.map(computeStaffMember), [staff]);

  const filtered = useMemo(() => {
    return computed.filter((s) => {
      if (filterSite !== 'all' && s.siteId !== filterSite) return false;
      if (filterRole !== 'all' && s.role !== filterRole) return false;
      if (filterStatus !== 'all' && s.status !== filterStatus) return false;
      if (search && !s.fullName.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [computed, filterSite, filterRole, filterStatus, search]);

  const totalPayroll = filtered.filter(s => s.status !== 'planned').reduce((sum, s) => sum + s.monthlyCost, 0);
  const totalFte = filtered.filter(s => s.status !== 'planned').reduce((sum, s) => sum + s.fte, 0);

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm(filterSite !== 'all' ? filterSite : (sites[0]?.id ?? '')));
    setModalOpen(true);
  };

  const openEdit = (s: typeof computed[0]) => {
    setEditingId(s.id);
    setForm({
      firstName: s.firstName, lastName: s.lastName, role: s.role,
      siteId: s.siteId, team: s.team, salary: s.salary,
      hoursPerWeek: s.hoursPerWeek, startDate: s.startDate,
      endDate: s.endDate ?? '', status: s.status, notes: s.notes ?? '',
    });
    setModalOpen(true);
  };

  const handleSave = () => {
    const data: Omit<StaffMember, 'id'> = {
      ...form,
      endDate: form.endDate || undefined,
      notes: form.notes || undefined,
    };
    if (editingId) {
      updateStaff(editingId, data);
    } else {
      addStaff(data);
    }
    setModalOpen(false);
  };

  const f = (field: keyof StaffFormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const val = e.target.type === 'number' ? Number(e.target.value) : e.target.value;
    setForm((prev) => ({ ...prev, [field]: val }));
  };

  const selectedSite = sites.find(s => s.id === form.siteId);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Staff Roster</h1>
          <p className="text-sm text-slate-500 mt-0.5">{filtered.length} staff · {Math.round(totalFte * 10) / 10} FTE · {formatCurrency(totalPayroll)}/mo (est.)</p>
        </div>
        <Button variant="primary" onClick={openAdd}>
          <Plus className="w-4 h-4" /> Add Staff Member
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name..."
            className="pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 w-48"
          />
        </div>
        <Select value={filterSite} onChange={(e) => setFilterSite(e.target.value)}>
          <option value="all">All Sites</option>
          {sites.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </Select>
        <Select value={filterRole} onChange={(e) => setFilterRole(e.target.value)}>
          <option value="all">All Roles</option>
          {ROLE_ORDER.map((r) => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
        </Select>
        <Select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
          <option value="all">All Statuses</option>
          <option value="active">Active</option>
          <option value="leaving">Leaving</option>
          <option value="planned">Planned</option>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500">Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500">Role</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500">Site</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-slate-500">Team</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-slate-500">FTE</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-slate-500">Salary</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-slate-500">Monthly Cost</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500">Started</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500">Leaving</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500">Status</th>
                <th className="px-2 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={11} className="px-6 py-8 text-center text-sm text-slate-400">
                    No staff found matching your filters.
                  </td>
                </tr>
              )}
              {filtered.map((s) => {
                const site = sites.find((si) => si.id === s.siteId);
                return (
                  <tr key={s.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-3">
                      <div className="font-medium text-slate-900">{s.fullName}</div>
                      {s.notes && <div className="text-xs text-slate-400 truncate max-w-40">{s.notes}</div>}
                    </td>
                    <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{ROLE_LABELS[s.role]}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: site?.color ?? '#94a3b8' }} />
                        <span className="text-slate-600">{site?.name ?? s.siteId}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {s.team === 'day' && <Sun className="w-4 h-4 text-amber-500 mx-auto" />}
                      {s.team === 'night' && <Moon className="w-4 h-4 text-indigo-400 mx-auto" />}
                      {s.team === 'any' && <span className="text-slate-400 text-xs">—</span>}
                    </td>
                    <td className="px-4 py-3 text-right text-slate-600">{Math.round(s.fte * 10) / 10}</td>
                    <td className="px-4 py-3 text-right text-slate-600">{formatCurrency(s.salary)}</td>
                    <td className="px-4 py-3 text-right text-slate-600">{formatCurrency(s.monthlyCost)}</td>
                    <td className="px-4 py-3 text-slate-500 text-xs">{formatDate(s.startDate)}</td>
                    <td className="px-4 py-3 text-xs">
                      {s.endDate ? (
                        <span className="text-amber-600 font-medium">{formatDate(s.endDate)}</span>
                      ) : (
                        <span className="text-slate-300">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={STATUS_COLORS[s.status]}>{s.status}</Badge>
                    </td>
                    <td className="px-2 py-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => openEdit(s)} className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-700">
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => setConfirmDeleteId(s.id)} className="p-1 rounded hover:bg-red-50 text-slate-400 hover:text-red-500">
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

      <p className="text-xs text-slate-400">Monthly cost includes estimated employer NI (~13.8%) and pension (~5%) on-costs.</p>

      {/* Add/Edit Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? 'Edit Staff Member' : 'Add Staff Member'}
        className="max-w-2xl"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input label="First Name" value={form.firstName} onChange={f('firstName')} placeholder="e.g. Sarah" />
            <Input label="Last Name" value={form.lastName} onChange={f('lastName')} placeholder="e.g. Mitchell" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Select label="Role" value={form.role} onChange={f('role')}>
              {ROLE_ORDER.map((r) => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
            </Select>
            <Select label="Site" value={form.siteId} onChange={f('siteId')}>
              {sites.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </Select>
          </div>
          {selectedSite?.type === '24h' && (
            <Select label="Team" value={form.team} onChange={f('team')}>
              <option value="day">Day Team</option>
              <option value="night">Night Team</option>
              <option value="any">Any / Flexible</option>
            </Select>
          )}
          <div className="grid grid-cols-2 gap-3">
            <Input label="Annual Salary (£)" type="number" value={form.salary} onChange={f('salary')} />
            <Input label="Hours/Week" type="number" min={1} max={60} value={form.hoursPerWeek} onChange={f('hoursPerWeek')} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Start Date" type="date" value={form.startDate} onChange={f('startDate')} />
            <Input label="End Date (if leaving)" type="date" value={form.endDate} onChange={f('endDate')} />
          </div>
          <Select label="Status" value={form.status} onChange={f('status')}>
            <option value="active">Active</option>
            <option value="leaving">Leaving</option>
            <option value="planned">Planned (not yet started)</option>
          </Select>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-slate-600">Notes</label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
              rows={2}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Optional notes..."
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleSave}>{editingId ? 'Save Changes' : 'Add'}</Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirm */}
      <Modal open={!!confirmDeleteId} onClose={() => setConfirmDeleteId(null)} title="Remove Staff Member">
        <p className="text-sm text-slate-700 mb-6">Are you sure you want to remove this staff member? This cannot be undone.</p>
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setConfirmDeleteId(null)}>Cancel</Button>
          <Button variant="danger" onClick={() => { deleteStaff(confirmDeleteId!); setConfirmDeleteId(null); }}>Remove</Button>
        </div>
      </Modal>
    </div>
  );
}
