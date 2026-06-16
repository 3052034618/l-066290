import { create } from 'zustand';
import { DailySalesData, CabinetRevenue, SaleRecord, Cabinet } from '@/types';
import { mockDailySales, mockCabinetRevenues, mockSaleRecords, getCabinetSales } from '@/mock/sales';
import { mockCabinets } from '@/mock/cabinets';
import { mockExceptions } from '@/mock/exceptions';
import { mockTasks } from '@/mock/tasks';
import { useProductStore } from './productStore';

export interface CabinetSuggestion {
  type: 'price' | 'inspection' | 'expansion' | 'selection' | 'positive' | 'warning';
  text: string;
  priority: 'high' | 'medium' | 'low';
}

interface CabinetDetailResult {
  cabinet: Cabinet | undefined;
  revenue: CabinetRevenue | undefined;
  sales: DailySalesData[];
  exceptionCount: number;
  replenishmentCount: number;
  salesGrowth: number;
  lowStockCount: number;
}

function generateSuggestionsFromDetail(detail: CabinetDetailResult): CabinetSuggestion[] {
  const { revenue, exceptionCount, replenishmentCount, salesGrowth, lowStockCount } = detail;
  const suggestions: CabinetSuggestion[] = [];

  if (salesGrowth > 8) {
    suggestions.push({
      type: 'expansion',
      text: `销售增长${salesGrowth.toFixed(1)}%，势头强劲，建议评估增设货柜或扩容的可行性`,
      priority: 'high',
    });
    if (replenishmentCount > 10) {
      suggestions.push({
        type: 'inspection',
        text: `补货频次高（近30天${replenishmentCount}次），建议加密巡视频次，避免热门商品断货`,
        priority: 'medium',
      });
    }
  } else if (salesGrowth > 3) {
    suggestions.push({
      type: 'positive',
      text: `销售稳步增长${salesGrowth.toFixed(1)}%，保持当前运营策略，持续关注`,
      priority: 'low',
    });
  } else if (salesGrowth < -8) {
    suggestions.push({
      type: 'selection',
      text: `销售下滑${Math.abs(salesGrowth).toFixed(1)}%，建议优化选品结构，更换滞销商品`,
      priority: 'high',
    });
    suggestions.push({
      type: 'price',
      text: `销售持续下滑，建议调研周边竞品价格，考虑针对性调价或推出促销`,
      priority: 'high',
    });
  } else if (salesGrowth < -3) {
    suggestions.push({
      type: 'warning',
      text: `销售出现下滑${Math.abs(salesGrowth).toFixed(1)}%，建议加强该点位巡检，排查原因`,
      priority: 'medium',
    });
  }

  if (exceptionCount > 5) {
    suggestions.push({
      type: 'inspection',
      text: `近30天异常${exceptionCount}次，频发，建议加密巡检频次并全面排查设备`,
      priority: 'high',
    });
  } else if (exceptionCount > 2) {
    suggestions.push({
      type: 'inspection',
      text: `近30天异常${exceptionCount}次，建议关注设备稳定性，适当增加巡检`,
      priority: 'medium',
    });
  }

  if (lowStockCount > 4) {
    suggestions.push({
      type: 'warning',
      text: `当前有${lowStockCount}件商品库存偏低，建议尽快安排补货`,
      priority: 'high',
    });
  }

  if (revenue && revenue.growthRate > 15) {
    suggestions.push({
      type: 'expansion',
      text: `环比增长${revenue.growthRate}%，该点位价值高，可考虑作为重点点位经验复制`,
      priority: 'medium',
    });
  }

  if (suggestions.length === 0) {
    suggestions.push({
      type: 'positive',
      text: '该点位整体运营平稳，销量、异常、补货均在正常范围，保持现有策略',
      priority: 'low',
    });
  }

  return suggestions.sort((a, b) => {
    const order = { high: 0, medium: 1, low: 2 };
    return order[a.priority] - order[b.priority];
  });
}

