import React from 'react';
import { Package, AlertTriangle, Clock } from 'lucide-react';
import ProgressBar from '@/components/ui/ProgressBar';
import StatusBadge from '@/components/ui/StatusBadge';
import { ProductInventory } from '@/types';
import { formatCurrency } from '@/utils/format';
import { formatDate, getDaysUntil } from '@/utils/date';

interface InventoryPanelProps {
  inventories: ProductInventory[];
}

const InventoryPanel: React.FC<InventoryPanelProps> = ({ inventories }) => {
  const lowStockItems = inventories.filter(inv => inv.currentStock <= inv.minStockThreshold && inv.isOnShelf);

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-semibold text-neutral-800 flex items-center gap-2">
          <Package size={20} className="text-primary-500" />
          实时库存
        </h2>
        <div className="flex items-center gap-4">
          <span className="text-sm text-neutral-500">
            共 <span className="font-semibold text-neutral-800">{inventories.filter(i => i.isOnShelf).length}</span> 件在售商品
          </span>
          {lowStockItems.length > 0 && (
            <span className="badge-warning flex items-center gap-1">
              <AlertTriangle size={12} />
              {lowStockItems.length} 件低库存
            </span>
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-neutral-100">
              <th className="table-header">商品名称</th>
              <th className="table-header">分类</th>
              <th className="table-header w-48">库存状态</th>
              <th className="table-header">库存数量</th>
              <th className="table-header">售价</th>
              <th className="table-header">到期日期</th>
              <th className="table-header">状态</th>
            </tr>
          </thead>
          <tbody>
            {inventories.map((inv) => {
              const stockPercent = Math.round((inv.currentStock / inv.maxStock) * 100);
              const daysLeft = getDaysUntil(inv.expiryDate);
              const isExpiring = daysLeft <= 7 && inv.isOnShelf;
              
              return (
                <tr key={inv.id} className="border-b border-neutral-50 hover:bg-neutral-50/50 transition-colors">
                  <td className="table-cell">
                    <div className="font-medium text-neutral-800">{inv.product?.name}</div>
                  </td>
                  <td className="table-cell">
                    <span className="text-sm text-neutral-500">{inv.product?.category}</span>
                  </td>
                  <td className="table-cell">
                    <ProgressBar value={stockPercent} showLabel />
                  </td>
                  <td className="table-cell">
                    <span className={`font-mono font-medium ${
                      inv.currentStock <= inv.minStockThreshold ? 'text-danger-600' : 'text-neutral-700'
                    }`}>
                      {inv.currentStock} / {inv.maxStock}
                    </span>
                  </td>
                  <td className="table-cell">
                    <span className="font-medium text-neutral-800">{formatCurrency(inv.product?.currentPrice || 0)}</span>
                  </td>
                  <td className="table-cell">
                    <div className="flex items-center gap-1.5">
                      {isExpiring && <Clock size={14} className="text-warning-500" />}
                      <span className={isExpiring ? 'text-warning-600 font-medium' : 'text-neutral-600'}>
                        {formatDate(inv.expiryDate, 'YYYY-MM-DD')}
                        {isExpiring && <span className="ml-1 text-xs">({daysLeft}天后)</span>}
                      </span>
                    </div>
                  </td>
                  <td className="table-cell">
                    <StatusBadge status={inv.isOnShelf ? 'online' : 'offline'} customText={inv.isOnShelf ? '在售' : '下架'} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InventoryPanel;
