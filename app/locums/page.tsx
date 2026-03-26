'use client';

import { useMemo, useState } from 'react';
import { useStore } from '@/store/useStore';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { StatCard } from '@/components/ui/stat-card';
import { Select } from '@/components/ui/select';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import { computeStaffMember, formatCurrency, maxRequired, getActualFte, formatDate, nextMonths } from '@/lib/utils';
import { ROLE_LABELS, ROLE_ORDER, Role, FULL_TIME_HOURS_PER_WEEK, EMPLOYER_ONCOST_MULTIPLIER } from '@/lib/types';
import { AlertTriangle, Stethoscope, PoundSterling, Calendar } from 'lucide-react';

// Estimated locum day rates by role
const LOCUM_DAY_RATES: Record<Role, number> = {
  vet: 650,
  vet_nurse: 280,
  student_vet_nurse: 180,
  animal_nursing_assistant: 180,
  receptionist: 160,
  central_support: 250,
};

// Assume 5 working days per week
const WORKING_DAYS_PER_WEEK = 5;

const FORECAST_MONTHS = 12;

interface GapPeriod {
  siteId: string;
  siteName: string;
  role: Role;
  team: string;
  reason: string;
  fromDate: string;
  toDate?: string;
  shortfall: number; // FTE gap
  estimatedDays: number;
  estimatedCost: number;
  severity: 'critical' | 'high' | 'medium';
}

