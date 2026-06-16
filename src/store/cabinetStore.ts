import { create } from 'zustand';
import { Cabinet, StatusFilter } from '@/types';
import { mockCabinets } from '@/mock/cabinets';
import { mockInventories } from '@/mock/products';

interface CabinetState {
  cabinets: Cabinet[];
  selectedCabinet: Cabinet | null;
  statusFilter: StatusFilter;
  searchKeyword: string;
  setStatusFilter: (filter: StatusFilter) => void;
  setSearchKeyword: (keyword: string) => void;
  setSelectedCabinet: (cabinet: Cabinet | null) => void;
  getFilteredCabinets: () => Cabinet[];
  getCabinetById: (id: string) => Cabinet | undefined;
  getCabinetInventory: (cabinetId: string) => typeof mockInventories[string];
  getStats: () => {
    total: number;
    online: number;
    lowStock: number;
    fault: number;
    onlineRate: number;
  };
}

export const useCabinetStore = create<CabinetState>((set, get) => ({
  cabinets: mockCabinets,
  selectedCabinet: null,
  statusFilter: 'all',
  searchKeyword: '',
  
  setStatusFilter: (filter) => set({ statusFilter: filter }),
  setSearchKeyword: (keyword) => set({ searchKeyword: keyword }),
  setSelectedCabinet: (cabinet) => set({ selectedCabinet: cabinet }),
  
  getFilteredCabinets: () => {
    const { cabinets, statusFilter, searchKeyword } = get();
    return cabinets.filter(c => {
      const matchStatus = statusFilter === 'all' || c.status === statusFilter;
      const matchKeyword = !searchKeyword || 
        c.name.includes(searchKeyword) || 
        c.location.includes(searchKeyword) ||
        c.address.includes(searchKeyword);
      return matchStatus && matchKeyword;
    });
  },
  
  getCabinetById: (id) => {
    return get().cabinets.find(c => c.id === id);
  },
  
  getCabinetInventory: (cabinetId) => {
    return mockInventories[cabinetId] || [];
  },
  
  getStats: () => {
    const { cabinets } = get();
    const total = cabinets.length;
    const online = cabinets.filter(c => c.status === 'online' || c.status === 'low_stock').length;
    const lowStock = cabinets.filter(c => c.status === 'low_stock').length;
    const fault = cabinets.filter(c => c.status === 'fault').length;
    const onlineRate = total > 0 ? Math.round((online / total) * 100) : 0;
    return { total, online, lowStock, fault, onlineRate };
  },
}));
