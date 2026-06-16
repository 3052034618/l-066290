import { create } from 'zustand';
import { DailySalesData, CabinetRevenue, SaleRecord } from '@/types';
import { mockDailySales, mockCabinetRevenues, mockSaleRecords, getCabinetSales } from '@/mock/sales';

interface AnalyticsState {
  dailySales: DailySalesData[];
  cabinetRevenues: CabinetRevenue[];
  saleRecords: SaleRecord[];
  selectedCabinetIds: string[];
  timeRange: '7d' | '14d' | '30d';
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
  getPaymentExceptions: () => SaleRecord[];
  exportDailyReport: () => string;
}

export const useAnalyticsStore = create<AnalyticsState>((set, get) => ({
  dailySales: mockDailySales,
  cabinetRevenues: mockCabinetRevenues,
  saleRecords: mockSaleRecords,
  selectedCabinetIds: [],
  timeRange: '14d',
  
  setSelectedCabinetIds: (ids) => set({ selectedCabinetIds: ids }),
  setTimeRange: (range) => set({ timeRange: range }),
  
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
    return get().saleRecords.filter(r => r.paymentStatus !== 'success');
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
