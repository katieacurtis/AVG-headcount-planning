'use client';

import { useMemo, useState } from 'react';
import { useStore } from '@/store/useStore';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { StatCard } from '@/components/ui/stat-card';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Legend, AreaChart, Area,
} from 'recharts';
import { computeStaffMember, formatCurrency, isActiveInMonth, nextMonths } from '@/lib/utils';
import { ROLE_LABELS, ROLE_ORDER, Role, EMPLOYER_ONCOST_MULTIPLIER, FULL_TIME_HOURS_PER_WEEK } from '@/lib/types';
import { PoundSterling, TrendingUp, Users } from 'lucide-react';

const FORECAST_MONTHS = 12;

export default function PayrollPage() {
  const { staff, sites } = useStore();
  const [groupBy, setGroupBy] = useState<'site' | 'role'>('site');

  const now = new Date();

  // Month-by-month forecast
  const monthLabels = nextMonths(FORECAST_MONTHS);
  const monthData = useMemo(() => {
    return Array.from({ length: FORECAST_MONTHS }, (_, i) => {
      const year = now.getFullYear() + Math.floor((now.getMonth() + i) / 12);
      const month = (now.getMonth() + i) % 12;

      const activeThisMonth = staff.filter((s) => isActiveInMonth(s, year, month));

      const totalCost = activeThisMonth.reduce((sum, s) => {
        const fte = s.hoursPerWeek / FULL_TIME_HOURS_PER_WEEK;
        return sum + (s.salary * fte * EMPLOYER_ONCOST_MULTIPLIER) / 12;
      }, 0);

      const headcount = activeThisMonth.length;

      // Break down by site
      const bySite: Record<string, number> = {};
      for (const site of sites) {
        const siteCost = activeThisMonth
          .filter((s) => s.siteId === site.id)
          .reduce((sum, s) => {
            const fte = s.hoursPerWeek / FULL_TIME_HOURS_PER_WEEK;
            return sum + (s.salary * fte * EMPLOYER_ONCOST_MULTIPLIER) / 12;
          }, 0);
        bySite[site.id] = siteCost;
      }

      // Break down by role
      const byRole: Record<string, number> = {};
      for (const role of ROLE_ORDER) {
        const roleCost = activeThisMonth
          .filter((s) => s.role === role)
          .reduce((sum, s) => {
            const fte = s.hoursPerWeek / FULL_TIME_HOURS_PER_WEEK;
            return sum + (s.salary * fte * EMPLOYER_ONCOST_MULTIPLIER) / 12;
          }, 0);
        byRole[role] = roleCost;
      }

      return { label: monthLabels[i], totalCost, headcount, bySite, byRole };
    });
  }, [staff, sites, monthLabels]);

  // Current month stats
  const currentMonth = monthData[0];
  const lastMonth = monthData[1];
  const annualForecast = monthData.reduce((sum, m) => sum + m.totalCost, 0);

  // Site breakdown (current)
  const siteBreakdown = useMemo(() => {
    const activeStaff = staff.filter((s) => s.status !== 'planned').map(computeStaffMember);
    return sites.map((site) => {
      const siteStaff = activeStaff.filter((s) => s.siteId === site.id);
      const monthlyCost = siteStaff.reduce((sum, s) => sum + s.monthlyCost, 0);
      const annualCost = siteStaff.reduce((sum, s) => sum + s.annualCost, 0);
      const headcount = siteStaff.length;
      const avgSalary = siteStaff.length > 0 ? siteStaff.reduce((sum, s) => sum + s.salary, 0) / siteStaff.length : 0;
      return { site, monthlyCost, annualCost, headcount, avgSalary };
    }).sort((a, b) => b.monthlyCost - a.monthlyCost);
  }, [staff, sites]);

  // Role breakdown (current)
  const roleBreakdown = useMemo(() => {
    const activeStaff = staff.filter((s) => s.status !== 'planned').map(computeStaffMember);
    return ROLE_ORDER.map((role) => {
      const roleStaff = activeStaff.filter((s) => s.role === role);
      const monthlyCost = roleStaff.reduce((sum, s) => sum + s.monthlyCost, 0);
      const headcount = roleStaff.length;
      const totalFte = roleStaff.reduce((sum, s) => sum + s.fte, 0);
      const avgSalary = roleStaff.length > 0 ? roleStaff.reduce((sum, s) => sum + s.salary, 0) / roleStaff.length : 0;
      return { role, monthlyCost, headcount, totalFte, avgSalary };
    }).filter((r) => r.headcount > 0);
  }, [staff]);

  // Chart data
  const forecastChartData = monthData.map((m) => ({
    month: m.label,
    cost: Math.round(m.totalCost),
    headcount: m.headcount,
    ...(groupBy === 'site'
      ? Object.fromEntries(sites.map((s) => [s.name, Math.round(m.bySite[s.id] ?? 0)]))
      : Object.fromEntries(ROLE_ORDER.map((r) => [ROLE_LABELS[r], Math.round(m.byRole[r] ?? 0)]))),
  }));

  const SITE_COLORS = sites.reduce((acc, s) => ({ ...acc, [s.name]: s.color }), {} as Record<string, string>);
  const ROLE_COLORS: Record<string, string> = {
    'Vet': '#6366f1', 'Vet Nurse': '#10b981', 'Student Vet Nurse': '#f59e0b',
    'Animal Nursing Assistant': '#ef4444', 'Receptionist': '#0ea5e9', 'Central Support': '#94a3b8',
  };

  const stackKeys = groupBy === 'site'
    ? sites.filter(s => siteBreakdown.find(sb => sb.site.id === s.id && sb.monthlyCost > 0)).map(s => s.name)
    : ROLE_ORDER.map(r => ROLE_LABELS[r]).filter(label => roleBreakdown.some(rb => ROLE_LABELS[rb.role] === label));
  const colorMap = groupBy === 'site' ? SITE_COLORS : ROLE_COLORS;

  const formatYAxis = (val: number) => `£${(val / 1000).toFixed(0)}k`;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Payroll Forecast</h1>
        <p className="text-sm text-slate-500 mt-0.5">12-month payroll forecast including employer NI and pension on-costs</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <StatCard
          title="This Month (Estimated)"
          value={formatCurrency(currentMonth.totalCost)}
          subtitle={`${currentMonth.headcount} active staff`}
          icon={PoundSterling}
          iconColor="text-emerald-500"
        />
        <StatCard
          title="12-Month Forecast"
          value={formatCurrency(annualForecast)}
          subtitle="total payroll cost"
          icon={TrendingUp}
          iconColor="text-indigo-500"
        />
        <StatCard
          title="Average Monthly Cost"
          value={formatCurrency(annualForecast / 12)}
          subtitle="over next 12 months"
          icon={Users}
          iconColor="text-blue-500"
        />
      </div>

      {/* Forecast chart */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Monthly Payroll Forecast (12 months)</CardTitle>
            <Select value={groupBy} onChange={(e) => setGroupBy(e.target.value as 'site' | 'role')}>
              <option value="site">By Site</option>
              <option value="role">By Role</option>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={forecastChartData} margin={{ top: 4, right: 16, left: 16, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <YAxis tickFormatter={formatYAxis} tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <Tooltip
                formatter={(val) => formatCurrency(Number(val))}
                contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
              />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              {stackKeys.map((key) => (
                <Bar key={key} dataKey={key} stackId="a" fill={colorMap[key] ?? '#94a3b8'} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Headcount over time */}
      <Card>
        <CardHeader>
          <CardTitle>Headcount Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={forecastChartData} margin={{ top: 4, right: 16, left: 16, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }} />
              <Area type="monotone" dataKey="headcount" stroke="#6366f1" fill="#e0e7ff" strokeWidth={2} name="Headcount" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Site breakdown */}
        <Card>
          <CardHeader><CardTitle>Cost by Site (Current)</CardTitle></CardHeader>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="px-6 py-2.5 text-left text-xs font-medium text-slate-500">Site</th>
                  <th className="px-4 py-2.5 text-right text-xs font-medium text-slate-500">Staff</th>
                  <th className="px-4 py-2.5 text-right text-xs font-medium text-slate-500">Monthly</th>
                  <th className="px-4 py-2.5 text-right text-xs font-medium text-slate-500">Annual</th>
                  <th className="px-4 py-2.5 text-right text-xs font-medium text-slate-500">Avg Salary</th>
                </tr>
              </thead>
              <tbody>
                {siteBreakdown.filter(sb => sb.headcount > 0).map(({ site, headcount, monthlyCost, annualCost, avgSalary }) => (
                  <tr key={site.id} className="border-b border-slate-50 hover:bg-slate-50">
                    <td className="px-6 py-2.5">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: site.color }} />
                        <span className="font-medium text-slate-900">{site.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-2.5 text-right text-slate-600">{headcount}</td>
                    <td className="px-4 py-2.5 text-right text-slate-600">{formatCurrency(monthlyCost)}</td>
                    <td className="px-4 py-2.5 text-right font-medium text-slate-900">{formatCurrency(annualCost)}</td>
                    <td className="px-4 py-2.5 text-right text-slate-500">{formatCurrency(avgSalary)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>

        {/* Role breakdown */}
        <Card>
          <CardHeader><CardTitle>Cost by Role (Current)</CardTitle></CardHeader>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="px-6 py-2.5 text-left text-xs font-medium text-slate-500">Role</th>
                  <th className="px-4 py-2.5 text-right text-xs font-medium text-slate-500">Staff</th>
                  <th className="px-4 py-2.5 text-right text-xs font-medium text-slate-500">FTE</th>
                  <th className="px-4 py-2.5 text-right text-xs font-medium text-slate-500">Monthly</th>
                  <th className="px-4 py-2.5 text-right text-xs font-medium text-slate-500">Avg Salary</th>
                </tr>
              </thead>
              <tbody>
                {roleBreakdown.map(({ role, monthlyCost, headcount, totalFte, avgSalary }) => (
                  <tr key={role} className="border-b border-slate-50 hover:bg-slate-50">
                    <td className="px-6 py-2.5 font-medium text-slate-900">{ROLE_LABELS[role]}</td>
                    <td className="px-4 py-2.5 text-right text-slate-600">{headcount}</td>
                    <td className="px-4 py-2.5 text-right text-slate-600">{Math.round(totalFte * 10) / 10}</td>
                    <td className="px-4 py-2.5 text-right font-medium text-slate-900">{formatCurrency(monthlyCost)}</td>
                    <td className="px-4 py-2.5 text-right text-slate-500">{formatCurrency(avgSalary)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>

      <p className="text-xs text-slate-400">
        All costs include employer National Insurance (~13.8%) and employer pension (~5%) on-costs applied to salary × FTE.
        Forecast reflects current staff roster and known end dates. Planned (not yet started) staff are excluded.
      </p>
    </div>
  );
}
