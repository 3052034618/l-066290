import { Product, ProductInventory } from '@/types';

export const mockProducts: Product[] = [
  { id: 'p001', name: '可口可乐 500ml', category: '饮料', basePrice: 3.5, currentPrice: 3.5, shelfLifeDays: 180, image: '' },
  { id: 'p002', name: '百事可乐 500ml', category: '饮料', basePrice: 3.5, currentPrice: 3.5, shelfLifeDays: 180, image: '' },
  { id: 'p003', name: '农夫山泉 550ml', category: '饮料', basePrice: 2.0, currentPrice: 2.0, shelfLifeDays: 730, image: '' },
  { id: 'p004', name: '康师傅冰红茶 500ml', category: '饮料', basePrice: 3.0, currentPrice: 3.0, shelfLifeDays: 365, image: '' },
  { id: 'p005', name: '元气森林气泡水 480ml', category: '饮料', basePrice: 5.5, currentPrice: 5.5, shelfLifeDays: 270, image: '' },
  { id: 'p006', name: '乐事薯片 原味 70g', category: '零食', basePrice: 6.5, currentPrice: 6.5, shelfLifeDays: 180, image: '' },
  { id: 'p007', name: '奥利奥饼干 原味 116g', category: '零食', basePrice: 8.9, currentPrice: 8.9, shelfLifeDays: 270, image: '' },
  { id: 'p008', name: '士力架 花生夹心 51g', category: '零食', basePrice: 5.0, currentPrice: 5.0, shelfLifeDays: 365, image: '' },
  { id: 'p009', name: '德芙巧克力 丝滑牛奶 43g', category: '零食', basePrice: 10.5, currentPrice: 10.5, shelfLifeDays: 540, image: '' },
  { id: 'p010', name: '每日坚果 25g', category: '零食', basePrice: 6.0, currentPrice: 6.0, shelfLifeDays: 180, image: '' },
  { id: 'p011', name: '星巴克美式 270ml', category: '咖啡', basePrice: 15.0, currentPrice: 15.0, shelfLifeDays: 90, image: '' },
  { id: 'p012', name: '雀巢拿铁 268ml', category: '咖啡', basePrice: 12.0, currentPrice: 12.0, shelfLifeDays: 180, image: '' },
  { id: 'p013', name: '三得利乌龙茶 500ml', category: '茶饮', basePrice: 5.0, currentPrice: 5.0, shelfLifeDays: 365, image: '' },
  { id: 'p014', name: '东方树叶 绿茶 500ml', category: '茶饮', basePrice: 5.5, currentPrice: 5.5, shelfLifeDays: 365, image: '' },
  { id: 'p015', name: '蒙牛纯牛奶 250ml', category: '乳品', basePrice: 4.5, currentPrice: 4.5, shelfLifeDays: 45, image: '' },
  { id: 'p016', name: '伊利酸奶 100g', category: '乳品', basePrice: 5.5, currentPrice: 5.5, shelfLifeDays: 21, image: '' },
];

function generateInventory(cabinetId: string): ProductInventory[] {
  const inventories: ProductInventory[] = [];
  const today = new Date();
  
  mockProducts.forEach((product, idx) => {
    const maxStock = 20 + Math.floor(Math.random() * 20);
    const minThreshold = Math.floor(maxStock * 0.2);
    let currentStock: number;
    
    if (cabinetId === 'c002' || cabinetId === 'c008') {
      currentStock = Math.floor(Math.random() * minThreshold);
    } else {
      currentStock = minThreshold + Math.floor(Math.random() * (maxStock - minThreshold));
    }
    
    inventories.push({
      id: `inv-${cabinetId}-${product.id}`,
      cabinetId,
      productId: product.id,
      product,
      currentStock,
      maxStock,
      minStockThreshold: minThreshold,
      isOnShelf: idx % 15 !== 14,
      expiryDate: new Date(today.getTime() + (30 + Math.floor(Math.random() * 150)) * 24 * 60 * 60 * 1000),
    });
  });
  
  return inventories;
}

export const mockInventories: Record<string, ProductInventory[]> = {
  c001: generateInventory('c001'),
  c002: generateInventory('c002'),
  c003: generateInventory('c003'),
  c004: generateInventory('c004'),
  c005: generateInventory('c005'),
  c006: generateInventory('c006'),
  c007: generateInventory('c007'),
  c008: generateInventory('c008'),
  c009: generateInventory('c009'),
  c010: generateInventory('c010'),
  c011: generateInventory('c011'),
  c012: generateInventory('c012'),
};

export function getAllInventories(): ProductInventory[] {
  return Object.values(mockInventories).flat();
}

export function getExpiringInventories(days: number = 7): ProductInventory[] {
  const threshold = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
  return getAllInventories().filter(inv => inv.isOnShelf && inv.expiryDate <= threshold);
}

export function getLowStockInventories(): ProductInventory[] {
  return getAllInventories().filter(inv => inv.currentStock <= inv.minStockThreshold && inv.isOnShelf);
}
