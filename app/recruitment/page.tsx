'use client';

import { useMemo, useState } from 'react';
import { useStore } from '@/store/useStore';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Modal } from '@/components/ui/modal';
import { StatCard } from '@/components/ui/stat-card';
import {
  ROLE_LABELS, ROLE_ORDER, Role, Team, RecruitmentStatus,
  RECRUITMENT_STATUS_LABELS, RecruitmentRecord,
} from '@/lib/types';
import { formatCurrency, formatDate, monthsFromNow } from '@/lib/utils';
import { Plus, Pencil, Trash2, PoundSterling, ClipboardList, Clock } from 'lucide-react';

const STATUS_BADGE: Record<RecruitmentStatus, 'default' | 'info' | 'warning' | 'success' | 'danger' | 'neutral'> = {
  planned: 'default',
  advertising: 'info',
  interviewing: 'warning',
  offered: 'success',
  filled: 'neutral',
  cancelled: 'danger',
};

const PIPELINE_STAGES: RecruitmentStatus[] = ['planned', 'advertising', 'interviewing', 'offered'];

interface FormData {
  role: Role;
  siteId: string;
  team: Team;
  targetStartDate: string;
  salaryBudget: number;
  status: RecruitmentStatus;
  notes: string;
}

const emptyForm = (siteId: string): FormData => ({
  role: 'vet',
  siteId,
  team: 'any',
  targetStartDate: new Date(new Date().setMonth(new Date().getMonth() + 3)).toISOString().split('T')[0],
  salaryBudget: 55000,
  status: 'planned',
  notes: '',
});

