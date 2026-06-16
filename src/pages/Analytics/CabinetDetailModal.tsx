import React, { useMemo } from 'react';
import { TrendingUp, TrendingDown, AlertTriangle, Package, DollarSign, MapPin, BarChart3, Calendar } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import StatCard from '@/components/ui/StatCard';
import LineAreaChart from '@/components/chart/LineAreaChart';
import StatusBadge from '@/components/ui/StatusBadge';
import CabinetSuggestionPanel from '@/components/business/CabinetSuggestionPanel';
import { useAnalyticsStore } from '@/store/analyticsStore';
import { formatCurrency } from '@/utils/format';

interface CabinetDetailModalProps {
  cabinetId: string;
  isOpen: boolean;
  onClose: () => void;
}

const CabinetDetailModal: React.FC<CabinetDetailModalProps> = ({ cabinetId, isOpen, onClose }) => {
  const { getCabinetDetail, timeRange } = useAnalyticsStore();
  
  const detail = useMemo(() => {
    if (!cabinetId) return null;
    return getCabinetDetail(cabinetId);
  }, [cabinetId, getCabinetDetail]);

  if (!detail) return null;

  const { cabinet, revenue, sales, exceptionCount, replenishmentCount, salesGrowth } = detail;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="点位经营详情" size="xl">
      <div className="space-y-5">
        <div className="flex items-start justify-between p-4 bg-gradient-to-r from-primary-50 to-primary-100/30 rounded-xl">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-lg font-bold text-neutral-800">{cabinet?.name}</h3>
              <StatusBadge status={cabinet?.status || 'online'} />
            </div>
            <div className="flex items-center gap-1 text-sm text-neutral-500">
              <MapPin size={14} />
              <span>{cabinet?.address}</span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-primary-600">{formatCurrency(revenue?.todayRevenue || 0)}</p>
            <p className="text-xs text-neutral-500">今日营收</p>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-3">
          <StatCard
            title="本周营收"
            value={revenue?.weekRevenue || 0}
            icon={DollarSign}
            iconBg="bg-success-50"
            iconColor="text-success-600"
            format="currency"
          />
          <StatCard
            title="本月营收"
            value={revenue?.monthRevenue || 0}
            icon={Calendar}
            iconBg="bg-warning-50"
            iconColor="text-warning-600"
            format="currency"
          />
          <StatCard
            title="销售增长"
            value={salesGrowth}
            icon={salesGrowth >= 0 ? TrendingUp : TrendingDown}
            iconBg={salesGrowth >= 0 ? 'bg-success-50' : 'bg-danger-50'}
            iconColor={salesGrowth >= 0 ? 'text-success-600' : 'text-danger-600'}
            format="percent"
          />
          <StatCard
            title="环比增长"
            value={revenue?.growthRate || 0}
            icon={BarChart3}
            iconBg={(revenue?.growthRate || 0) >= 0 ? 'bg-primary-50' : 'bg-danger-50'}
            iconColor={(revenue?.growthRate || 0) >= 0 ? 'text-primary-600' : 'text-danger-600'}
            format="percent"
          />
        </div>

        <div className="card p-4">
          <h4 className="text-sm font-semibold text-neutral-800 mb-3 flex items-center gap-2">
            <TrendingUp size={16} className="text-primary-500" />
            销售趋势
            <span className="text-xs font-normal text-neutral-400 ml-1">
              {timeRange === '7d' ? '近7天' : timeRange === '14d' ? '近14天' : '近30天'}
              <span className="mx-1">·</span>
              前后半周期对比增长 <span className={salesGrowth >= 0 ? 'text-success-600 font-medium' : 'text-danger-600 font-medium'}>{salesGrowth >= 0 ? '+' : ''}{salesGrowth.toFixed(1)}%</span>
            </span>
          </h4>
          <LineAreaChart data={sales} height={200} showOrders />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="card p-4">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-xl bg-warning-50 flex items-center justify-center">
                <AlertTriangle size={18} className="text-warning-600" />
              </div>
              <div>
                <p className="text-xs text-neutral-500">近30天异常次数</p>
                <p className="text-xl font-bold text-neutral-800">{exceptionCount}<span className="text-sm font-normal text-neutral-400 ml-1">次</span></p>
              </div>
            </div>
            <div className="text-xs text-neutral-500 bg-neutral-50 p-3 rounded-lg">
              {exceptionCount > 5 
                ? '该点位异常频发，建议增加巡检频率或排查设备稳定性问题' 
                : exceptionCount > 2 
                ? '该点位偶有异常，建议保持关注'
                : '该点位运行稳定，异常较少'
              }
            </div>
          </div>

          <div className="card p-4">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-xl bg-success-50 flex items-center justify-center">
                <Package size={18} className="text-success-600" />
              </div>
              <div>
                <p className="text-xs text-neutral-500">近30天补货次数</p>
                <p className="text-xl font-bold text-neutral-800">{replenishmentCount}<span className="text-sm font-normal text-neutral-400 ml-1">次</span></p>
              </div>
            </div>
            <div className="text-xs text-neutral-500 bg-neutral-50 p-3 rounded-lg">
              {replenishmentCount > 12
                ? '补货频次较高，说明该点位销量好，可考虑增加货柜或扩容'
                : replenishmentCount > 6
                ? '补货频次适中，运营状态良好'
                : '补货频次较低，可能需要优化选品或调整价格'
              }
            </div>
          </div>
        </div>

        <CabinetSuggestionPanel cabinetId={cabinetId} />
      </div>
    </Modal>
  );
};

export default CabinetDetailModal;
