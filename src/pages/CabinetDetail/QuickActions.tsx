import React, { useState, useMemo } from 'react';
import { Plus, Wrench, AlertTriangle, Tag, Send, User, Phone, MapPin, Package, Clock, CheckCircle, X, ChevronDown } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import StatusBadge from '@/components/ui/StatusBadge';
import { useTaskStore } from '@/store/taskStore';
import { useExceptionStore } from '@/store/exceptionStore';
import { useProductStore } from '@/store/productStore';
import { Cabinet, ExceptionType, ExceptionSeverity } from '@/types';
import { formatCurrency } from '@/utils/format';
import { getDaysUntil } from '@/utils/date';

interface QuickActionsProps {
  cabinet: Cabinet;
}

const QuickActions: React.FC<QuickActionsProps> = ({ cabinet }) => {
  const { createTask, inspectors, assignTask } = useTaskStore();
  const { addException } = useExceptionStore();
  const { products, updatePrice, getLowStockItems, getExpiringItems } = useProductStore();

  const [showReplenishModal, setShowReplenishModal] = useState(false);
  const [showRepairModal, setShowRepairModal] = useState(false);
  const [showExceptionModal, setShowExceptionModal] = useState(false);
  const [showPriceModal, setShowPriceModal] = useState(false);

  const [selectedInspectorId, setSelectedInspectorId] = useState('');
  const [selectedProductId, setSelectedProductId] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [exceptionType, setExceptionType] = useState<ExceptionType>('device_fault');
  const [exceptionSeverity, setExceptionSeverity] = useState<ExceptionSeverity>('high');
  const [exceptionDesc, setExceptionDesc] = useState('');
  const [repairDesc, setRepairDesc] = useState('');
  const [showInspectorDropdown, setShowInspectorDropdown] = useState(false);
  const [showProductDropdown, setShowProductDropdown] = useState(false);

  const cabinetLowStock = useMemo(() => {
    return getLowStockItems().filter(inv => inv.cabinetId === cabinet.id);
  }, [getLowStockItems, cabinet.id]);

  const cabinetExpiring = useMemo(() => {
    return getExpiringItems(7).filter(inv => inv.cabinetId === cabinet.id);
  }, [getExpiringItems, cabinet.id]);

  const selectedProduct = useMemo(() => {
    return products.find(p => p.id === selectedProductId);
  }, [products, selectedProductId]);

  const selectedInspector = useMemo(() => {
    return inspectors.find(i => i.id === selectedInspectorId);
  }, [inspectors, selectedInspectorId]);

  const handleCreateReplenishment = () => {
    const taskId = `t${Date.now()}`;
    const productsList = cabinetLowStock.map(inv => ({
      productId: inv.productId,
      productName: inv.product?.name,
      quantity: inv.maxStock - inv.currentStock,
    }));

    createTask({
      id: taskId,
      cabinetId: cabinet.id,
      cabinet,
      type: 'replenishment',
      priority: cabinetLowStock.length > 5 ? 'high' : 'medium',
      description: `${cabinet.name} - 补货${cabinetLowStock.length}种商品`,
      products: productsList,
      dueTime: new Date(Date.now() + 4 * 3600 * 1000),
    });

    if (selectedInspectorId) {
      assignTask(taskId, selectedInspectorId);
    }

    setShowReplenishModal(false);
    setSelectedInspectorId('');
  };

  const handleCreateRepair = () => {
    const taskId = `t${Date.now()}`;
    
    createTask({
      id: taskId,
      cabinetId: cabinet.id,
      cabinet,
      type: 'maintenance',
      priority: 'urgent',
      description: repairDesc || `${cabinet.name} - 设备维修`,
      dueTime: new Date(Date.now() + 2 * 3600 * 1000),
    });

    addException({
      cabinetId: cabinet.id,
      cabinet,
      type: 'device_fault',
      severity: 'high',
      description: repairDesc || `${cabinet.name} - 设备故障报修`,
    });

    if (selectedInspectorId) {
      assignTask(taskId, selectedInspectorId);
    }

    setShowRepairModal(false);
    setSelectedInspectorId('');
    setRepairDesc('');
  };

  const handleReportException = () => {
    const expId = addException({
      cabinetId: cabinet.id,
      cabinet,
      type: exceptionType,
      severity: exceptionSeverity,
      description: exceptionDesc || `${cabinet.name} - 运营异常`,
    });

    if (selectedInspectorId) {
      const taskId = `t${Date.now()}`;
      let taskType: 'replenishment' | 'maintenance' | 'inspection' | 'price_adjustment' = 'inspection';
      if (exceptionType === 'device_fault') taskType = 'maintenance';
      else if (exceptionType === 'network_error') taskType = 'maintenance';
      else if (exceptionType === 'payment_error') taskType = 'inspection';
      else if (exceptionType === 'temperature_abnormal') taskType = 'inspection';
      
      createTask({
        id: taskId,
        cabinetId: cabinet.id,
        cabinet,
        type: taskType,
        priority: exceptionSeverity === 'critical' || exceptionSeverity === 'high' ? 'urgent' : 'high',
        description: exceptionDesc || `${cabinet.name} - ${getExceptionTypeText(exceptionType)}处理`,
        dueTime: new Date(Date.now() + 3 * 3600 * 1000),
      });
      assignTask(taskId, selectedInspectorId);
      
      useExceptionStore.getState().updateExceptionHandler(expId, selectedInspectorId, selectedInspector?.name || '');
    }

    setShowExceptionModal(false);
    setSelectedInspectorId('');
    setExceptionDesc('');
    setExceptionType('device_fault');
    setExceptionSeverity('high');
  };

  const handleConfirmPrice = () => {
    if (selectedProductId && newPrice) {
      updatePrice(selectedProductId, parseFloat(newPrice), '运营管理员');
      setShowPriceModal(false);
      setSelectedProductId('');
      setNewPrice('');
    }
  };

  const openReplenishModal = () => {
    setShowReplenishModal(true);
    const defaultInspector = inspectors.find(i => i.area === cabinet.location);
    if (defaultInspector) setSelectedInspectorId(defaultInspector.id);
  };

  const openRepairModal = () => {
    setShowRepairModal(true);
    const defaultInspector = inspectors.find(i => i.area === cabinet.location);
    if (defaultInspector) setSelectedInspectorId(defaultInspector.id);
  };

  const openExceptionModal = () => {
    setShowExceptionModal(true);
  };

  const openPriceModal = () => {
    setShowPriceModal(true);
    if (products.length > 0) {
      setSelectedProductId(products[0].id);
      setNewPrice(products[0].currentPrice.toString());
    }
  };

  const getExceptionTypeText = (type: ExceptionType) => {
    const map: Record<ExceptionType, string> = {
      device_fault: '设备故障',
      payment_error: '支付异常',
      temperature_abnormal: '温度异常',
      network_error: '网络故障',
    };
    return map[type];
  };

  const getSeverityText = (sev: ExceptionSeverity) => {
    const map: Record<ExceptionSeverity, string> = {
      low: '低',
      medium: '中',
      high: '高',
      critical: '紧急',
    };
    return map[sev];
  };

  return (
    <div className="card p-6 mb-6">
      <h2 className="text-lg font-semibold text-neutral-800 mb-4">快捷操作</h2>
      <div className="grid grid-cols-4 gap-4">
        <button
          onClick={openReplenishModal}
          className="flex flex-col items-center gap-3 p-5 rounded-xl bg-success-50 hover:bg-success-100/70 transition-colors group"
        >
          <div className="w-12 h-12 rounded-xl bg-success-500 flex items-center justify-center shadow-lg shadow-success-500/20 group-hover:scale-105 transition-transform">
            <Plus size={24} className="text-white" />
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-success-700">发起补货</p>
            <p className="text-xs text-success-600/70 mt-0.5">
              {cabinetLowStock.length} 件低库存待补
            </p>
          </div>
        </button>

        <button
          onClick={openRepairModal}
          className="flex flex-col items-center gap-3 p-5 rounded-xl bg-warning-50 hover:bg-warning-100/70 transition-colors group"
        >
          <div className="w-12 h-12 rounded-xl bg-warning-500 flex items-center justify-center shadow-lg shadow-warning-500/20 group-hover:scale-105 transition-transform">
            <Wrench size={24} className="text-white" />
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-warning-700">设备报修</p>
            <p className="text-xs text-warning-600/70 mt-0.5">登记故障安排维修</p>
          </div>
        </button>

        <button
          onClick={openExceptionModal}
          className="flex flex-col items-center gap-3 p-5 rounded-xl bg-danger-50 hover:bg-danger-100/70 transition-colors group"
        >
          <div className="w-12 h-12 rounded-xl bg-danger-500 flex items-center justify-center shadow-lg shadow-danger-500/20 group-hover:scale-105 transition-transform">
            <AlertTriangle size={24} className="text-white" />
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-danger-700">上报异常</p>
            <p className="text-xs text-danger-600/70 mt-0.5">记录运营异常情况</p>
          </div>
        </button>

        <button
          onClick={openPriceModal}
          className="flex flex-col items-center gap-3 p-5 rounded-xl bg-primary-50 hover:bg-primary-100/70 transition-colors group"
        >
          <div className="w-12 h-12 rounded-xl bg-primary-500 flex items-center justify-center shadow-lg shadow-primary-500/20 group-hover:scale-105 transition-transform">
            <Tag size={24} className="text-white" />
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-primary-700">价格调整</p>
            <p className="text-xs text-primary-600/70 mt-0.5">调整商品销售价格</p>
          </div>
        </button>
      </div>

      <Modal
        isOpen={showReplenishModal}
        onClose={() => {
          setShowReplenishModal(false);
          setSelectedInspectorId('');
        }}
        title="发起补货任务"
        size="lg"
        footer={
          <>
            <button className="btn-secondary" onClick={() => {
              setShowReplenishModal(false);
              setSelectedInspectorId('');
            }}>
              <X size={16} />
              取消
            </button>
            <button className="btn-success flex items-center gap-1.5" onClick={handleCreateReplenishment}>
              <Send size={16} />
              {selectedInspectorId ? '派发任务' : '创建任务'}
            </button>
          </>
        }
      >
        <div className="space-y-5">
          <div className="bg-success-50/50 border border-success-100 rounded-xl p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-semibold text-neutral-800">{cabinet.name}</p>
                <p className="text-sm text-neutral-500 mt-0.5">{cabinet.address}</p>
              </div>
              <StatusBadge status={cabinet.status} />
            </div>
            <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-success-100">
              <div className="text-center">
                <p className="text-lg font-bold text-success-600">{cabinetLowStock.length}</p>
                <p className="text-xs text-neutral-500">低库存商品</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-warning-600">{cabinetExpiring.length}</p>
                <p className="text-xs text-neutral-500">临期商品</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-primary-600">4h</p>
                <p className="text-xs text-neutral-500">预计完成</p>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              <Package size={14} className="inline mr-1.5 -mt-0.5" />
              补货商品清单
            </label>
            <div className="border border-neutral-200 rounded-xl overflow-hidden max-h-40 overflow-y-auto">
              {cabinetLowStock.length === 0 ? (
                <div className="py-6 text-center text-neutral-400 text-sm">暂无低库存商品</div>
              ) : (
                <table className="w-full text-sm">
                  <thead className="bg-neutral-50 sticky top-0">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-medium text-neutral-500">商品名称</th>
                      <th className="px-3 py-2 text-center text-xs font-medium text-neutral-500">当前库存</th>
                      <th className="px-3 py-2 text-center text-xs font-medium text-neutral-500">补货数量</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cabinetLowStock.map((inv) => (
                      <tr key={inv.id} className="border-t border-neutral-50">
                        <td className="px-3 py-2 text-neutral-700">{inv.product?.name}</td>
                        <td className="px-3 py-2 text-center text-danger-600">{inv.currentStock}</td>
                        <td className="px-3 py-2 text-center text-success-600 font-medium">
                          +{inv.maxStock - inv.currentStock}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          <div className="relative">
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              <User size={14} className="inline mr-1.5 -mt-0.5" />
              指派巡检员
              <span className="text-neutral-400 font-normal ml-2">（可选，直接创建可后续派发）</span>
            </label>
            <button
              onClick={() => setShowInspectorDropdown(!showInspectorDropdown)}
              className="w-full input-field flex items-center justify-between"
            >
              {selectedInspector ? (
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center text-xs font-medium">
                    {selectedInspector.name[0]}
                  </div>
                  <span className="text-neutral-800">{selectedInspector.name}</span>
                  <span className="text-xs text-neutral-400">{selectedInspector.area}</span>
                  <span className="text-xs text-neutral-400">·</span>
                  <span className="text-xs text-neutral-400">{selectedInspector.pendingTasks}个待办</span>
                </div>
              ) : (
                <span className="text-neutral-400">请选择巡检员（可选）</span>
              )}
              <ChevronDown size={16} className="text-neutral-400" />
            </button>
            {showInspectorDropdown && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-dropdown border border-neutral-100 py-1 z-20 max-h-48 overflow-y-auto">
                {inspectors.map((ins) => (
                  <button
                    key={ins.id}
                    onClick={() => {
                      setSelectedInspectorId(ins.id);
                      setShowInspectorDropdown(false);
                    }}
                    className={`w-full px-3 py-2.5 flex items-center gap-3 hover:bg-neutral-50 text-left ${
                      selectedInspectorId === ins.id ? 'bg-primary-50' : ''
                    }`}
                  >
                    <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center text-sm font-medium">
                      {ins.name[0]}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-neutral-800">{ins.name}</div>
                      <div className="text-xs text-neutral-500">
                        {ins.area} · {ins.pendingTasks}个待办
                      </div>
                    </div>
                    {selectedInspectorId === ins.id && (
                      <CheckCircle size={16} className="text-primary-500" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={showRepairModal}
        onClose={() => {
          setShowRepairModal(false);
          setSelectedInspectorId('');
          setRepairDesc('');
        }}
        title="设备报修"
        size="md"
        footer={
          <>
            <button className="btn-secondary" onClick={() => {
              setShowRepairModal(false);
              setSelectedInspectorId('');
              setRepairDesc('');
            }}>
              取消
            </button>
            <button className="btn-warning flex items-center gap-1.5" onClick={handleCreateRepair}>
              <Wrench size={16} />
              {selectedInspectorId ? '派单报修' : '提交报修'}
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="bg-warning-50 border border-warning-100 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <MapPin size={14} className="text-warning-600" />
              <span className="font-medium text-neutral-800">{cabinet.name}</span>
            </div>
            <p className="text-xs text-neutral-500">{cabinet.address}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">故障描述</label>
            <textarea
              className="input-field min-h-[80px]"
              placeholder="请描述故障现象，如：屏幕黑屏、制冷异常、门无法打开等"
              value={repairDesc}
              onChange={(e) => setRepairDesc(e.target.value)}
            />
          </div>

          <div className="relative">
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              指派维修人员 <span className="text-neutral-400 font-normal">（可选）</span>
            </label>
            <button
              onClick={() => setShowInspectorDropdown(!showInspectorDropdown)}
              className="w-full input-field flex items-center justify-between"
            >
              {selectedInspector ? (
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-warning-100 text-warning-600 flex items-center justify-center text-xs font-medium">
                    {selectedInspector.name[0]}
                  </div>
                  <span className="text-neutral-800">{selectedInspector.name}</span>
                  <Phone size={12} className="text-neutral-400 ml-2" />
                  <span className="text-xs text-neutral-400">{selectedInspector.phone}</span>
                </div>
              ) : (
                <span className="text-neutral-400">请选择维修人员（可选）</span>
              )}
              <ChevronDown size={16} className="text-neutral-400" />
            </button>
            {showInspectorDropdown && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-dropdown border border-neutral-100 py-1 z-20 max-h-48 overflow-y-auto">
                {inspectors.map((ins) => (
                  <button
                    key={ins.id}
                    onClick={() => {
                      setSelectedInspectorId(ins.id);
                      setShowInspectorDropdown(false);
                    }}
                    className={`w-full px-3 py-2.5 flex items-center gap-3 hover:bg-neutral-50 text-left ${
                      selectedInspectorId === ins.id ? 'bg-primary-50' : ''
                    }`}
                  >
                    <div className="w-8 h-8 rounded-full bg-warning-100 text-warning-600 flex items-center justify-center text-sm font-medium">
                      {ins.name[0]}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-neutral-800">{ins.name}</div>
                      <div className="text-xs text-neutral-500">{ins.phone}</div>
                    </div>
                    {selectedInspectorId === ins.id && (
                      <CheckCircle size={16} className="text-primary-500" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          <p className="text-xs text-neutral-400 bg-neutral-50 p-3 rounded-lg">
            <Clock size={12} className="inline mr-1 -mt-0.5" />
            提交后将自动生成维修任务和设备异常记录，优先级为紧急
          </p>
        </div>
      </Modal>

      <Modal
        isOpen={showExceptionModal}
        onClose={() => {
          setShowExceptionModal(false);
          setSelectedInspectorId('');
          setExceptionDesc('');
          setExceptionType('device_fault');
          setExceptionSeverity('high');
        }}
        title="上报运营异常"
        size="md"
        footer={
          <>
            <button className="btn-secondary" onClick={() => {
              setShowExceptionModal(false);
              setSelectedInspectorId('');
              setExceptionDesc('');
            }}>
              取消
            </button>
            <button className="btn-danger flex items-center gap-1.5" onClick={handleReportException}>
              <AlertTriangle size={16} />
              提交异常
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="bg-danger-50 border border-danger-100 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <MapPin size={14} className="text-danger-600" />
              <span className="font-medium text-neutral-800">{cabinet.name}</span>
            </div>
            <p className="text-xs text-neutral-500">{cabinet.address}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">异常类型</label>
            <div className="grid grid-cols-2 gap-2">
              {(['device_fault', 'payment_error', 'temperature_abnormal', 'network_error'] as ExceptionType[]).map((type) => (
                <button
                  key={type}
                  onClick={() => setExceptionType(type)}
                  className={`px-3 py-2.5 rounded-lg text-sm border transition-colors ${
                    exceptionType === type
                      ? 'border-primary-500 bg-primary-50 text-primary-700 font-medium'
                      : 'border-neutral-200 text-neutral-600 hover:border-neutral-300'
                  }`}
                >
                  {getExceptionTypeText(type)}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">严重程度</label>
            <div className="flex gap-2">
              {(['low', 'medium', 'high', 'critical'] as ExceptionSeverity[]).map((sev) => (
                <button
                  key={sev}
                  onClick={() => setExceptionSeverity(sev)}
                  className={`flex-1 px-2 py-2 rounded-lg text-sm border transition-colors ${
                    exceptionSeverity === sev
                      ? sev === 'critical' || sev === 'high'
                        ? 'border-danger-500 bg-danger-50 text-danger-700 font-medium'
                        : sev === 'medium'
                        ? 'border-warning-500 bg-warning-50 text-warning-700 font-medium'
                        : 'border-success-500 bg-success-50 text-success-700 font-medium'
                      : 'border-neutral-200 text-neutral-600 hover:border-neutral-300'
                  }`}
                >
                  {getSeverityText(sev)}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">详细描述</label>
            <textarea
              className="input-field min-h-[80px]"
              placeholder="请描述异常情况..."
              value={exceptionDesc}
              onChange={(e) => setExceptionDesc(e.target.value)}
            />
          </div>

          <div className="relative">
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                安排处理人员 <span className="text-neutral-400 font-normal">（可选，将自动生成处理任务）</span>
              </label>
              <button
                onClick={() => setShowInspectorDropdown(!showInspectorDropdown)}
                className="w-full input-field flex items-center justify-between"
              >
                {selectedInspector ? (
                  <span className="text-neutral-800">{selectedInspector.name}</span>
                ) : (
                  <span className="text-neutral-400">选择人员将自动生成处理任务</span>
                )}
                <ChevronDown size={16} className="text-neutral-400" />
              </button>
              {showInspectorDropdown && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-dropdown border border-neutral-100 py-1 z-20 max-h-48 overflow-y-auto">
                  {inspectors.map((ins) => (
                    <button
                      key={ins.id}
                      onClick={() => {
                        setSelectedInspectorId(ins.id);
                        setShowInspectorDropdown(false);
                      }}
                      className={`w-full px-3 py-2.5 flex items-center gap-3 hover:bg-neutral-50 text-left ${
                        selectedInspectorId === ins.id ? 'bg-primary-50' : ''
                      }`}
                    >
                      <div className="w-8 h-8 rounded-full bg-neutral-100 text-neutral-600 flex items-center justify-center text-sm font-medium">
                        {ins.name[0]}
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-neutral-800">{ins.name}</div>
                        <div className="text-xs text-neutral-500">{ins.area} · {ins.pendingTasks}待办</div>
                      </div>
                      {selectedInspectorId === ins.id && (
                        <CheckCircle size={16} className="text-primary-500" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
        </div>
      </Modal>

      <Modal
        isOpen={showPriceModal}
        onClose={() => {
          setShowPriceModal(false);
          setSelectedProductId('');
          setNewPrice('');
        }}
        title="商品价格调整"
        size="md"
        footer={
          <>
            <button className="btn-secondary" onClick={() => {
              setShowPriceModal(false);
              setSelectedProductId('');
              setNewPrice('');
            }}>
              取消
            </button>
            <button 
              className="btn-primary flex items-center gap-1.5" 
              onClick={handleConfirmPrice}
              disabled={!selectedProductId || !newPrice || parseFloat(newPrice) <= 0}
            >
              <Tag size={16} />
              确认调整
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="bg-primary-50/50 border border-primary-100 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <MapPin size={14} className="text-primary-600" />
              <span className="font-medium text-neutral-800">{cabinet.name}</span>
            </div>
            <p className="text-xs text-neutral-500">价格调整后将在所有点位同步生效</p>
          </div>

          <div className="relative">
            <label className="block text-sm font-medium text-neutral-700 mb-2">选择商品</label>
            <button
              onClick={() => setShowProductDropdown(!showProductDropdown)}
              className="w-full input-field flex items-center justify-between"
            >
              {selectedProduct ? (
                <div className="flex items-center gap-3">
                  <span className="text-neutral-800 font-medium">{selectedProduct.name}</span>
                  <span className="text-xs text-neutral-400 bg-neutral-100 px-2 py-0.5 rounded">
                    {selectedProduct.category}
                  </span>
                </div>
              ) : (
                <span className="text-neutral-400">请选择商品</span>
              )}
              <ChevronDown size={16} className="text-neutral-400" />
            </button>
            {showProductDropdown && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-dropdown border border-neutral-100 py-1 z-20 max-h-56 overflow-y-auto">
                {products.map((prod) => (
                  <button
                    key={prod.id}
                    onClick={() => {
                      setSelectedProductId(prod.id);
                      setNewPrice(prod.currentPrice.toString());
                      setShowProductDropdown(false);
                    }}
                    className={`w-full px-3 py-2.5 flex items-center justify-between hover:bg-neutral-50 text-left ${
                      selectedProductId === prod.id ? 'bg-primary-50' : ''
                    }`}
                  >
                    <div>
                      <div className="text-sm font-medium text-neutral-800">{prod.name}</div>
                      <div className="text-xs text-neutral-500">{prod.category}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-primary-600">{formatCurrency(prod.currentPrice)}</div>
                      <div className="text-xs text-neutral-400 line-through">{formatCurrency(prod.basePrice)}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {selectedProduct && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">当前价格</label>
                  <div className="input-field bg-neutral-50 text-neutral-500 flex items-center">
                    <span className="text-lg font-bold text-neutral-400">{formatCurrency(selectedProduct.currentPrice)}</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">新价格</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400">¥</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={newPrice}
                      onChange={(e) => setNewPrice(e.target.value)}
                      className="input-field pl-7 font-semibold text-primary-600"
                      placeholder="0.00"
                    />
                  </div>
                </div>
              </div>

              {newPrice && parseFloat(newPrice) !== selectedProduct.currentPrice && (
                <div className={`p-3 rounded-lg text-sm ${
                  parseFloat(newPrice) > selectedProduct.currentPrice 
                    ? 'bg-warning-50 text-warning-700 border border-warning-100' 
                    : 'bg-success-50 text-success-700 border border-success-100'
                }`}>
                  价格调整：{formatCurrency(selectedProduct.currentPrice)} → {formatCurrency(parseFloat(newPrice))}
                  <span className="ml-2 font-medium">
                    {parseFloat(newPrice) > selectedProduct.currentPrice ? '↑ 上涨' : '↓ 下降'} 
                    {Math.abs(((parseFloat(newPrice) - selectedProduct.currentPrice) / selectedProduct.currentPrice) * 100).toFixed(1)}%
                  </span>
                </div>
              )}
            </>
          )}

          <p className="text-xs text-neutral-400 bg-neutral-50 p-3 rounded-lg">
            提示：价格调整为全局生效，所有货柜的该商品价格将同步更新，并记录调价历史
          </p>
        </div>
      </Modal>
    </div>
  );
};

export default QuickActions;
