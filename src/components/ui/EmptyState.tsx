import React from 'react';
import { Inbox } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  title = '暂无数据',
  description = '当前没有符合条件的数据',
  icon,
  action,
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="w-16 h-16 rounded-2xl bg-neutral-100 flex items-center justify-center mb-4">
        {icon || <Inbox size={32} className="text-neutral-400" />}
      </div>
      <h4 className="text-base font-semibold text-neutral-700 mb-1">{title}</h4>
      <p className="text-sm text-neutral-500 mb-4 text-center">{description}</p>
      {action}
    </div>
  );
};

export default EmptyState;