export default function LocumsPage() {
  const { staff, sites, requirements } = useStore();
  const [filterSite, setFilterSite] = useState('all');

  const now = new Date();

  // Identify gap periods from known leaving dates
  const gapPeriods = useMemo(() => {
    const gaps: GapPeriod[] = [];

    // Staff leaving in next 12 months
    const leavingStaff = staff.filter((s) => {
      if (!s.endDate) return false;
      const end = new Date(s.endDate);
      const future = new Date(now.getFullYear(), now.getMonth() + FORECAST_MONTHS, 1);
      return end >= now && end <= future;
    });

    for (const leaving of leavingStaff) {
      const site = sites.find((s) => s.id === leaving.siteId);
      if (!site) continue;

      // Find the relevant requirement
      const req = requirements.find(
        (r) => r.siteId === leaving.siteId && r.role === leaving.role &&
          (r.team === leaving.team || r.team === 'any' || leaving.team === 'any')
      );
      if (!req) continue;

      const required = maxRequired(req, site.type);
      // Calculate what actual will be after this person leaves
      const currentActual = getActualFte(staff.filter(s => s.status !== 'planned'), leaving.siteId, leaving.role, leaving.team);
      const fte = leaving.hoursPerWeek / FULL_TIME_HOURS_PER_WEEK;
      const futureActual = currentActual - fte;
      const futureShortfall = required - futureActual;

      if (futureShortfall > 0) {
        const endDate = new Date(leaving.endDate!);
        // Estimate gap until a replacement might start (assume 3 months to recruit)
        const gapEndDate = new Date(endDate);
        gapEndDate.setMonth(gapEndDate.getMonth() + 3);

        const gapWeeks = Math.ceil((gapEndDate.getTime() - endDate.getTime()) / (1000 * 60 * 60 * 24 * 7));
        const estimatedDays = gapWeeks * WORKING_DAYS_PER_WEEK * futureShortfall;
        const estimatedCost = estimatedDays * LOCUM_DAY_RATES[leaving.role];

        gaps.push({
          siteId: leaving.siteId,
          siteName: site.name,
          role: leaving.role,
          team: leaving.team,
          reason: `${leaving.firstName} ${leaving.lastName} leaving`,
          fromDate: leaving.endDate!,
          toDate: gapEndDate.toISOString().split('T')[0],
          shortfall: Math.round(futureShortfall * 10) / 10,
          estimatedDays: Math.round(estimatedDays),
          estimatedCost,
          severity: futureShortfall >= 1 ? 'critical' : futureShortfall >= 0.6 ? 'high' : 'medium',
        });
      }
    }

    // Current gaps (already below required)
    for (const req of requirements) {
      const site = sites.find((s) => s.id === req.siteId);
      if (!site) continue;
      const actual = getActualFte(staff.filter(s => s.status !== 'planned'), req.siteId, req.role, req.team);
      const required = maxRequired(req, site.type);
      const shortfall = required - actual;

      if (shortfall > 0) {
        // Check if this isn't already captured by a leaving event
        const alreadyCaptured = gaps.some(
          (g) => g.siteId === req.siteId && g.role === req.role && g.team === req.team
        );
        if (!alreadyCaptured) {
          const estimatedDays = 4 * WORKING_DAYS_PER_WEEK * shortfall; // assume 4 weeks cover needed
          gaps.push({
            siteId: req.siteId,
            siteName: site.name,
            role: req.role,
            team: req.team,
            reason: 'Current understaffing',
            fromDate: now.toISOString().split('T')[0],
            shortfall: Math.round(shortfall * 10) / 10,
            estimatedDays: Math.round(estimatedDays),
            estimatedCost: estimatedDays * LOCUM_DAY_RATES[req.role],
            severity: shortfall >= 1 ? 'critical' : shortfall >= 0.6 ? 'high' : 'medium',
          });
        }
      }
    }

    return gaps.sort((a, b) => {
      const sev = { critical: 0, high: 1, medium: 2 };
      return sev[a.severity] - sev[b.severity] || new Date(a.fromDate).getTime() - new Date(b.fromDate).getTime();
    });
  }, [staff, sites, requirements]);

  const filtered = useMemo(() => {
    if (filterSite === 'all') return gapPeriods;
    return gapPeriods.filter((g) => g.siteId === filterSite);
  }, [gapPeriods, filterSite]);

  const totalEstimatedCost = filtered.reduce((sum, g) => sum + g.estimatedCost, 0);
  const totalDays = filtered.reduce((sum, g) => sum + g.estimatedDays, 0);
  const criticalCount = filtered.filter((g) => g.severity === 'critical').length;

  const SEVERITY_BADGE: Record<string, 'danger' | 'warning' | 'info'> = {
    critical: 'danger', high: 'warning', medium: 'info',
  };

  // Monthly cost distribution chart
  const monthlyCostData = useMemo(() => {
    const labels = nextMonths(FORECAST_MONTHS);
    return labels.map((label, i) => {
      const year = now.getFullYear() + Math.floor((now.getMonth() + i) / 12);
      const month = (now.getMonth() + i) % 12;
      const monthStart = new Date(year, month, 1);
      const monthEnd = new Date(year, month + 1, 0);

      const monthCost = gapPeriods.reduce((sum, g) => {
        const from = new Date(g.fromDate);
        const to = g.toDate ? new Date(g.toDate) : new Date(now.getFullYear(), now.getMonth() + 1, 0);
        // Check overlap
        if (from > monthEnd || to < monthStart) return sum;
        // Proportion of gap that falls in this month
        const overlapStart = from > monthStart ? from : monthStart;
        const overlapEnd = to < monthEnd ? to : monthEnd;
        const overlapDays = Math.ceil((overlapEnd.getTime() - overlapStart.getTime()) / (1000 * 60 * 60 * 24));
        const totalGapDays = Math.ceil((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24));
        if (totalGapDays <= 0) return sum;
        const proportion = overlapDays / totalGapDays;
        return sum + g.estimatedCost * proportion;
      }, 0);

      return { month: label, cost: Math.round(monthCost) };
    });
  }, [gapPeriods]);

  // Holiday cover estimate
  const holidayCoverEstimate = useMemo(() => {
    const activeStaff = staff.filter(s => s.status === 'active').map(computeStaffMember);
    // 7 weeks holiday per person, estimate 20% needed as locum cover
    return activeStaff.map((s) => {
      const holidayWeeks = 7;
      const coverWeeks = holidayWeeks * 0.2; // rough estimate: 20% need locum cover
      const days = coverWeeks * WORKING_DAYS_PER_WEEK;
      const cost = days * LOCUM_DAY_RATES[s.role] * s.fte;
      return { ...s, holidayCoverDays: Math.round(days * s.fte), holidayCoverCost: cost };
    });
  }, [staff]);

  const totalHolidayCoverCost = holidayCoverEstimate.reduce((sum, s) => sum + s.holidayCoverCost, 0);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Locum Coverage</h1>
        <p className="text-sm text-slate-500 mt-0.5">Predict when locum cover will be needed and estimate costs</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <StatCard
          title="Predicted Locum Days"
          value={totalDays}
          subtitle="from gaps & departures"
          icon={Calendar}
          iconColor="text-indigo-500"
        />
        <StatCard
          title="Estimated Gap Cover Cost"
          value={formatCurrency(totalEstimatedCost)}
          subtitle="staffing gaps only"
          icon={PoundSterling}
          iconColor={criticalCount > 0 ? 'text-red-500' : 'text-emerald-500'}
        />
        <StatCard
          title="Critical Gaps"
          value={criticalCount}
          subtitle="≥1 FTE shortfall"
          icon={AlertTriangle}
          iconColor={criticalCount > 0 ? 'text-red-500' : 'text-emerald-500'}
        />
      </div>

      {/* Monthly cost chart */}
      <Card>
        <CardHeader>
          <CardTitle>Predicted Locum Cost by Month</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={monthlyCostData} margin={{ top: 4, right: 16, left: 16, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <YAxis tickFormatter={(v) => `£${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <Tooltip
                formatter={(val) => formatCurrency(Number(val))}
                contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
              />
              <Bar dataKey="cost" name="Locum Cost" radius={[4, 4, 0, 0]}>
                {monthlyCostData.map((entry, index) => (
                  <Cell key={index} fill={entry.cost > 5000 ? '#ef4444' : entry.cost > 2000 ? '#f59e0b' : '#6366f1'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <Select value={filterSite} onChange={(e) => setFilterSite(e.target.value)}>
          <option value="all">All Sites</option>
          {sites.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </Select>
      </div>

      {/* Gap periods */}
      <Card>
        <CardHeader>
          <CardTitle>Predicted Gap Periods</CardTitle>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          {filtered.length === 0 ? (
            <p className="px-6 py-8 text-center text-sm text-slate-400">No coverage gaps predicted.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500">Severity</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500">Site</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500">Role</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500">Reason</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500">From</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500">To (est.)</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-slate-500">Shortfall</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-slate-500">Est. Days</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-slate-500">Est. Cost</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((g, i) => {
                  const site = sites.find((s) => s.id === g.siteId);
                  return (
                    <tr key={i} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-3">
                        <Badge variant={SEVERITY_BADGE[g.severity]}>
                          {g.severity.charAt(0).toUpperCase() + g.severity.slice(1)}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: site?.color ?? '#94a3b8' }} />
                          <span className="text-slate-700">{g.siteName}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-700">{ROLE_LABELS[g.role]}</td>
                      <td className="px-4 py-3 text-slate-500 text-xs max-w-xs">{g.reason}</td>
                      <td className="px-4 py-3 text-slate-600 text-xs">{formatDate(g.fromDate)}</td>
                      <td className="px-4 py-3 text-slate-600 text-xs">
                        {g.toDate ? formatDate(g.toDate) : <span className="text-slate-400">Open</span>}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Badge variant="danger">{g.shortfall} FTE</Badge>
                      </td>
                      <td className="px-4 py-3 text-right text-slate-600">{g.estimatedDays}d</td>
                      <td className="px-4 py-3 text-right font-medium text-slate-900">{formatCurrency(g.estimatedCost)}</td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="bg-slate-50 border-t border-slate-200">
                  <td colSpan={7} className="px-6 py-3 text-right text-xs font-semibold text-slate-600">Totals</td>
                  <td className="px-4 py-3 text-right text-xs font-bold text-slate-900">{totalDays}d</td>
                  <td className="px-4 py-3 text-right text-xs font-bold text-slate-900">{formatCurrency(totalEstimatedCost)}</td>
                </tr>
              </tfoot>
            </table>
          )}
        </CardContent>
      </Card>

      {/* Holiday cover estimate */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Annual Holiday Cover Estimate</CardTitle>
            <span className="text-xs text-slate-500">7 weeks holiday · ~20% coverage rate</span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-indigo-50 rounded-xl p-4">
              <p className="text-xs font-medium text-indigo-700 uppercase tracking-wide">Estimated Holiday Cover Cost</p>
              <p className="text-2xl font-bold text-indigo-900 mt-1">{formatCurrency(totalHolidayCoverCost)}</p>
              <p className="text-xs text-indigo-600 mt-0.5">per year across all staff</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-4">
              <p className="text-xs font-medium text-slate-600 uppercase tracking-wide">By Role (annual estimate)</p>
              <div className="mt-2 space-y-1">
                {ROLE_ORDER.map((role) => {
                  const roleCost = holidayCoverEstimate
                    .filter((s) => s.role === role)
                    .reduce((sum, s) => sum + s.holidayCoverCost, 0);
                  if (roleCost === 0) return null;
                  return (
                    <div key={role} className="flex justify-between text-xs">
                      <span className="text-slate-600">{ROLE_LABELS[role]}</span>
                      <span className="font-medium text-slate-800">{formatCurrency(roleCost)}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          <p className="text-xs text-slate-400">
            Holiday cover estimate assumes that approximately 20% of annual leave requires locum cover (i.e. when leave cannot be covered by the team).
            This is an indicative figure — adjust based on your actual cover arrangements.
          </p>
        </CardContent>
      </Card>

      <div>
        <h3 className="text-xs font-semibold text-slate-600 mb-2">Estimated Locum Day Rates Used</h3>
        <div className="flex flex-wrap gap-3">
          {ROLE_ORDER.map((role) => (
            <div key={role} className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs">
              <span className="text-slate-600">{ROLE_LABELS[role]}:</span>
              <span className="font-semibold text-slate-900 ml-1">{formatCurrency(LOCUM_DAY_RATES[role])}/day</span>
            </div>
          ))}
        </div>
        <p className="text-xs text-slate-400 mt-2">
          Day rates are estimates. Update them in the source to match your actual agency/locum rates.
          Gap-to-cover duration assumes 3 months recruitment time. Adjust as appropriate.
        </p>
      </div>
    </div>
  );
}
