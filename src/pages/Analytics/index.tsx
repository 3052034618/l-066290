import React, { useMemo } from 'react';
import { DollarSign, ShoppingCart, TrendingUp, Calendar, CreditCard, ArrowUpRight, Download } from 'lucide-react';
import { useAnalyticsStore } from '@/store/analyticsStore';
import StatCard from '@/components/ui/StatCard';
import LineAreaChart from '@/components/chart/LineAreaChart';
import BarChart from '@/components/chart/BarChart';

const timeRanges: { key: '7d' | '14d' | '30d'; label: string }[] = [
  { key: '7d', label: '7天' },
  { key: '14d', label: '14天' },
  { key: '30d', label: '30天' },
];

const AnalyticsPage: React.FC = () => {
  const {
    dailySales,
    cabinetRevenues,
    timeRange,
    setTimeRange,
    getOverviewStats,
    exportDailyReport,
  } = useAnalyticsStore();

  const stats = getOverviewStats();

  const filteredDailySales = useMemo(() => {
    const days = timeRange === '7d' ? 7 : timeRange === '14d' ? 14 : 30;
    return dailySales.slice(-days);
  }, [dailySales, timeRange]);

  const barChartData = useMemo(() => {
    return cabinetRevenues
      .slice(0, 8)
      .map((cr) => ({
        name: cr.cabinetName,
        今日营收: cr.todayRevenue,
        本周营收: cr.weekRevenue,
      }));
  }, [cabinetRevenues]);

  const handleExportReport = () => {
    const report = exportDailyReport();
    const blob = new Blob([report], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const date = new Date().toISOString().split('T')[0];
    link.download = `运营日报_${date}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-800 mb-1">经营分析</h1>
          <p className="text-sm text-neutral-500">全面掌握销售趋势和点位经营表现</p>
        </div>
        <button onClick={handleExportReport} className="btn-primary">
          <Download size={16} className="mr-1.5" />
          导出日报
        </button>
      </div>

      <div className="grid grid-cols-6 gap-4 mb-6">
        <StatCard
          title="今日营收"
          value={stats.todayRevenue}
          icon={DollarSign}
          iconBg="bg-primary-50"
          iconColor="text-primary-600"
          format="currency"
          trend={stats.growthRate}
        />
        <StatCard
          title="订单数"
          value={stats.todayOrders}
          icon={ShoppingCart}
          iconBg="bg-success-50"
          iconColor="text-success-600"
          suffix="单"
        />
        <StatCard
          title="本周营收"
          value={stats.weekRevenue}
          icon={Calendar}
          iconBg="bg-warning-50"
          iconColor="text-warning-600"
          format="currency"
        />
        <StatCard
          title="本月营收"
          value={stats.monthRevenue}
          icon={TrendingUp}
          iconBg="bg-danger-50"
          iconColor="text-danger-600"
          format="currency"
        />
        <StatCard
          title="客单价"
          value={stats.avgOrderValue}
          icon={CreditCard}
          iconBg="bg-info-50"
          iconColor="text-info-600"
          format="currency"
        />
        <StatCard
          title="增长率"
          value={stats.growthRate}
          icon={ArrowUpRight}
          iconBg={stats.growthRate >= 0 ? 'bg-success-50' : 'bg-danger-50'}
          iconColor={stats.growthRate >= 0 ? 'text-success-600' : 'text-danger-600'}
          format="percent"
        />
      </div>

      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-neutral-800">销售趋势</h2>
        <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-neutral-100">
          {timeRanges.map((range) => (
            <button
              key={range.key}
              onClick={() => setTimeRange(range.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                timeRange === range.key
                  ? 'bg-primary-500 text-white'
                  : 'text-neutral-600 hover:bg-neutral-50'
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      <div className="card p-6 mb-6">
        <LineAreaChart data={filteredDailySales} height={300} showOrders />
      </div>

      <div className="card p-6">
        <h3 className="text-lg font-semibold text-neutral-800 mb-4">点位收益对比</h3>
        <BarChart
          data={barChartData}
          height={320}
          dataKeys={[
            { key: '今日营收', name: '今日营收', color: '#1677FF' },
            { key: '本周营收', name: '本周营收', color: '#00B42A' },
          ]}
        />
      </div>
    </div>
  );
};

export default AnalyticsPage;
