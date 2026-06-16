import { SaleRecord, DailySalesData, CabinetRevenue } from '@/types';
import { mockCabinets } from './cabinets';
import { mockProducts } from './products';

function generateDailySales(days: number = 30): DailySalesData[] {
  const data: DailySalesData[] = [];
  const today = new Date();
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const baseSales = 1500 + Math.random() * 2000;
    const weekendBoost = date.getDay() === 0 || date.getDay() === 6 ? 1.3 : 1;
    
    data.push({
      date: date.toISOString().split('T')[0],
      sales: Math.round(baseSales * weekendBoost * 100) / 100,
      orders: Math.floor(50 + Math.random() * 80),
    });
  }
  
  return data;
}

export const mockDailySales: DailySalesData[] = generateDailySales(30);

export const mockCabinetRevenues: CabinetRevenue[] = mockCabinets.map(cabinet => {
  const todayRevenue = cabinet.todaySales;
  const weekRevenue = todayRevenue * (6 + Math.random());
  const monthRevenue = weekRevenue * (3.5 + Math.random() * 1.5);
  
  return {
    cabinetId: cabinet.id,
    cabinetName: cabinet.name,
    location: cabinet.location,
    todayRevenue,
    weekRevenue: Math.round(weekRevenue * 100) / 100,
    monthRevenue: Math.round(monthRevenue * 100) / 100,
    growthRate: Math.round((Math.random() * 40 - 10) * 10) / 10,
  };
});

function generateSaleRecords(count: number = 20): SaleRecord[] {
  const records: SaleRecord[] = [];
  const now = Date.now();
  
  for (let i = 0; i < count; i++) {
    const cabinet = mockCabinets[Math.floor(Math.random() * mockCabinets.length)];
    const product = mockProducts[Math.floor(Math.random() * mockProducts.length)];
    const quantity = 1 + Math.floor(Math.random() * 3);
    const paymentStatuses: SaleRecord['paymentStatus'][] = ['success', 'success', 'success', 'success', 'failed', 'pending', 'refunded'];
    
    records.push({
      id: `s${Date.now()}${i}`,
      cabinetId: cabinet.id,
      productId: product.id,
      product,
      quantity,
      amount: Math.round(product.currentPrice * quantity * 100) / 100,
      saleTime: new Date(now - Math.random() * 3600000 * 24),
      paymentStatus: paymentStatuses[Math.floor(Math.random() * paymentStatuses.length)],
    });
  }
  
  return records.sort((a, b) => b.saleTime.getTime() - a.saleTime.getTime());
}

export const mockSaleRecords: SaleRecord[] = generateSaleRecords(50);

export function getCabinetSales(cabinetId: string, days: number = 14): DailySalesData[] {
  const data: DailySalesData[] = [];
  const cabinet = mockCabinets.find(c => c.id === cabinetId);
  const today = new Date();
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const base = cabinet?.todaySales || 1000;
    const variation = 0.7 + Math.random() * 0.6;
    
    data.push({
      date: date.toISOString().split('T')[0],
      sales: Math.round(base * variation * 100) / 100,
      orders: Math.floor((cabinet?.todayOrders || 40) * variation),
    });
  }
  
  return data;
}