export default function RecruitmentPage() {
  const { sites, recruitment, addRecruitment, updateRecruitment, deleteRecruitment } = useStore();
  const [filterStatus, setFilterStatus] = useState('active');
  const [filterSite, setFilterSite] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>(emptyForm(sites[0]?.id ?? ''));
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return recruitment
      .filter((r) => {
        if (filterSite !== 'all' && r.siteId !== filterSite) return false;
        if (filterStatus === 'active') return r.status !== 'filled' && r.status !== 'cancelled';
        if (filterStatus !== 'all') return r.status === filterStatus;
        return true;
      })
      .sort((a, b) => new Date(a.targetStartDate).getTime() - new Date(b.targetStartDate).getTime());
  }, [recruitment, filterStatus, filterSite]);

  const active = recruitment.filter((r) => r.status !== 'filled' && r.status !== 'cancelled');
  const totalBudget = active.reduce((sum, r) => sum + r.salaryBudget, 0);
  const urgentCount = active.filter((r) => monthsFromNow(r.targetStartDate) <= 2).length;

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm(filterSite !== 'all' ? filterSite : (sites[0]?.id ?? '')));
    setModalOpen(true);
  };

  const openEdit = (r: RecruitmentRecord) => {
    setEditingId(r.id);
    setForm({
      role: r.role, siteId: r.siteId, team: r.team,
      targetStartDate: r.targetStartDate, salaryBudget: r.salaryBudget,
      status: r.status, notes: r.notes ?? '',
    });
    setModalOpen(true);
  };

  const handleSave = () => {
    const data = { ...form, notes: form.notes || undefined };
    if (editingId) {
      updateRecruitment(editingId, data);
    } else {
      addRecruitment(data);
    }
    setModalOpen(false);
  };

  const f = (field: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const val = e.target.type === 'number' ? Number(e.target.value) : e.target.value;
    setForm((p) => ({ ...p, [field]: val }));
  };

  const selectedSite = sites.find(s => s.id === form.siteId);

  // Pipeline board view
  const pipelineByStage = PIPELINE_STAGES.map((stage) => ({
    stage,
    items: recruitment.filter((r) => r.status === stage),
  }));

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Recruitment</h1>
          <p className="text-sm text-slate-500 mt-0.5">Track open positions, timelines, and salary budgets</p>
        </div>
        <Button variant="primary" onClick={openAdd}>
          <Plus className="w-4 h-4" /> New Position
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <StatCard
          title="Open Positions"
          value={active.length}
          subtitle="across all sites"
          icon={ClipboardList}
          iconColor="text-indigo-500"
        />
        <StatCard
          title="Total Salary Budget"
          value={formatCurrency(totalBudget)}
          subtitle="open positions"
          icon={PoundSterling}
          iconColor="text-emerald-500"
        />
        <StatCard
          title="Urgent (≤2 months)"
          value={urgentCount}
          subtitle="start date approaching"
          icon={Clock}
          iconColor={urgentCount > 0 ? 'text-amber-500' : 'text-emerald-500'}
        />
      </div>

      {/* Pipeline kanban */}
      <div>
        <h2 className="text-sm font-semibold text-slate-700 mb-3">Pipeline Overview</h2>
        <div className="grid grid-cols-4 gap-3">
          {pipelineByStage.map(({ stage, items }) => (
            <div key={stage} className="bg-slate-50 rounded-xl p-3 border border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                  {RECRUITMENT_STATUS_LABELS[stage]}
                </span>
                <span className="text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-full w-5 h-5 flex items-center justify-center">
                  {items.length}
                </span>
              </div>
              <div className="space-y-2">
                {items.map((r) => {
                  const site = sites.find((s) => s.id === r.siteId);
                  const months = monthsFromNow(r.targetStartDate);
                  return (
                    <div
                      key={r.id}
                      onClick={() => openEdit(r)}
                      className="bg-white rounded-lg border border-slate-200 p-2.5 cursor-pointer hover:border-indigo-300 hover:shadow-sm transition-all"
                    >
                      <p className="text-xs font-semibold text-slate-900">{ROLE_LABELS[r.role]}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{site?.name}</p>
                      <div className="mt-1.5 flex items-center justify-between">
                        <span className="text-xs text-slate-400">{formatDate(r.targetStartDate)}</span>
                        {months <= 1 && months >= 0 && (
                          <Badge variant="danger" className="text-xs">Urgent</Badge>
                        )}
                        {months > 1 && months <= 2 && (
                          <Badge variant="warning" className="text-xs">{months}mo</Badge>
                        )}
                      </div>
                    </div>
                  );
                })}
                {items.length === 0 && (
                  <p className="text-xs text-slate-400 text-center py-2">None</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="flex items-center gap-3">
        <Select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
          <option value="active">Active Positions</option>
          <option value="all">All</option>
          <option value="planned">Planned</option>
          <option value="advertising">Advertising</option>
          <option value="interviewing">Interviewing</option>
          <option value="offered">Offer Made</option>
          <option value="filled">Filled</option>
          <option value="cancelled">Cancelled</option>
        </Select>
        <Select value={filterSite} onChange={(e) => setFilterSite(e.target.value)}>
          <option value="all">All Sites</option>
          {sites.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </Select>
      </div>

      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500">Role</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500">Site</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500">Target Start</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-slate-500">Salary Budget</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500">Notes</th>
                <th className="px-2 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="px-6 py-8 text-center text-sm text-slate-400">No positions found.</td></tr>
              )}
              {filtered.map((r) => {
                const site = sites.find((s) => s.id === r.siteId);
                const months = monthsFromNow(r.targetStartDate);
                const isUrgent = months <= 2 && r.status !== 'filled' && r.status !== 'cancelled';
                return (
                  <tr key={r.id} className={`border-b border-slate-50 hover:bg-slate-50 transition-colors ${isUrgent ? 'bg-amber-50/30' : ''}`}>
                    <td className="px-6 py-3 font-medium text-slate-900">{ROLE_LABELS[r.role]}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: site?.color ?? '#94a3b8' }} />
                        <span className="text-slate-600">{site?.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={STATUS_BADGE[r.status]}>{RECRUITMENT_STATUS_LABELS[r.status]}</Badge>
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {formatDate(r.targetStartDate)}
                      {isUrgent && <Badge variant="warning" className="ml-2">Soon</Badge>}
                    </td>
                    <td className="px-4 py-3 text-right text-slate-600">{formatCurrency(r.salaryBudget)}</td>
                    <td className="px-4 py-3 text-slate-400 text-xs max-w-xs truncate">{r.notes ?? '—'}</td>
                    <td className="px-2 py-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => openEdit(r)} className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-700">
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => setConfirmDeleteId(r.id)} className="p-1 rounded hover:bg-red-50 text-slate-400 hover:text-red-500">
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

      {/* Add/Edit Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? 'Edit Position' : 'Add Recruitment Position'}
        className="max-w-xl"
      >
        <div className="space-y-4">
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
            <Input label="Target Start Date" type="date" value={form.targetStartDate} onChange={f('targetStartDate')} />
            <Input label="Salary Budget (£)" type="number" value={form.salaryBudget} onChange={f('salaryBudget')} />
          </div>
          <Select label="Status" value={form.status} onChange={f('status')}>
            {(Object.keys(RECRUITMENT_STATUS_LABELS) as RecruitmentStatus[]).map((s) => (
              <option key={s} value={s}>{RECRUITMENT_STATUS_LABELS[s]}</option>
            ))}
          </Select>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-slate-600">Notes</label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
              rows={2}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="e.g. Replacing Jane Smith who is leaving in June..."
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleSave}>{editingId ? 'Save Changes' : 'Add Position'}</Button>
          </div>
        </div>
      </Modal>

      <Modal open={!!confirmDeleteId} onClose={() => setConfirmDeleteId(null)} title="Remove Position">
        <p className="text-sm text-slate-700 mb-6">Remove this recruitment position?</p>
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setConfirmDeleteId(null)}>Cancel</Button>
          <Button variant="danger" onClick={() => { deleteRecruitment(confirmDeleteId!); setConfirmDeleteId(null); }}>Remove</Button>
        </div>
      </Modal>
    </div>
  );
}
