import React from 'react';
import { AlertCircle, ChevronRight } from 'lucide-react';
import StatusBadge from '@/components/ui/StatusBadge';
import { ExceptionRecord } from '@/types';
import { formatRelativeTime } from '@/utils/date';
import { getExceptionTypeText } from '@/utils/format';

interface ExceptionHistoryProps {
  exceptions: ExceptionRecord[];
}

const ExceptionHistory: React.FC<ExceptionHistoryProps> = ({ exceptions }) => {
  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <AlertCircle size={20} className="text-danger-500" />
          <h2 className="text-lg font-semibold text-neutral-800">异常记录</h2>
        </div>
        <span className="text-sm text-neutral-500">
          共 <span className="font-semibold text-neutral-800">{exceptions.length}</span> 条记录
        </span>
      </div>

      {exceptions.length === 0 ? (
        <div className="py-12 text-center">
          <AlertCircle size={40} className="mx-auto text-neutral-300 mb-3" />
          <p className="text-neutral-500">暂无异常记录</p>
        </div>
      ) : (
        <div className="space-y-3">
          {exceptions.slice(0, 5).map((exp) => (
            <div
              key={exp.id}
              className="flex items-center gap-4 p-4 rounded-xl bg-neutral-50 hover:bg-neutral-100/70 transition-colors group cursor-pointer"
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                exp.severity === 'critical' || exp.severity === 'high' 
                  ? 'bg-danger-50 text-danger-600' 
                  : exp.severity === 'medium'
                  ? 'bg-warning-50 text-warning-600'
                  : 'bg-success-50 text-success-600'
              }`}>
                <AlertCircle size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm font-medium text-neutral-800 truncate">{exp.description}</p>
                  <StatusBadge status={exp.status} />
                </div>
                <div className="flex items-center gap-3 text-xs text-neutral-500">
                  <span>{getExceptionTypeText(exp.type)}</span>
                  <span>·</span>
                  <span>{formatRelativeTime(exp.createdAt)}</span>
                  {exp.handlerName && (
                    <>
                      <span>·</span>
                      <span>处理人：{exp.handlerName}</span>
                    </>
                  )}
                </div>
              </div>
              <ChevronRight size={18} className="text-neutral-400 group-hover:text-neutral-600 transition-colors flex-shrink-0" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ExceptionHistory;
