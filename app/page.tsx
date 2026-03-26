'use client';

import { useMemo } from 'react';
import { useStore } from '@/store/useStore';
import { StatCard } from '@/components/ui/stat-card';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Users, PoundSterling, AlertTriangle, ClipboardList,
  Moon, Sun,
} from 'lucide-react';
import {
  computeStaffMember,
  formatCurrency,
  maxRequired,
  getActualFte,
  formatDate,
} from '@/lib/utils';
import { ROLE_LABELS, Role } from '@/lib/types';
import Link from 'next/link';

export default function DashboardPage() {
  const { staff, sites, requirements, recruitment } = useStore();

  const computed = useMemo(() => staff.map(computeStaffMember), [staff]);

  const activeStaff = computed.filter((s) => s.status === 'active' || s.status === 'leaving');

  const totalMonthlyPayroll = activeStaff.reduce((sum, s) => sum + s.monthlyCost, 0);
  const totalAnnualPayroll = activeStaff.reduce((sum, s) => sum + s.annualCost, 0);

  const now = new Date();
  const in3months = new Date(now.getFullYear(), now.getMonth() + 3, now.getDate());
  const leavingSoon = activeStaff.filter(
    (s) => s.endDate && new Date(s.endDate) <= in3months
  );

  const gaps = useMemo(() => {
    const result: { siteId: string; siteName: string; role: Role; team: string; actual: number; required: number; shortfall: number }[] = [];
    for (const req of requirements) {
      const site = sites.find((s) => s.id === req.siteId);
      if (!site) continue;
      const actual = getActualFte(staff.filter(s => s.status !== 'planned'), req.siteId, req.role, req.team);
      const required = maxRequired(req, site.type);
      if (actual < required) {
        result.push({
          siteId: req.siteId,
          siteName: site.name,
          role: req.role,
          team: req.team,
          actual: Math.round(actual * 10) / 10,
          required,
          shortfall: Math.round((required - actual) * 10) / 10,
        });
      }
    }
    return result.sort((a, b) => b.shortfall - a.shortfall).slice(0, 8);
  }, [requirements, sites, staff]);

  const activeRecruitment = recruitment.filter((r) => r.status !== 'filled' && r.status !== 'cancelled');

  const siteSummary = useMemo(() => {
    return sites
      .filter((s) => s.id !== 'central')
      .map((site) => {
        const siteStaff = activeStaff.filter((s) => s.siteId === site.id);
        const siteCost = siteStaff.reduce((sum, s) => sum + s.monthlyCost, 0);
        const siteRequirements = requirements.filter((r) => r.siteId === site.id);
        let gapCount = 0;
        for (const req of siteRequirements) {
          const actual = getActualFte(staff.filter(s => s.status !== 'planned'), req.siteId, req.role, req.team);
          const required = maxRequired(req, site.type);
          if (actual < required) gapCount++;
        }
        return { site, headcount: siteStaff.length, monthlyCost: siteCost, gapCount };
      });
  }, [sites, activeStaff, requirements, staff]);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-sm text-slate-500 mt-0.5">Overview across all 7 sites</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Active Staff"
          value={activeStaff.length}
          subtitle={`${activeStaff.filter((s) => s.status === 'leaving').length} leaving`}
          icon={Users}
          iconColor="text-indigo-500"
        />
        <StatCard
          title="Monthly Payroll"
          value={formatCurrency(totalMonthlyPayroll)}
          subtitle={`${formatCurrency(totalAnnualPayroll)} / year`}
          icon={PoundSterling}
          iconColor="text-emerald-500"
        />
        <StatCard
          title="Staffing Gaps"
          value={gaps.length}
          subtitle="roles below ideal"
          icon={AlertTriangle}
          iconColor={gaps.length > 0 ? 'text-amber-500' : 'text-emerald-500'}
        />
        <StatCard
          title="Open Recruitment"
          value={activeRecruitment.length}
          subtitle="active positions"
          icon={ClipboardList}
          iconColor="text-blue-500"
        />
      </div>

      {leavingSoon.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <h2 className="text-sm font-semibold text-amber-800">Leaving within 3 months</h2>
          </div>
          <div className="space-y-2">
            {leavingSoon.map((s) => {
              const site = sites.find((si) => si.id === s.siteId);
              return (
                <div key={s.id} className="flex items-center justify-between text-sm">
                  <div>
                    <span className="font-medium text-slate-900">{s.fullName}</span>
                    <span className="text-slate-500 mx-1.5">·</span>
                    <span className="text-slate-600">{ROLE_LABELS[s.role]}</span>
                    <span className="text-slate-500 mx-1.5">·</span>
                    <span className="text-slate-600">{site?.name}</span>
                  </div>
                  <span className="text-amber-700 font-medium">{formatDate(s.endDate!)}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Staffing Gaps (Ideal vs Actual)</CardTitle>
              <Link href="/planning" className="text-xs text-indigo-600 hover:underline">View all</Link>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {gaps.length === 0 ? (
              <p className="px-6 py-4 text-sm text-slate-500">No staffing gaps found.</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="px-6 py-2 text-left text-xs font-medium text-slate-500">Site / Role</th>
                    <th className="px-6 py-2 text-right text-xs font-medium text-slate-500">Actual</th>
                    <th className="px-6 py-2 text-right text-xs font-medium text-slate-500">Required</th>
                    <th className="px-6 py-2 text-right text-xs font-medium text-slate-500">Gap</th>
                  </tr>
                </thead>
                <tbody>
                  {gaps.map((g, i) => (
                    <tr key={i} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-2.5">
                        <div className="font-medium text-slate-900">{g.siteName}</div>
                        <div className="text-xs text-slate-500 flex items-center gap-1">
                          {ROLE_LABELS[g.role]}
                          {g.team !== 'any' && (
                            g.team === 'day'
                              ? <Sun className="w-3 h-3 text-amber-500" />
                              : <Moon className="w-3 h-3 text-indigo-400" />
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-2.5 text-right text-slate-600">{g.actual}</td>
                      <td className="px-6 py-2.5 text-right text-slate-600">{g.required}</td>
                      <td className="px-6 py-2.5 text-right">
                        <Badge variant="danger">-{g.shortfall}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Site Summary</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="px-6 py-2 text-left text-xs font-medium text-slate-500">Site</th>
                  <th className="px-6 py-2 text-right text-xs font-medium text-slate-500">Staff</th>
                  <th className="px-6 py-2 text-right text-xs font-medium text-slate-500">Monthly</th>
                  <th className="px-6 py-2 text-right text-xs font-medium text-slate-500">Gaps</th>
                </tr>
              </thead>
              <tbody>
                {siteSummary.map(({ site, headcount, monthlyCost, gapCount }) => (
                  <tr key={site.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-2.5">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: site.color }} />
                        <span className="font-medium text-slate-900">{site.name}</span>
                      </div>
                      <div className="text-xs text-slate-500 ml-4">
                        {site.type === '24h' ? '24h · Day & Night' : 'Mon–Fri'}
                      </div>
                    </td>
                    <td className="px-6 py-2.5 text-right text-slate-600">{headcount}</td>
                    <td className="px-6 py-2.5 text-right text-slate-600">{formatCurrency(monthlyCost)}</td>
                    <td className="px-6 py-2.5 text-right">
                      {gapCount > 0 ? (
                        <Badge variant="warning">{gapCount}</Badge>
                      ) : (
                        <Badge variant="success">OK</Badge>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>

      {activeRecruitment.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recruitment Pipeline</CardTitle>
              <Link href="/recruitment" className="text-xs text-indigo-600 hover:underline">Manage</Link>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="px-6 py-2 text-left text-xs font-medium text-slate-500">Role</th>
                  <th className="px-6 py-2 text-left text-xs font-medium text-slate-500">Site</th>
                  <th className="px-6 py-2 text-left text-xs font-medium text-slate-500">Status</th>
                  <th className="px-6 py-2 text-right text-xs font-medium text-slate-500">Target Start</th>
                  <th className="px-6 py-2 text-right text-xs font-medium text-slate-500">Budget</th>
                </tr>
              </thead>
              <tbody>
                {activeRecruitment.map((r) => {
                  const site = sites.find((s) => s.id === r.siteId);
                  const statusColors: Record<string, 'info' | 'warning' | 'success' | 'default'> = {
                    planned: 'default', advertising: 'info', interviewing: 'warning', offered: 'success',
                  };
                  return (
                    <tr key={r.id} className="border-b border-slate-50 hover:bg-slate-50">
                      <td className="px-6 py-2.5 font-medium text-slate-900">{ROLE_LABELS[r.role]}</td>
                      <td className="px-6 py-2.5 text-slate-600">{site?.name}</td>
                      <td className="px-6 py-2.5">
                        <Badge variant={statusColors[r.status] ?? 'default'}>
                          {r.status.charAt(0).toUpperCase() + r.status.slice(1)}
                        </Badge>
                      </td>
                      <td className="px-6 py-2.5 text-right text-slate-600">{formatDate(r.targetStartDate)}</td>
                      <td className="px-6 py-2.5 text-right text-slate-600">{formatCurrency(r.salaryBudget)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
