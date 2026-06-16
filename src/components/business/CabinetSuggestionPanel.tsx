import React, { useMemo } from 'react';
import { Lightbulb, Tag, Search, TrendingUp, AlertTriangle, Package, CheckCircle } from 'lucide-react';
import { useAnalyticsStore, CabinetSuggestion } from '@/store/analyticsStore';

interface CabinetSuggestionPanelProps {
  cabinetId: string;
  compact?: boolean;
}

const getIcon = (type: CabinetSuggestion['type']) => {
  const map = {
    price: Tag,
    inspection: Search,
    expansion: TrendingUp,
    selection: Package,
    positive: CheckCircle,
    warning: AlertTriangle,
  };
  return map[type] || Lightbulb;
};

const getStyles = (type: CabinetSuggestion['type'], priority: CabinetSuggestion['priority']) => {
  const priorityBg = {
    high: {
      price: 'bg-danger-50 border-danger-100 text-danger-700',
      inspection: 'bg-warning-50 border-warning-100 text-warning-700',
      expansion: 'bg-primary-50 border-primary-100 text-primary-700',
      selection: 'bg-danger-50 border-danger-100 text-danger-700',
      positive: 'bg-success-50 border-success-100 text-success-700',
      warning: 'bg-warning-50 border-warning-100 text-warning-700',
    },
    medium: {
      price: 'bg-warning-50 border-warning-100 text-warning-700',
      inspection: 'bg-warning-50 border-warning-100 text-warning-700',
      expansion: 'bg-primary-50 border-primary-100 text-primary-700',
      selection: 'bg-warning-50 border-warning-100 text-warning-700',
      positive: 'bg-success-50 border-success-100 text-success-700',
      warning: 'bg-warning-50 border-warning-100 text-warning-700',
    },
    low: {
      price: 'bg-neutral-50 border-neutral-100 text-neutral-600',
      inspection: 'bg-neutral-50 border-neutral-100 text-neutral-600',
      expansion: 'bg-neutral-50 border-neutral-100 text-neutral-600',
      selection: 'bg-neutral-50 border-neutral-100 text-neutral-600',
      positive: 'bg-success-50/50 border-success-100 text-success-600',
      warning: 'bg-neutral-50 border-neutral-100 text-neutral-600',
    },
  };
  return priorityBg[priority][type] || priorityBg.low.positive;
};

const getIconBg = (type: CabinetSuggestion['type']) => {
  const map = {
    price: 'bg-danger-100 text-danger-600',
    inspection: 'bg-warning-100 text-warning-600',
    expansion: 'bg-primary-100 text-primary-600',
    selection: 'bg-danger-100 text-danger-600',
    positive: 'bg-success-100 text-success-600',
    warning: 'bg-warning-100 text-warning-600',
  };
  return map[type] || 'bg-neutral-100 text-neutral-600';
};

const CabinetSuggestionPanel: React.FC<CabinetSuggestionPanelProps> = ({ cabinetId, compact = false }) => {
  const { generateCabinetSuggestions, timeRange } = useAnalyticsStore();
  
  const suggestions = useMemo(() => generateCabinetSuggestions(cabinetId), [cabinetId, generateCabinetSuggestions, timeRange]); // eslint-disable-line react-hooks/exhaustive-deps

  if (suggestions.length === 0) return null;

  return (
    <div className={compact ? '' : 'card p-5'}>
      {!compact && (
        <div className="flex items-center gap-2 mb-4">
          <div className="w-9 h-9 rounded-xl bg-primary-50 flex items-center justify-center">
            <Lightbulb size={18} className="text-primary-600" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-neutral-800">运营建议</h3>
            <p className="text-xs text-neutral-500">基于销售、异常、库存数据智能生成</p>
          </div>
          <span className="ml-auto badge-primary">{suggestions.length}条建议</span>
        </div>
      )}
      <div className={`space-y-2 ${compact ? '' : ''}`}>
        {suggestions.map((s, idx) => {
          const Icon = getIcon(s.type);
          return (
            <div
              key={idx}
              className={`flex items-start gap-3 p-3 rounded-xl border ${getStyles(s.type, s.priority)} transition-all hover:shadow-sm`}
            >
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${getIconBg(s.type)}`}>
                <Icon size={14} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm leading-relaxed">{s.text}</p>
              </div>
              {s.priority === 'high' && (
                <span className="flex-shrink-0 text-[10px] font-semibold px-1.5 py-0.5 rounded bg-white/60">
                  优先
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CabinetSuggestionPanel;
