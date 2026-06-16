import { create } from 'zustand';
import { ExceptionRecord, ExceptionStatus, ExceptionType } from '@/types';
import { mockExceptions } from '@/mock/exceptions';

interface ExceptionState {
  exceptions: ExceptionRecord[];
  selectedStatus: ExceptionStatus | 'all';
  selectedType: ExceptionType | 'all';
  setSelectedStatus: (status: ExceptionStatus | 'all') => void;
  setSelectedType: (type: ExceptionType | 'all') => void;
  getFilteredExceptions: () => ExceptionRecord[];
  getByStatus: (status: ExceptionStatus) => ExceptionRecord[];
  addException: (data: Omit<ExceptionRecord, 'id' | 'createdAt' | 'status'>) => string;
  updateExceptionHandler: (id: string, handlerId: string, handlerName: string) => void;
  updateStatus: (id: string, status: ExceptionStatus, handlerId?: string, handlerName?: string) => void;
  getStats: () => {
    total: number;
    pending: number;
    processing: number;
    resolved: number;
  };
}

export const useExceptionStore = create<ExceptionState>((set, get) => ({
  exceptions: mockExceptions,
  selectedStatus: 'all',
  selectedType: 'all',
  
  setSelectedStatus: (status) => set({ selectedStatus: status }),
  setSelectedType: (type) => set({ selectedType: type }),
  
  getFilteredExceptions: () => {
    const { exceptions, selectedStatus, selectedType } = get();
    return exceptions.filter(e => {
      const matchStatus = selectedStatus === 'all' || e.status === selectedStatus;
      const matchType = selectedType === 'all' || e.type === selectedType;
      return matchStatus && matchType;
    });
  },
  
  getByStatus: (status) => {
    return get().exceptions.filter(e => e.status === status);
  },
  
  addException: (data) => {
    const newException: ExceptionRecord = {
      ...data,
      id: `e${Date.now()}`,
      status: 'pending',
      createdAt: new Date(),
    };
    set(state => ({
      exceptions: [newException, ...state.exceptions],
    }));
    return newException.id;
  },
  
  updateExceptionHandler: (id, handlerId, handlerName) => {
    set(state => ({
      exceptions: state.exceptions.map(e => 
        e.id === id 
          ? { ...e, handlerId, handlerName }
          : e
      ),
    }));
  },
  
  updateStatus: (id, status, handlerId, handlerName) => {
    set(state => ({
      exceptions: state.exceptions.map(e => 
        e.id === id 
          ? { 
              ...e, 
              status, 
              handlerId: handlerId || e.handlerId,
              handlerName: handlerName || e.handlerName,
              resolvedAt: status === 'resolved' ? new Date() : e.resolvedAt,
            } 
          : e
      ),
    }));
  },
  
  getStats: () => {
    const { exceptions } = get();
    return {
      total: exceptions.length,
      pending: exceptions.filter(e => e.status === 'pending').length,
      processing: exceptions.filter(e => e.status === 'processing').length,
      resolved: exceptions.filter(e => e.status === 'resolved').length,
    };
  },
}));
