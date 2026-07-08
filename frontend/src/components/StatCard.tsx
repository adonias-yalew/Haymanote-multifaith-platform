import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  trendUp?: boolean;
  color?: 'primary' | 'green' | 'amber' | 'red' | 'blue';
  className?: string;
}

const StatCard = ({
  title,
  value,
  icon: Icon,
  trend,
  trendUp,
  color = 'primary',
  className = '',
}: StatCardProps) => {
  const colors = {
    primary: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100',
    green: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100',
    amber: 'bg-amber-50 text-amber-700 ring-1 ring-amber-100',
    red: 'bg-rose-50 text-rose-700 ring-1 ring-rose-100',
    blue: 'bg-sky-50 text-sky-700 ring-1 ring-sky-100',
  };

  return (
    <div className={`group rounded-xl border border-slate-200 bg-white p-5 shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-hover ${className}`}>
      <div className="flex items-start justify-between mb-4">
        <div className={`w-11 h-11 rounded-lg flex items-center justify-center ${colors[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
        {trend && (
          <span
            className={`text-xs font-medium px-2 py-1 rounded-lg ${
              trendUp ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100' : 'bg-rose-50 text-rose-700 ring-1 ring-rose-100'
            }`}
          >
            {trendUp ? '↑' : '↓'} {trend}
          </span>
        )}
      </div>
      <p className="text-2xl font-semibold tracking-tight text-slate-950 mb-1">{value}</p>
      <p className="text-sm font-medium text-slate-500">{title}</p>
    </div>
  );
};

export default StatCard;
