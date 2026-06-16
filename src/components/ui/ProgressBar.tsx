import React from 'react';

interface ProgressBarProps {
  value: number;
  max?: number;
  showLabel?: boolean;
  height?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'success' | 'warning' | 'danger';
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  showLabel = false,
  height = 'md',
  variant = 'default',
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  
  const heightClass = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3',
  }[height];

  const colorClass = {
    default: percentage < 30 ? 'bg-danger-500' : percentage < 60 ? 'bg-warning-500' : 'bg-success-500',
    success: 'bg-success-500',
    warning: 'bg-warning-500',
    danger: 'bg-danger-500',
  }[variant];

  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex justify-between mb-1">
          <span className="text-xs text-neutral-500">库存</span>
          <span className="text-xs font-medium text-neutral-700">{Math.round(percentage)}%</span>
        </div>
      )}
      <div className={`progress-bar ${heightClass}`}>
        <div 
          className={`progress-bar-fill ${colorClass}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
