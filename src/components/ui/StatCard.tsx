import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { formatCurrency, formatNumber } from '@/utils/format';

interface StatCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  iconBg?: string;
  iconColor?: string;
  trend?: number;
  format?: 'currency' | 'number' | 'percent';
  suffix?: string;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon: Icon,
  iconBg = 'bg-primary-50',
  iconColor = 'text-primary-600',
  trend,
  format = 'number',
  suffix,
}) => {
  const formattedValue = format === 'currency' 
    ? formatCurrency(value)
    : format === 'percent'
    ? `${value}%`
    : formatNumber(value);

  const trendPositive = trend !== undefined && trend >= 0;

  return (
    <div className="card p-5 hover:shadow-card-hover transition-all duration-300">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-neutral-500 font-medium mb-2">{title}</p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-neutral-800 tracking-tight">
              {formattedValue}
              {suffix && <span className="text-sm font-normal text-neutral-500 ml-1">{suffix}</span>}
            </span>
            {trend !== undefined && (
              <span className={`inline-flex items-center gap-0.5 text-xs font-medium ${trendPositive ? 'text-success-600' : 'text-danger-600'}`}>
                {trendPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                {Math.abs(trend)}%
              </span>
            )}
          </div>
        </div>
        <div className={`w-12 h-12 rounded-xl ${iconBg} flex items-center justify-center`}>
          <Icon size={24} className={iconColor} />
        </div>
      </div>
    </div>
  );
};

export default StatCard;
