import React from 'react';
import { getStatusText, getStatusClass, getSeverityText, getSeverityClass } from '@/utils/format';

interface StatusBadgeProps {
  status: string;
  type?: 'status' | 'severity';
  customText?: string;
  customClass?: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  type = 'status',
  customText,
  customClass,
}) => {
  const text = customText || (type === 'severity' ? getSeverityText(status) : getStatusText(status));
  const className = customClass || (type === 'severity' ? getSeverityClass(status) : getStatusClass(status));

  return (
    <span className={className}>
      {text}
    </span>
  );
};

export default StatusBadge;
