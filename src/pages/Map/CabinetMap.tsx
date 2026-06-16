import React, { useState } from 'react';
import { Filter, Search } from 'lucide-react';
import { useCabinetStore } from '@/store/cabinetStore';
import { Cabinet, StatusFilter } from '@/types';
import CabinetCard from './CabinetCard';

const filterOptions: { value: StatusFilter; label: string; color: string }[] = [
  { value: 'all', label: '全部', color: 'bg-neutral-600' },
  { value: 'online', label: '在线', color: 'bg-success-500' },
  { value: 'low_stock', label: '低库存', color: 'bg-warning-500' },
  { value: 'fault', label: '故障', color: 'bg-danger-500' },
  { value: 'offline', label: '离线', color: 'bg-neutral-400' },
  { value: 'maintenance', label: '维护中', color: 'bg-primary-500' },
];

const CabinetMap: React.FC = () => {
  const { 
    cabinets, 
    statusFilter, 
    setStatusFilter, 
    searchKeyword, 
    setSearchKeyword,
    getFilteredCabinets,
    getCabinetInventory
  } = useCabinetStore();
  
  const [selectedCabinet, setSelectedCabinet] = useState<Cabinet | null>(null);

  const filteredCabinets = getFilteredCabinets();

  const calculateInventoryRate = (cabinetId: string): number => {
    const inventory = getCabinetInventory(cabinetId);
    if (!inventory || inventory.length === 0) return 0;
    const totalStock = inventory.reduce((sum, item) => sum + item.currentStock, 0);
    const totalMax = inventory.reduce((sum, item) => sum + item.maxStock, 0);
    return totalMax > 0 ? Math.round((totalStock / totalMax) * 100) : 0;
  };

  const getCabinetPosition = (cabinet: Cabinet) => {
    const minLat = 39.85;
    const maxLat = 40.05;
    const minLng = 116.30;
    const maxLng = 116.55;
    const x = ((cabinet.longitude - minLng) / (maxLng - minLng)) * 100;
    const y = ((maxLat - cabinet.latitude) / (maxLat - minLat)) * 100;
    return { x: Math.max(5, Math.min(95, x)), y: Math.max(5, Math.min(95, y)) };
  };

  const getPinClass = (status: string) => {
    switch (status) {
      case 'online': return 'map-pin-online';
      case 'offline': return 'map-pin-offline';
      case 'low_stock': return 'map-pin-low-stock';
      case 'fault': return 'map-pin-fault';
      default: return 'map-pin bg-primary-500';
    }
  };

  return (
    <div className="space-y-4">
      <div className="card p-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <Filter size={18} className="text-neutral-400" />
            {filterOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setStatusFilter(option.value)}
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  statusFilter === option.value
                    ? 'bg-primary-50 text-primary-600'
                    : 'text-neutral-500 hover:bg-neutral-50 hover:text-neutral-700'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${option.color}`} />
                {option.label}
                <span className="text-xs opacity-70">
                  ({option.value === 'all' 
                    ? cabinets.length 
                    : cabinets.filter(c => c.status === option.value).length})
                </span>
              </button>
            ))}
          </div>
          
          <div className="relative w-64">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              placeholder="搜索货柜名称或位置..."
              className="w-full pl-9 pr-4 py-2 bg-neutral-50 rounded-lg text-sm border border-transparent focus:bg-white focus:border-primary-200 focus:outline-none transition-all"
            />
          </div>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="relative h-[540px] bg-gradient-to-br from-neutral-50 via-primary-50/20 to-neutral-100">
          <div className="absolute inset-0 opacity-40">
            <svg width="100%" height="100%" className="absolute inset-0">
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#CBD5E1" strokeWidth="0.5" opacity="0.5" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          </div>
          
          <div className="absolute inset-0">
            {filteredCabinets.map((cabinet) => {
              const pos = getCabinetPosition(cabinet);
              return (
                <div
                  key={cabinet.id}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 z-10"
                  style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
                >
                  <div className="relative group">
                    {(cabinet.status === 'fault' || cabinet.status === 'low_stock') && (
                      <span className={`absolute inset-0 rounded-full animate-ping-slow opacity-75 ${
                        cabinet.status === 'fault' ? 'bg-danger-400' : 'bg-warning-400'
                      }`} />
                    )}
                    <button
                      onClick={() => setSelectedCabinet(selectedCabinet?.id === cabinet.id ? null : cabinet)}
                      className={`relative z-10 ${getPinClass(cabinet.status)} ${
                        selectedCabinet?.id === cabinet.id ? 'ring-4 ring-primary-300 ring-opacity-50 scale-125' : ''
                      }`}
                    />
                    <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
                      <div className="bg-neutral-800 text-white text-xs px-2 py-1 rounded shadow-lg">
                        {cabinet.name}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {selectedCabinet && (
            <div 
              className="absolute z-30"
              style={{
                left: `${Math.min(Math.max(getCabinetPosition(selectedCabinet).x + 3, 5), 65)}%`,
                top: `${Math.max(getCabinetPosition(selectedCabinet).y - 5, 5)}%`,
              }}
            >
              <CabinetCard
                cabinet={selectedCabinet}
                inventoryRate={calculateInventoryRate(selectedCabinet.id)}
                onClose={() => setSelectedCabinet(null)}
              />
            </div>
          )}

          <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur rounded-xl shadow-card p-3 space-y-2">
            <p className="text-xs font-semibold text-neutral-600 mb-2">图例</p>
            <div className="space-y-1.5">
              {filterOptions.slice(1).map(opt => (
                <div key={opt.value} className="flex items-center gap-2">
                  <span className={`w-3 h-3 rounded-full ${opt.color}`} />
                  <span className="text-xs text-neutral-600">{opt.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur rounded-xl shadow-card px-4 py-3">
            <p className="text-xs text-neutral-500">共找到</p>
            <p className="text-lg font-bold text-neutral-800">{filteredCabinets.length} <span className="text-sm font-normal text-neutral-500">个货柜</span></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CabinetMap;
