import React from 'react';
import { Package, AlertTriangle, Clock, ToggleLeft } from 'lucide-react';
import ProgressBar from '@/components/ui/ProgressBar';
import StatusBadge from '@/components/ui/StatusBadge';
import { ProductInventory } from '@/types';
import { formatCurrency } from '@/utils/format';
import { formatDate, getDaysUntil } from '@/utils/date';
import { useProductStore } from '@/store/productStore';

interface InventoryPanelProps {
  cabinetId: string;
  inventories: ProductInventory[];
}

const InventoryPanel: React.FC<InventoryPanelProps> = ({ cabinetId, inventories }) => {
  const { toggleShelfStatus } = useProductStore();
  
  const lowStockItems = inventories.filter(inv => inv.currentStock <= inv.minStockThreshold && inv.isOnShelf);
  const onShelfCount = inventories.filter(i => i.isOnShelf).length;

  const getStockVariant = (current: number, max: number, min: number) => {
    const rate = (current / max) * 100;
    if (current <= min) return 'danger';
    if (rate < 40) return 'warning';
    return 'success';
  };

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-semibold text-neutral-800 flex items-center gap-2">
          <Package size={20} className="text-primary-500" />
          实时库存
        </h2>
        <div className="flex items-center gap-4">
          <span className="text-sm text-neutral-500">
            在售 <span className="font-semibold text-neutral-800">{onShelfCount}</span> / 共 {inventories.length} 件
          </span>
          {lowStockItems.length > 0 && (
            <span className="badge-warning flex items-center gap-1">
              <AlertTriangle size={12} />
              {lowStockItems.length} 件低库存
            </span>
          )}
        </div>
      </div>

      <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
        <table className="w-full">
          <thead className="sticky top-0 bg-white">
            <tr className="border-b border-neutral-100">
              <th className="table-header">商品名称</th>
              <th className="table-header">分类</th>
              <th className="table-header w-32">库存</th>
              <th className="table-header">售价</th>
              <th className="table-header">到期</th>
              <th className="table-header w-20">上下架</th>
            </tr>
          </thead>
          <tbody>
            {inventories.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-10 text-center text-neutral-400 text-sm">
                  暂无库存数据
                </td>
              </tr>
            ) : (
              inventories.map((inv) => {
                const stockPercent = Math.round((inv.currentStock / inv.maxStock) * 100);
                const daysLeft = getDaysUntil(inv.expiryDate);
                const isExpiring = daysLeft <= 7 && inv.isOnShelf;
                const isLowStock = inv.currentStock <= inv.minStockThreshold && inv.isOnShelf;
                
                return (
                  <tr 
                    key={inv.id} 
                    className={`border-b border-neutral-50 transition-colors ${
                      inv.isOnShelf ? 'hover:bg-neutral-50/50' : 'bg-neutral-50/30 opacity-60'
                    }`}
                  >
                    <td className="table-cell">
                      <div className="font-medium text-neutral-800 text-sm">{inv.product?.name}</div>
                    </td>
                    <td className="table-cell">
                      <span className="text-xs text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded">
                        {inv.product?.category}
                      </span>
                    </td>
                    <td className="table-cell">
                      <div className="flex flex-col gap-1.5">
                        <span className={`text-xs font-mono font-medium ${
                          isLowStock ? 'text-danger-600' : 'text-neutral-700'
                        }`}>
                          {inv.currentStock} / {inv.maxStock}
                        </span>
                        <ProgressBar 
                          value={stockPercent} 
                          variant={getStockVariant(inv.currentStock, inv.maxStock, inv.minStockThreshold)}
                          height="sm"
                        />
                      </div>
                    </td>
                    <td className="table-cell">
                      <span className="font-semibold text-primary-600">
                        {formatCurrency(inv.product?.currentPrice || 0)}
                      </span>
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center gap-1">
                        {isExpiring && <Clock size={12} className="text-warning-500" />}
                        <span className={`text-xs ${isExpiring ? 'text-warning-600 font-medium' : 'text-neutral-600'}`}>
                          {formatDate(inv.expiryDate, 'MM-DD')}
                          {isExpiring && <span className="ml-1">({daysLeft}天)</span>}
                        </span>
                      </div>
                    </td>
                    <td className="table-cell">
                      <button
                        onClick={() => toggleShelfStatus(inv.id)}
                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                          inv.isOnShelf ? 'bg-success-500' : 'bg-neutral-300'
                        }`}
                        title={inv.isOnShelf ? '点击下架' : '点击上架'}
                      >
                        <span
                          className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform shadow-sm ${
                            inv.isOnShelf ? 'translate-x-5' : 'translate-x-0.5'
                          }`}
                        />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InventoryPanel;
