export type CabinetStatus = 'online' | 'offline' | 'low_stock' | 'fault' | 'maintenance';

export interface Cabinet {
  id: string;
  name: string;
  location: string;
  address: string;
  latitude: number;
  longitude: number;
  status: CabinetStatus;
  temperature: number;
  networkStatus: 'good' | 'normal' | 'weak';
  onlineMinutes: number;
  lastOnline: Date;
  todaySales: number;
  todayOrders: number;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  basePrice: number;
  currentPrice: number;
  shelfLifeDays: number;
  image: string;
}

export interface ProductInventory {
  id: string;
  cabinetId: string;
  productId: string;
  product?: Product;
  currentStock: number;
  maxStock: number;
  minStockThreshold: number;
  isOnShelf: boolean;
  expiryDate: Date;
}

export type PaymentStatus = 'success' | 'failed' | 'pending' | 'refunded';

export interface SaleRecord {
  id: string;
  cabinetId: string;
  productId: string;
  product?: Product;
  quantity: number;
  amount: number;
  saleTime: Date;
  paymentStatus: PaymentStatus;
}

export type ExceptionType = 'device_fault' | 'payment_error' | 'temperature_abnormal' | 'network_error';
export type ExceptionStatus = 'pending' | 'processing' | 'resolved';
export type ExceptionSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface ExceptionRecord {
  id: string;
  cabinetId: string;
  cabinet?: Cabinet;
  type: ExceptionType;
  severity: ExceptionSeverity;
  status: ExceptionStatus;
  description: string;
  handlerId?: string;
  handlerName?: string;
  createdAt: Date;
  resolvedAt?: Date;
}

export type TaskType = 'replenishment' | 'maintenance' | 'inspection' | 'price_adjustment';
export type TaskStatus = 'pending' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface Task {
  id: string;
  cabinetId: string;
  cabinet?: Cabinet;
  inspectorId?: string;
  inspector?: Inspector;
  type: TaskType;
  status: TaskStatus;
  priority: TaskPriority;
  description: string;
  products?: { productId: string; productName?: string; quantity: number }[];
  dueTime: Date;
  createdAt: Date;
  completedAt?: Date;
}

export interface Inspector {
  id: string;
  name: string;
  phone: string;
  area: string;
  avatar: string;
  pendingTasks: number;
}

export interface PriceHistory {
  id: string;
  productId: string;
  product?: Product;
  oldPrice: number;
  newPrice: number;
  effectiveDate: Date;
  operator: string;
}

export interface DailySalesData {
  date: string;
  sales: number;
  orders: number;
}

export interface CabinetRevenue {
  cabinetId: string;
  cabinetName: string;
  location: string;
  todayRevenue: number;
  weekRevenue: number;
  monthRevenue: number;
  growthRate: number;
}

export type StatusFilter = 'all' | CabinetStatus;