interface CachedDetail {
  data: CabinetDetailResult;
  suggestions: CabinetSuggestion[];
  timeRange: '7d' | '14d' | '30d';
  date: string;
}

interface AnalyticsState {
  dailySales: DailySalesData[];
  cabinetRevenues: CabinetRevenue[];
  saleRecords: SaleRecord[];
  selectedCabinetIds: string[];
  timeRange: '7d' | '14d' | '30d';
  cachedDetails: Record<string, CachedDetail>;
  setSelectedCabinetIds: (ids: string[]) => void;
  setTimeRange: (range: '7d' | '14d' | '30d') => void;
  getOverviewStats: () => {
    todayRevenue: number;
    todayOrders: number;
    weekRevenue: number;
    monthRevenue: number;
    avgOrderValue: number;
    growthRate: number;
  };
  getCabinetDailySales: (cabinetId: string) => DailySalesData[];
  getCabinetDetail: (cabinetId: string) => CabinetDetailResult | null;
  generateCabinetSuggestions: (cabinetId: string) => CabinetSuggestion[];
  getPaymentExceptions: () => SaleRecord[];
  exportDailyReport: () => string;
}

export const useAnalyticsStore = create<AnalyticsState>((set, get) => ({
  dailySales: mockDailySales,
  cabinetRevenues: mockCabinetRevenues,
  saleRecords: mockSaleRecords,
  selectedCabinetIds: [],
  timeRange: '14d',
  cachedDetails: {},

  setSelectedCabinetIds: (ids) => set({ selectedCabinetIds: ids }),
  setTimeRange: (range) => set({ timeRange: range, cachedDetails: {} }),

  getOverviewStats: () => {
    const { dailySales, cabinetRevenues } = get();
    const today = dailySales[dailySales.length - 1];
    const yesterday = dailySales[dailySales.length - 2];
    const weekData = dailySales.slice(-7);
    const monthRevenue = cabinetRevenues.reduce((sum, c) => sum + c.monthRevenue, 0);
    const weekRevenue = weekData.reduce((sum, d) => sum + d.sales, 0);
    const totalOrders = dailySales.reduce((sum, d) => sum + d.orders, 0);
    const totalRevenue = dailySales.reduce((sum, d) => sum + d.sales, 0);
    const growthRate = yesterday ? ((today.sales - yesterday.sales) / yesterday.sales) * 100 : 0;

    return {
      todayRevenue: today?.sales || 0,
      todayOrders: today?.orders || 0,
      weekRevenue: Math.round(weekRevenue * 100) / 100,
      monthRevenue: Math.round(monthRevenue * 100) / 100,
      avgOrderValue: totalOrders > 0 ? Math.round((totalRevenue / totalOrders) * 100) / 100 : 0,
      growthRate: Math.round(growthRate * 10) / 10,
    };
  },

  getCabinetDailySales: (cabinetId) => {
    const days = get().timeRange === '7d' ? 7 : get().timeRange === '14d' ? 14 : 30;
    return getCabinetSales(cabinetId, days);
  },

  getPaymentExceptions: () => {
    return get().saleRecords.filter((r) => r.paymentStatus !== 'success');
  },

  getCabinetDetail: (cabinetId) => {
    const { cachedDetails, timeRange } = get();
    const todayStr = new Date().toISOString().split('T')[0];
    const cacheKey = `${cabinetId}`;

    if (
      cachedDetails[cacheKey] &&
      cachedDetails[cacheKey].timeRange === timeRange &&
      cachedDetails[cacheKey].date === todayStr
    ) {
      return cachedDetails[cacheKey].data;
    }

    const cabinet = mockCabinets.find((c) => c.id === cabinetId);
    const revenue = get().cabinetRevenues.find((r) => r.cabinetId === cabinetId);
    const sales = get().getCabinetDailySales(cabinetId);

    if (!cabinet || !revenue) return null;

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const thirtyDaysAgo = todayStart.getTime() - 30 * 24 * 60 * 60 * 1000;

    const exceptionCount = mockExceptions.filter(
      (e) => e.cabinetId === cabinetId && new Date(e.createdAt).getTime() > thirtyDaysAgo
    ).length;

    const replenishmentCount = mockTasks.filter(
      (t) =>
        t.cabinetId === cabinetId &&
        t.type === 'replenishment' &&
        new Date(t.createdAt).getTime() > thirtyDaysAgo
    ).length;

    const { inventories } = useProductStore.getState();
    const lowStockCount = inventories.filter(
      (inv) =>
        inv.cabinetId === cabinetId && inv.currentStock <= inv.minStockThreshold && inv.isOnShelf
    ).length;

    const halfLen = Math.floor(sales.length / 2);
    const firstHalf = sales.slice(0, halfLen);
    const secondHalf = sales.slice(halfLen);
    const firstAvg =
      firstHalf.length > 0
        ? firstHalf.reduce((s, d) => s + d.sales, 0) / firstHalf.length
        : 0;
    const secondAvg =
      secondHalf.length > 0
        ? secondHalf.reduce((s, d) => s + d.sales, 0) / secondHalf.length
        : 0;
    const salesGrowth =
      firstAvg > 0 ? Math.round(((secondAvg - firstAvg) / firstAvg) * 1000) / 10 : 0;

    const data: CabinetDetailResult = {
      cabinet,
      revenue,
      sales,
      exceptionCount,
      replenishmentCount,
      salesGrowth,
      lowStockCount,
    };

    const suggestions = generateSuggestionsFromDetail(data);

    set((state) => ({
      cachedDetails: {
        ...state.cachedDetails,
        [cacheKey]: {
          data,
          suggestions,
          timeRange,
          date: todayStr,
        },
      },
    }));

    return data;
  },

  generateCabinetSuggestions: (cabinetId): CabinetSuggestion[] => {
    const { cachedDetails, timeRange } = get();
    const todayStr = new Date().toISOString().split('T')[0];
    const cacheKey = `${cabinetId}`;

    if (
      cachedDetails[cacheKey] &&
      cachedDetails[cacheKey].timeRange === timeRange &&
      cachedDetails[cacheKey].date === todayStr
    ) {
      return cachedDetails[cacheKey].suggestions;
    }

    const detail = get().getCabinetDetail(cabinetId);
    if (!detail) return [];

    return cachedDetails[cacheKey]?.suggestions || generateSuggestionsFromDetail(detail);
  },

  exportDailyReport: () => {
    const stats = get().getOverviewStats();
    const revenues = get().cabinetRevenues;

    let report = '智慧零售运营日报\n';
    report += `生成时间: ${new Date().toLocaleString('zh-CN')}\n\n`;
    report += '=== 整体概览 ===\n';
    report += `今日营收: ¥${stats.todayRevenue.toFixed(2)}\n`;
    report += `今日订单: ${stats.todayOrders}单\n`;
    report += `本周营收: ¥${stats.weekRevenue.toFixed(2)}\n`;
    report += `本月营收: ¥${stats.monthRevenue.toFixed(2)}\n`;
    report += `客单价: ¥${stats.avgOrderValue.toFixed(2)}\n\n`;
    report += '=== 各货柜营收排行 ===\n';

    const sortedRevenues = [...revenues].sort((a, b) => b.todayRevenue - a.todayRevenue);
    sortedRevenues.forEach((r, idx) => {
      report += `${idx + 1}. ${r.cabinetName} - 今日:¥${r.todayRevenue.toFixed(2)} 本周:¥${r.weekRevenue.toFixed(2)} 环比:${r.growthRate >= 0 ? '+' : ''}${r.growthRate}%\n`;
    });

    return report;
  },
}));
