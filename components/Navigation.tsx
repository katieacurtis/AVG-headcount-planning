'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  BarChart3,
  ClipboardList,
  PoundSterling,
  Stethoscope,
  HeartPulse,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/planning', label: 'Headcount Planning', icon: BarChart3 },
  { href: '/staff', label: 'Staff Roster', icon: Users },
  { href: '/recruitment', label: 'Recruitment', icon: ClipboardList },
  { href: '/payroll', label: 'Payroll Forecast', icon: PoundSterling },
  { href: '/locums', label: 'Locum Coverage', icon: Stethoscope },
];

export function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col h-full bg-slate-900 text-white w-60 shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-slate-700">
        <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center shrink-0">
          <HeartPulse className="w-4 h-4 text-white" />
        </div>
        <div>
          <p className="text-sm font-bold leading-tight">AVG</p>
          <p className="text-xs text-slate-400 leading-tight">Resource Planning</p>
        </div>
      </div>

      {/* Nav links */}
      <div className="flex-1 py-4 overflow-y-auto">
        <div className="space-y-0.5 px-3">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || (href !== '/' && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
                  active
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                )}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {label}
              </Link>
            );
          })}
        </div>
      </div>

      <div className="px-5 py-4 border-t border-slate-700">
        <p className="text-xs text-slate-500">7 Sites · 63 Staff</p>
      </div>
    </nav>
  );
}
