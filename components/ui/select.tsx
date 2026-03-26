import { cn } from '@/lib/utils';
import { SelectHTMLAttributes } from 'react';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
}

export function Select({ label, className, children, ...props }: SelectProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-xs font-medium text-slate-600">{label}</label>}
      <select
        className={cn(
          'rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent',
          className
        )}
        {...props}
      >
        {children}
      </select>
    </div>
  );
}
