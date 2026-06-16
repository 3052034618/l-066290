import React from 'react';
import { TrendingUp } from 'lucide-react';
import LineAreaChart from '@/components/chart/LineAreaChart';
import { useAnalyticsStore } from '@/store/analyticsStore';

interface SalesChartProps {
  cabinetId: string;
}

const SalesChart: React.FC<SalesChartProps> = ({ cabinetId }) => {
  const { getCabinetDailySales, timeRange, setTimeRange } = useAnalyticsStore();
  const data = getCabinetDailySales(cabinetId);

  const totalSales = data.reduce((sum, d) => sum + d.sales, 0);
  const totalOrders = data.reduce((sum, d) => sum + (d.orders || 0), 0);

  return (
    <div className="card p-6 mb-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <TrendingUp size={20} className="text-primary-500" />
          <h2 className="text-lg font-semibold text-neutral-800">销售趋势</h2>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-neutral-50 rounded-lg p-1">
            {(['7d', '14d', '30d'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  timeRange === range
                    ? 'bg-white text-primary-600 shadow-sm'
                    : 'text-neutral-500 hover:text-neutral-700'
                }`}
              >
                {range === '7d' ? '7天' : range === '14d' ? '14天' : '30天'}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-6">
            <div>
              <p className="text-xs text-neutral-500">累计销售额</p>
              <p className="text-lg font-bold text-primary-600">¥{totalSales.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-xs text-neutral-500">累计订单</p>
              <p className="text-lg font-bold text-neutral-800">{totalOrders}<span className="text-sm font-normal text-neutral-500 ml-1">单</span></p>
            </div>
          </div>
        </div>
      </div>
      <LineAreaChart data={data} showOrders height={260} />
    </div>
  );
};

export default SalesChart;
