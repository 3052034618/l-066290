import { create } from 'zustand';
import { Product, ProductInventory, PriceHistory } from '@/types';
import { mockProducts, getAllInventories, getExpiringInventories, getLowStockInventories } from '@/mock/products';

interface ProductState {
  products: Product[];
  inventories: ProductInventory[];
  priceHistories: PriceHistory[];
  selectedCabinetId: string | null;
  selectedCategory: string;
  onlyLowStock: boolean;
  onlyExpiring: boolean;
  searchKeyword: string;
  setSelectedCabinetId: (id: string | null) => void;
  setSelectedCategory: (category: string) => void;
  setOnlyLowStock: (value: boolean) => void;
  setOnlyExpiring: (value: boolean) => void;
  setSearchKeyword: (keyword: string) => void;
  toggleShelfStatus: (inventoryId: string) => void;
  updatePrice: (productId: string, newPrice: number, operator: string) => void;
  getFilteredInventories: () => ProductInventory[];
  getExpiringItems: (days?: number) => ProductInventory[];
  getLowStockItems: () => ProductInventory[];
  getCategories: () => string[];
}

export const useProductStore = create<ProductState>((set, get) => ({
  products: mockProducts,
  inventories: getAllInventories(),
  priceHistories: [],
  selectedCabinetId: null,
  selectedCategory: '',
  onlyLowStock: false,
  onlyExpiring: false,
  searchKeyword: '',
  
  setSelectedCabinetId: (id) => set({ selectedCabinetId: id }),
  setSelectedCategory: (category) => set({ selectedCategory: category }),
  setOnlyLowStock: (value) => set({ onlyLowStock: value }),
  setOnlyExpiring: (value) => set({ onlyExpiring: value }),
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
    if (product) {
      const history: PriceHistory = {
        id: `ph-${Date.now()}`,
        productId,
        product,
        oldPrice: product.currentPrice,
        newPrice,
        effectiveDate: new Date(),
        operator,
      };
      set(state => ({
        products: state.products.map(p => 
          p.id === productId ? { ...p, currentPrice: newPrice } : p
        ),
        priceHistories: [history, ...state.priceHistories],
      }));
    }
  },
  
  getFilteredInventories: () => {
    const { inventories, selectedCabinetId, selectedCategory, onlyLowStock, onlyExpiring, searchKeyword } = get();
    const now = new Date();
    const weekLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    return inventories.filter(inv => {
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
  
  getExpiringItems: (days = 7) => getExpiringInventories(days),
  getLowStockItems: () => getLowStockInventories(),
  
  getCategories: () => {
    const categories = new Set(mockProducts.map(p => p.category));
    return Array.from(categories);
  },
}));
