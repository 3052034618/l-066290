import { create } from 'zustand';
import { Product, ProductInventory, PriceHistory } from '@/types';
import { mockProducts, getAllInventories } from '@/mock/products';

interface ProductState {
  products: Product[];
  inventories: ProductInventory[];
  priceHistories: PriceHistory[];
  selectedCabinetId: string | null;
  selectedCategory: string;
  onlyLowStock: boolean;
  onlyExpiring: boolean;
  onlyOnShelf: boolean;
  searchKeyword: string;
  setSelectedCabinetId: (id: string | null) => void;
  setSelectedCategory: (category: string) => void;
  setOnlyLowStock: (value: boolean) => void;
  setOnlyExpiring: (value: boolean) => void;
  setOnlyOnShelf: (value: boolean) => void;
  setSearchKeyword: (keyword: string) => void;
  toggleShelfStatus: (inventoryId: string) => void;
  updatePrice: (productId: string, newPrice: number, operator: string) => void;
  getFilteredInventories: () => ProductInventory[];
  getExpiringItems: (days?: number) => ProductInventory[];
  getLowStockItems: () => ProductInventory[];
  getCategories: () => string[];
  getProducts: () => Product[];
  getProductById: (id: string) => Product | undefined;
}

export const useProductStore = create<ProductState>((set, get) => ({
  products: mockProducts,
  inventories: getAllInventories(),
  priceHistories: [],
  selectedCabinetId: null,
  selectedCategory: '',
  onlyLowStock: false,
  onlyExpiring: false,
  onlyOnShelf: true,
  searchKeyword: '',
  
  setSelectedCabinetId: (id) => set({ selectedCabinetId: id }),
  setSelectedCategory: (category) => set({ selectedCategory: category }),
  setOnlyLowStock: (value) => set({ onlyLowStock: value }),
  setOnlyExpiring: (value) => set({ onlyExpiring: value }),
  setOnlyOnShelf: (value) => set({ onlyOnShelf: value }),
  setSearchKeyword: (keyword) => set({ searchKeyword: keyword }),
  
  toggleShelfStatus: (inventoryId) => {
    set(state => ({
      inventories: state.inventories.map(inv => 
        inv.id === inventoryId ? { ...inv, isOnShelf: !inv.isOnShelf } : inv
      ),
    }));
  },
  
  updatePrice: (productId, newPrice, operator) => {
    const product = get().products.find(p => p.id === productId);
    if (!product) return;
    
    const oldPrice = product.currentPrice;
    
    const history: PriceHistory = {
      id: `ph-${Date.now()}`,
      productId,
      product: { ...product, currentPrice: newPrice },
      oldPrice,
      newPrice,
      effectiveDate: new Date(),
      operator,
    };
    
    const updatedProduct = { ...product, currentPrice: newPrice };
    
    set(state => ({
      products: state.products.map(p => 
        p.id === productId ? updatedProduct : p
      ),
      inventories: state.inventories.map(inv => 
        inv.productId === productId 
          ? { ...inv, product: updatedProduct }
          : inv
      ),
      priceHistories: [history, ...state.priceHistories],
    }));
  },
  
  getFilteredInventories: () => {
    const { inventories, selectedCabinetId, selectedCategory, onlyLowStock, onlyExpiring, onlyOnShelf, searchKeyword } = get();
    const now = new Date();
    const weekLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    return inventories.filter(inv => {
      if (onlyOnShelf && !inv.isOnShelf) return false;
      if (selectedCabinetId && inv.cabinetId !== selectedCabinetId) return false;
      if (selectedCategory && inv.product?.category !== selectedCategory) return false;
      if (onlyLowStock && inv.currentStock > inv.minStockThreshold) return false;
      if (onlyExpiring && inv.expiryDate > weekLater) return false;
      if (searchKeyword) {
        const keyword = searchKeyword.toLowerCase();
        const nameMatch = inv.product?.name.toLowerCase().includes(keyword);
        if (!nameMatch) return false;
      }
      return true;
    });
  },
  
  getExpiringItems: (days = 7) => {
    const { inventories } = get();
    const threshold = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
    return inventories.filter(inv => inv.isOnShelf && inv.expiryDate <= threshold);
  },
  
  getLowStockItems: () => {
    const { inventories } = get();
    return inventories.filter(inv => inv.currentStock <= inv.minStockThreshold && inv.isOnShelf);
  },
  
  getCategories: () => {
    const categories = new Set(mockProducts.map(p => p.category));
    return Array.from(categories);
  },
  
  getProducts: () => get().products,
  
  getProductById: (id) => get().products.find(p => p.id === id),
}));
