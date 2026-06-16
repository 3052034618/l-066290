import React, { useState, useMemo } from 'react';
import {
  Package,
  Search,
  Filter,
  AlertTriangle,
  TrendingDown,
  Clock,
  Tag,
  Edit3,
  Check,
  X,
  ChevronDown,
  AlertCircle,
} from 'lucide-react';
import StatusBadge from '@/components/ui/StatusBadge';
import ProgressBar from '@/components/ui/ProgressBar';
import Modal from '@/components/ui/Modal';
import StatCard from '@/components/ui/StatCard';
import { useProductStore } from '@/store/productStore';
import { useCabinetStore } from '@/store/cabinetStore';
import { formatCurrency } from '@/utils/format';
import { formatDate, getDaysUntil } from '@/utils/date';
import { ProductInventory } from '@/types';

const ProductsPage: React.FC = () => {
  const {
    getFilteredInventories,
    getExpiringItems,
    getLowStockItems,
    getCategories,
    selectedCabinetId,
    selectedCategory,
    onlyLowStock,
    onlyExpiring,
    searchKeyword,
    setSelectedCabinetId,
    setSelectedCategory,
    setOnlyLowStock,
    setOnlyExpiring,
    setSearchKeyword,
    toggleShelfStatus,
    updatePrice,
  } = useProductStore();

  const { cabinets } = useCabinetStore();

  const [priceModalOpen, setPriceModalOpen] = useState(false);
  const [selectedInventory, setSelectedInventory] = useState<ProductInventory | null>(null);
  const [newPrice, setNewPrice] = useState('');
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showCabinetDropdown, setShowCabinetDropdown] = useState(false);

  const filteredInventories = useMemo(() => getFilteredInventories(), [getFilteredInventories]);
  const expiringItems = useMemo(() => getExpiringItems(7), [getExpiringItems]);
  const lowStockItems = useMemo(() => getLowStockItems(), [getLowStockItems]);
  const categories = useMemo(() => getCategories(), [getCategories]);

  const handleOpenPriceModal = (inventory: ProductInventory) => {
    setSelectedInventory(inventory);
    setNewPrice(inventory.product?.currentPrice?.toString() || '');
    setPriceModalOpen(true);
  };

  const handleConfirmPrice = () => {
    if (selectedInventory?.product && newPrice) {
      updatePrice(selectedInventory.product.id, parseFloat(newPrice), '管理员');
      setPriceModalOpen(false);
      setSelectedInventory(null);
    }
  };

  const getExpiryBadge = (expiryDate: Date) => {
    const days = getDaysUntil(expiryDate);
    if (days <= 0) return <StatusBadge status="fault" customText="已过期" customClass="badge-danger" />;
    if (days <= 3) return <StatusBadge status="fault" customText={`${days}天后过期`} customClass="badge-danger" />;
    if (days <= 7) return <StatusBadge status="low_stock" customText={`${days}天后过期`} customClass="badge-warning" />;
    return <span className="text-sm text-neutral-500">{formatDate(expiryDate, 'YYYY-MM-DD')}</span>;
  };

  const getStockVariant = (current: number, max: number, min: number) => {
    const rate = (current / max) * 100;
    if (current <= min) return 'danger';
    if (rate < 40) return 'warning';
    return 'success';
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-neutral-800 mb-1">商品监控</h1>
        <p className="text-sm text-neutral-500">实时监控商品库存、上下架状态和临期情况</p>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        <StatCard
          title="商品总数"
          value={filteredInventories.length}
          suffix="件"
          icon={Package}
          iconBg="bg-primary-50"
          iconColor="text-primary-600"
        />
        <StatCard
          title="低库存商品"
          value={lowStockItems.length}
          suffix="件"
          icon={TrendingDown}
          iconBg="bg-warning-50"
          iconColor="text-warning-600"
        />
        <StatCard
          title="临期商品"
          value={expiringItems.length}
          suffix="件"
          icon={Clock}
          iconBg="bg-danger-50"
          iconColor="text-danger-600"
        />
        <StatCard
          title="在售分类"
          value={categories.length}
          suffix="个"
          icon={Tag}
          iconBg="bg-success-50"
          iconColor="text-success-600"
        />
      </div>

      <div className="card p-4 mb-6">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="relative flex-1 max-w-md">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              placeholder="搜索商品名称..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              className="input-field pl-10"
            />
          </div>

          <div className="relative">
            <button
              onClick={() => {
                setShowCategoryDropdown(!showCategoryDropdown);
                setShowCabinetDropdown(false);
              }}
              className="btn-secondary flex items-center gap-2 min-w-[140px]"
            >
              <Filter size={16} />
              <span>{selectedCategory || '全部分类'}</span>
              <ChevronDown size={16} />
            </button>
            {showCategoryDropdown && (
              <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-xl shadow-dropdown border border-neutral-100 py-2 z-10">
                <button
                  onClick={() => {
                    setSelectedCategory('');
                    setShowCategoryDropdown(false);
                  }}
                  className={`w-full px-4 py-2 text-left text-sm hover:bg-neutral-50 ${!selectedCategory ? 'text-primary-600 bg-primary-50' : 'text-neutral-700'}`}
                >
                  全部分类
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => {
                      setSelectedCategory(cat);
                      setShowCategoryDropdown(false);
                    }}
                    className={`w-full px-4 py-2 text-left text-sm hover:bg-neutral-50 ${selectedCategory === cat ? 'text-primary-600 bg-primary-50' : 'text-neutral-700'}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="relative">
            <button
              onClick={() => {
                setShowCabinetDropdown(!showCabinetDropdown);
                setShowCategoryDropdown(false);
              }}
              className="btn-secondary flex items-center gap-2 min-w-[180px]"
            >
              <Package size={16} />
              <span className="truncate max-w-[120px]">
                {selectedCabinetId ? cabinets.find((c) => c.id === selectedCabinetId)?.name : '全部货柜'}
              </span>
              <ChevronDown size={16} />
            </button>
            {showCabinetDropdown && (
              <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-xl shadow-dropdown border border-neutral-100 py-2 z-10 max-h-64 overflow-y-auto">
                <button
                  onClick={() => {
                    setSelectedCabinetId(null);
                    setShowCabinetDropdown(false);
                  }}
                  className={`w-full px-4 py-2 text-left text-sm hover:bg-neutral-50 ${!selectedCabinetId ? 'text-primary-600 bg-primary-50' : 'text-neutral-700'}`}
                >
                  全部货柜
                </button>
                {cabinets.map((cab) => (
                  <button
                    key={cab.id}
                    onClick={() => {
                      setSelectedCabinetId(cab.id);
                      setShowCabinetDropdown(false);
                    }}
                    className={`w-full px-4 py-2 text-left text-sm hover:bg-neutral-50 ${selectedCabinetId === cab.id ? 'text-primary-600 bg-primary-50' : 'text-neutral-700'}`}
                  >
                    {cab.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={onlyLowStock}
              onChange={(e) => setOnlyLowStock(e.target.checked)}
              className="w-4 h-4 rounded border-neutral-300 text-primary-500 focus:ring-primary-500"
            />
            <span className="text-sm text-neutral-700">仅显示低库存</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={onlyExpiring}
              onChange={(e) => setOnlyExpiring(e.target.checked)}
              className="w-4 h-4 rounded border-neutral-300 text-primary-500 focus:ring-primary-500"
            />
            <span className="text-sm text-neutral-700">仅显示临期商品</span>
          </label>
        </div>
      </div>

      {expiringItems.length > 0 && (
        <div className="card p-4 mb-6 border-danger-200 bg-danger-50/50">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle size={20} className="text-danger-500" />
            <h3 className="font-semibold text-danger-700">临期预警</h3>
            <span className="badge-danger">{expiringItems.length}件商品即将过期</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {expiringItems.slice(0, 8).map((item) => (
              <div key={item.id} className="bg-white rounded-lg p-3 border border-danger-100">
                <div className="flex items-start justify-between mb-1">
                  <span className="text-sm font-medium text-neutral-800 line-clamp-1">
                    {item.product?.name}
                  </span>
                  {getExpiryBadge(item.expiryDate)}
                </div>
                <p className="text-xs text-neutral-500">
                  {cabinets.find((c) => c.id === item.cabinetId)?.name}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="card overflow-hidden">
        <table className="w-full">
          <thead className="bg-neutral-50 border-b border-neutral-100">
            <tr>
              <th className="table-header">商品名称</th>
              <th className="table-header">分类</th>
              <th className="table-header">所在货柜</th>
              <th className="table-header w-48">库存</th>
              <th className="table-header">上下架</th>
              <th className="table-header">价格</th>
              <th className="table-header">到期日期</th>
              <th className="table-header">操作</th>
            </tr>
          </thead>
          <tbody>
            {filteredInventories.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-16 text-center text-neutral-400">
                  <AlertCircle size={40} className="mx-auto mb-2 opacity-50" />
                  <p>暂无符合条件的商品</p>
                </td>
              </tr>
            ) : (
              filteredInventories.map((inv) => (
                <tr key={inv.id} className="border-b border-neutral-50 hover:bg-neutral-50 transition-colors">
                  <td className="table-cell">
                    <div className="font-medium text-neutral-800">{inv.product?.name}</div>
                  </td>
                  <td className="table-cell">
                    <span className="badge-primary">{inv.product?.category}</span>
                  </td>
                  <td className="table-cell text-neutral-600">
                    {cabinets.find((c) => c.id === inv.cabinetId)?.name}
                  </td>
                  <td className="table-cell">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-neutral-700 whitespace-nowrap">
                        {inv.currentStock}/{inv.maxStock}
                      </span>
                      <div className="flex-1 min-w-[80px]">
                        <ProgressBar
                          value={inv.currentStock}
                          max={inv.maxStock}
                          variant={getStockVariant(inv.currentStock, inv.maxStock, inv.minStockThreshold)}
                          height="sm"
                        />
                      </div>
                    </div>
                  </td>
                  <td className="table-cell">
                    <button
                      onClick={() => toggleShelfStatus(inv.id)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        inv.isOnShelf ? 'bg-success-500' : 'bg-neutral-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow ${
                          inv.isOnShelf ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </td>
                  <td className="table-cell">
                    <span className="font-medium text-neutral-800">
                      {formatCurrency(inv.product?.currentPrice || 0)}
                    </span>
                  </td>
                  <td className="table-cell">{getExpiryBadge(inv.expiryDate)}</td>
                  <td className="table-cell">
                    <button
                      onClick={() => handleOpenPriceModal(inv)}
                      className="inline-flex items-center gap-1 text-primary-600 hover:text-primary-700 text-sm font-medium"
                    >
                      <Edit3 size={14} />
                      调价
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Modal
        isOpen={priceModalOpen}
        onClose={() => {
          setPriceModalOpen(false);
          setSelectedInventory(null);
        }}
        title="价格调整"
        size="sm"
        footer={
          <>
            <button
              onClick={() => {
                setPriceModalOpen(false);
                setSelectedInventory(null);
              }}
              className="btn-secondary"
            >
              <X size={16} />
              取消
            </button>
            <button onClick={handleConfirmPrice} className="btn-primary">
              <Check size={16} />
              确认调整
            </button>
          </>
        }
      >
        {selectedInventory && (
          <div className="space-y-4">
            <div className="p-3 bg-neutral-50 rounded-lg">
              <p className="text-sm font-medium text-neutral-800">{selectedInventory.product?.name}</p>
              <p className="text-xs text-neutral-500 mt-1">
                当前价格：{formatCurrency(selectedInventory.product?.currentPrice || 0)}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">新价格 (元)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={newPrice}
                onChange={(e) => setNewPrice(e.target.value)}
                className="input-field"
                placeholder="请输入新价格"
              />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ProductsPage;
