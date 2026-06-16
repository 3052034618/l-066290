import React, { useMemo, useState } from 'react';
import { DollarSign, ShoppingCart, TrendingUp, Calendar, CreditCard, ArrowUpRight, Download, MousePointerClick } from 'lucide-react';
import { useAnalyticsStore } from '@/store/analyticsStore';
import StatCard from '@/components/ui/StatCard';
import LineAreaChart from '@/components/chart/LineAreaChart';
import BarChart from '@/components/chart/BarChart';
import MultiLineChart from '@/components/chart/MultiLineChart';
import EmptyState from '@/components/ui/EmptyState';
import CabinetDetailModal from './CabinetDetailModal';

const timeRanges: { key: '7d' | '14d' | '30d'; label: string }[] = [
  { key: '7d', label: '7天' },
  { key: '14d', label: '14天' },
  { key: '30d', label: '30天' },
];

const COMPARE_PALETTE = ['#1677FF', '#00B42A', '#FF7D00', '#F53F3F', '#722ED1', '#14C9C9', '#86909C', '#FFC53D'];
const MAX_CABINETS = 6;

const AnalyticsPage: React.FC = () => {
  const {
    dailySales,
    cabinetRevenues,
    timeRange,
    setTimeRange,
    getOverviewStats,
    getCabinetDailySales,
    exportDailyReport,
  } = useAnalyticsStore();

  const [selectedCabinetId, setSelectedCabinetId] = useState<string>('');
  const [showDetailModal, setShowDetailModal] = useState(false);

  const cabinetList = useMemo(() => {
    return cabinetRevenues.map((cr) => ({
      cabinetId: cr.cabinetId,
      cabinetName: cr.cabinetName,
    }));
  }, [cabinetRevenues]);

  const [selectedCabinetIds, setSelectedCabinetIds] = useState<string[]>(() => {
    return cabinetRevenues.slice(0, 3).map((cr) => cr.cabinetId);
  });

  const isCabinetSelected = (cabinetId: string) => selectedCabinetIds.includes(cabinetId);
  const canSelectMore = selectedCabinetIds.length < MAX_CABINETS;

  const toggleCabinet = (cabinetId: string) => {
    setSelectedCabinetIds((prev) => {
      if (prev.includes(cabinetId)) {
        return prev.filter((id) => id !== cabinetId);
      }
      if (prev.length >= MAX_CABINETS) {
        return prev;
      }
      return [...prev, cabinetId];
    });
  };

  const handleSelectAll = () => {
    setSelectedCabinetIds(cabinetList.slice(0, MAX_CABINETS).map((c) => c.cabinetId));
  };

  const handleClearAll = () => {
    setSelectedCabinetIds([]);
  };

  const selectedCabinets = useMemo(() => {
    return cabinetList.filter((c) => selectedCabinetIds.includes(c.cabinetId));
  }, [cabinetList, selectedCabinetIds]);

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
        cabinetId: cr.cabinetId,
        今日营收: cr.todayRevenue,
        本周营收: cr.weekRevenue,
      }));
  }, [cabinetRevenues]);

  const comparisonChartData = useMemo(() => {
    if (selectedCabinetIds.length === 0) return [] as Array<{ date: string; [key: string]: number | string }>;

    const allDates = new Set<string>();
    const cabinetSalesMap: Record<string, Record<string, { sales: number; orders: number }>> = {};

    selectedCabinetIds.forEach((cabinetId) => {
      const dailyData = getCabinetDailySales(cabinetId);
      cabinetSalesMap[cabinetId] = {};
      dailyData.forEach((d) => {
        allDates.add(d.date);
        cabinetSalesMap[cabinetId][d.date] = { sales: d.sales, orders: d.orders };
      });
    });

    const sortedDates = Array.from(allDates).sort();

    return sortedDates.map((date) => {
      const row: { date: string; [key: string]: number | string } = { date };
      selectedCabinetIds.forEach((cabinetId) => {
        const data = cabinetSalesMap[cabinetId][date];
        row[`${cabinetId}_sales`] = data ? data.sales : 0;
        row[`${cabinetId}_orders`] = data ? data.orders : 0;
      });
      return row;
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCabinetIds, timeRange, getCabinetDailySales]);

  const salesSeries = useMemo(() => {
    return selectedCabinets.map((cabinet, idx) => ({
      key: `${cabinet.cabinetId}_sales`,
      name: cabinet.cabinetName,
      color: COMPARE_PALETTE[idx % COMPARE_PALETTE.length],
    }));
  }, [selectedCabinets]);

  const ordersSeries = useMemo(() => {
    return selectedCabinets.map((cabinet, idx) => ({
      key: `${cabinet.cabinetId}_orders`,
      name: cabinet.cabinetName,
      color: COMPARE_PALETTE[idx % COMPARE_PALETTE.length],
    }));
  }, [selectedCabinets]);

  const handleBarClick = (data: { name: string; cabinetId?: string }) => {
    if (data.cabinetId) {
      setSelectedCabinetId(data.cabinetId);
      setShowDetailModal(true);
    }
  };

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

      <div className="card p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-neutral-800">点位销售对比</h3>
          <span className="text-sm text-neutral-500">
            已选 {selectedCabinetIds.length}/{MAX_CABINETS} 个货柜
          </span>
        </div>

        <div className="mb-4">
          <div className="flex items-center gap-4 mb-3">
            <button
              onClick={handleSelectAll}
              className="text-sm text-primary-600 hover:text-primary-700 font-medium transition-colors"
            >
              全选
            </button>
            <button
              onClick={handleClearAll}
              className="text-sm text-neutral-500 hover:text-neutral-700 font-medium transition-colors"
            >
              清空
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {cabinetList.map((cabinet) => {
              const selected = isCabinetSelected(cabinet.cabinetId);
              const disabled = !selected && !canSelectMore;
              return (
                <label
                  key={cabinet.cabinetId}
                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border cursor-pointer text-sm transition-all ${
                    selected
                      ? 'bg-primary-50 border-primary-200 text-primary-700'
                      : disabled
                      ? 'bg-neutral-50 border-neutral-100 text-neutral-300 cursor-not-allowed'
                      : 'bg-white border-neutral-200 text-neutral-600 hover:border-primary-200 hover:bg-primary-50/50'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selected}
                    disabled={disabled}
                    onChange={() => toggleCabinet(cabinet.cabinetId)}
                    className="w-4 h-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500 focus:ring-offset-0 disabled:cursor-not-allowed"
                  />
                  <span className="whitespace-nowrap">{cabinet.cabinetName}</span>
                </label>
              );
            })}
          </div>
        </div>

        {selectedCabinets.length === 0 ? (
          <EmptyState
            title="请选择货柜"
            description="选择至少一个货柜以查看销售对比数据"
          />
        ) : (
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-semibold text-neutral-700 mb-3">销售额对比</h4>
              <MultiLineChart
                data={comparisonChartData}
                series={salesSeries}
                height={280}
                yAxisFormatter="currency"
              />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-neutral-700 mb-3">订单数对比</h4>
              <MultiLineChart
                data={comparisonChartData}
                series={ordersSeries}
                height={280}
                yAxisFormatter="number"
              />
            </div>
          </div>
        )}
      </div>

      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-neutral-800">点位收益对比</h3>
          <span className="text-xs text-neutral-400 flex items-center gap-1">
            <MousePointerClick size={12} />
            点击柱状图查看点位详情
          </span>
        </div>
        <BarChart
          data={barChartData}
          height={320}
          dataKeys={[
            { key: '今日营收', name: '今日营收', color: '#1677FF' },
            { key: '本周营收', name: '本周营收', color: '#00B42A' },
          ]}
          onBarClick={handleBarClick}
        />
      </div>

      <CabinetDetailModal
        cabinetId={selectedCabinetId}
        isOpen={showDetailModal}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedCabinetId('');
        }}
      />
    </div>
  );
};

export default AnalyticsPage;
