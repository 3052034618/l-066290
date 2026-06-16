import React, { useState, useMemo } from 'react';
import { AlertTriangle, Plus, Clock, CheckCircle2, Loader2, MapPin, Calendar, User, ChevronDown, CheckCircle } from 'lucide-react';
import { useExceptionStore } from '@/store/exceptionStore';
import { useAnalyticsStore } from '@/store/analyticsStore';
import { useCabinetStore } from '@/store/cabinetStore';
import { useTaskStore } from '@/store/taskStore';
import StatusBadge from '@/components/ui/StatusBadge';
import Modal from '@/components/ui/Modal';
import { getExceptionTypeText } from '@/utils/format';
import { formatDate, formatRelativeTime } from '@/utils/date';
import { ExceptionType, ExceptionSeverity, ExceptionStatus } from '@/types';

const typeTabs: { key: ExceptionType | 'all'; label: string }[] = [
  { key: 'all', label: '全部异常' },
  { key: 'device_fault', label: '设备故障' },
  { key: 'payment_error', label: '支付异常' },
  { key: 'temperature_abnormal', label: '温度异常' },
  { key: 'network_error', label: '网络故障' },
];

const kanbanColumns: { key: ExceptionStatus; label: string; icon: React.ElementType; color: string }[] = [
  { key: 'pending', label: '待处理', icon: Clock, color: 'text-warning-600 bg-warning-50' },
  { key: 'processing', label: '处理中', icon: Loader2, color: 'text-primary-600 bg-primary-50' },
  { key: 'resolved', label: '已解决', icon: CheckCircle2, color: 'text-success-600 bg-success-50' },
];

const ExceptionsPage: React.FC = () => {
  const {
    exceptions,
    selectedType,
    setSelectedType,
    addException,
    updateExceptionHandler,
    updateStatus,
    setRelatedTask,
    getStats,
  } = useExceptionStore();
  const { getPaymentExceptions } = useAnalyticsStore();
  const { cabinets } = useCabinetStore();
  const { inspectors, createTask, assignTask } = useTaskStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showInspectorDropdown, setShowInspectorDropdown] = useState(false);
  const [formData, setFormData] = useState({
    cabinetId: '',
    type: 'device_fault' as ExceptionType,
    severity: 'medium' as ExceptionSeverity,
    description: '',
    handlerId: '',
    handlerName: '',
  });

  const stats = getStats();
  const paymentExceptions = getPaymentExceptions();
  const selectedInspector = inspectors.find(i => i.id === formData.handlerId);

  const filteredByStatus = useMemo(() => {
    const filtered = selectedType === 'all'
      ? exceptions
      : exceptions.filter(e => e.type === selectedType);
    return {
      pending: filtered.filter(e => e.status === 'pending'),
      processing: filtered.filter(e => e.status === 'processing'),
      resolved: filtered.filter(e => e.status === 'resolved'),
    };
  }, [exceptions, selectedType]);

  const getExceptionTypeTaskType = (type: ExceptionType): 'maintenance' | 'inspection' => {
    if (type === 'device_fault' || type === 'network_error') return 'maintenance';
    return 'inspection';
  };

  const handleSubmit = () => {
    if (!formData.cabinetId || !formData.description) return;

    const selectedCabinet = cabinets.find(c => c.id === formData.cabinetId);

    const exceptionId = addException({
      cabinetId: formData.cabinetId,
      cabinet: selectedCabinet,
      type: formData.type,
      severity: formData.severity,
      description: formData.description,
    });

    if (formData.handlerId) {
      updateExceptionHandler(exceptionId, formData.handlerId, formData.handlerName);
      
      const taskId = `t${Date.now()}`;
      const priority = formData.severity === 'critical' || formData.severity === 'high' ? 'urgent' : 'high';
      
      createTask({
        id: taskId,
        cabinetId: formData.cabinetId,
        cabinet: selectedCabinet,
        type: getExceptionTypeTaskType(formData.type),
        priority,
        description: formData.description || `${selectedCabinet?.name || '未知货柜'} - ${getExceptionTypeText(formData.type)}处理`,
        dueTime: new Date(Date.now() + 3 * 3600 * 1000),
        exceptionId,
      });
      
      assignTask(taskId, formData.handlerId);
      setRelatedTask(exceptionId, taskId);
    }

    setFormData({ cabinetId: '', type: 'device_fault', severity: 'medium', description: '', handlerId: '', handlerName: '' });
    setIsModalOpen(false);
    setShowInspectorDropdown(false);
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-neutral-800 mb-1">异常处理</h1>
        <p className="text-sm text-neutral-500">跟踪和处理设备故障、支付异常等运营问题</p>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-neutral-100 flex items-center justify-center">
              <AlertTriangle size={20} className="text-neutral-600" />
            </div>
            <div>
              <p className="text-xs text-neutral-500">异常总数</p>
              <p className="text-xl font-bold text-neutral-800">{stats.total}</p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-warning-50 flex items-center justify-center">
              <Clock size={20} className="text-warning-600" />
            </div>
            <div>
              <p className="text-xs text-neutral-500">待处理</p>
              <p className="text-xl font-bold text-warning-600">{stats.pending}</p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center">
              <Loader2 size={20} className="text-primary-600" />
            </div>
            <div>
              <p className="text-xs text-neutral-500">处理中</p>
              <p className="text-xl font-bold text-primary-600">{stats.processing}</p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-success-50 flex items-center justify-center">
              <CheckCircle2 size={20} className="text-success-600" />
            </div>
            <div>
              <p className="text-xs text-neutral-500">已解决</p>
              <p className="text-xl font-bold text-success-600">{stats.resolved}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-neutral-100">
          {typeTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setSelectedType(tab.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                selectedType === tab.key
                  ? 'bg-primary-500 text-white'
                  : 'text-neutral-600 hover:bg-neutral-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="btn-primary"
        >
          <Plus size={16} className="mr-1.5" />
          登记故障
        </button>
      </div>

      <div className="flex gap-4 mb-6 overflow-x-auto pb-2">
        {kanbanColumns.map((col) => {
          const Icon = col.icon;
          const items = filteredByStatus[col.key];
          return (
            <div key={col.key} className="kanban-column flex-shrink-0">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${col.color}`}>
                    <Icon size={16} />
                  </div>
                  <span className="font-semibold text-neutral-700">{col.label}</span>
                  <span className="badge bg-neutral-200 text-neutral-600">{items.length}</span>
                </div>
              </div>
              <div className="space-y-3">
                {items.map((item) => (
                  <div key={item.id} className="kanban-card">
                    <div className="flex items-start justify-between mb-3">
                      <StatusBadge status={item.type} type="status" customText={getExceptionTypeText(item.type)} />
                      <StatusBadge status={item.severity} type="severity" />
                    </div>
                    <div className="flex items-center gap-1.5 text-sm text-neutral-600 mb-2">
                      <MapPin size={14} className="text-neutral-400" />
                      <span>{item.cabinet?.name || '未知货柜'}</span>
                    </div>
                    <p className="text-sm text-neutral-700 mb-3 line-clamp-2">{item.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs text-neutral-400">
                        <Calendar size={12} />
                        <span>{formatRelativeTime(item.createdAt)}</span>
                      </div>
                      {col.key === 'pending' && (
                        <button
                          onClick={() => updateStatus(item.id, 'processing')}
                          className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                        >
                          开始处理
                        </button>
                      )}
                      {col.key === 'processing' && (
                        <button
                          onClick={() => updateStatus(item.id, 'resolved')}
                          className="text-xs text-success-600 hover:text-success-700 font-medium"
                        >
                          标记解决
                        </button>
                      )}
                      {col.key === 'resolved' && item.resolvedAt && (
                        <span className="text-xs text-neutral-400">
                          {formatDate(item.resolvedAt, 'MM-DD HH:mm')}
                        </span>
                      )}
                    </div>
                    {item.handlerName && (
                      <div className="mt-2 pt-2 border-t border-neutral-100 flex items-center gap-1.5">
                        <User size={12} className="text-neutral-400" />
                        <span className="text-xs text-neutral-500">处理人: {item.handlerName}</span>
                      </div>
                    )}
                    {item.relatedTaskId && (
                      <div className="mt-1 flex items-center gap-1.5">
                        <CheckCircle size={12} className="text-primary-400" />
                        <span className="text-xs text-neutral-500">已生成任务待办</span>
                      </div>
                    )}
                  </div>
                ))}
                {items.length === 0 && (
                  <div className="text-center py-8 text-sm text-neutral-400">
                    暂无{col.label}异常
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="card p-6">
        <h3 className="text-lg font-semibold text-neutral-800 mb-4">支付异常列表</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-100">
                <th className="table-header">订单号</th>
                <th className="table-header">货柜</th>
                <th className="table-header">商品</th>
                <th className="table-header">金额</th>
                <th className="table-header">支付状态</th>
                <th className="table-header">交易时间</th>
              </tr>
            </thead>
            <tbody>
              {paymentExceptions.map((record) => (
                <tr key={record.id} className="border-b border-neutral-50 hover:bg-neutral-50">
                  <td className="table-cell font-mono text-xs">{record.id}</td>
                  <td className="table-cell">{cabinets.find(c => c.id === record.cabinetId)?.name || '-'}</td>
                  <td className="table-cell">{record.product?.name || '-'}</td>
                  <td className="table-cell font-medium">¥{record.amount.toFixed(2)}</td>
                  <td className="table-cell">
                    <StatusBadge status={record.paymentStatus} />
                  </td>
                  <td className="table-cell text-neutral-500">{formatDate(record.saleTime)}</td>
                </tr>
              ))}
              {paymentExceptions.length === 0 && (
                <tr>
                  <td colSpan={6} className="table-cell text-center text-neutral-400 py-8">
                    暂无支付异常
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setShowInspectorDropdown(false);
        }}
        title="登记异常"
        footer={
          <>
            <button className="btn-secondary" onClick={() => {
              setIsModalOpen(false);
              setShowInspectorDropdown(false);
            }}>
              取消
            </button>
            <button
              className="btn-primary"
              onClick={handleSubmit}
              disabled={!formData.cabinetId || !formData.description}
            >
              提交
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">
              选择货柜 <span className="text-danger-500">*</span>
            </label>
            <select
              value={formData.cabinetId}
              onChange={(e) => setFormData({ ...formData, cabinetId: e.target.value })}
              className="input-field"
            >
              <option value="">请选择货柜</option>
              {cabinets.map((cabinet) => (
                <option key={cabinet.id} value={cabinet.id}>
                  {cabinet.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">
              异常类型
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(['device_fault', 'payment_error', 'temperature_abnormal', 'network_error'] as ExceptionType[]).map((type) => (
                <button
                  key={type}
                  onClick={() => setFormData({ ...formData, type })}
                  className={`px-3 py-2.5 rounded-lg text-sm border transition-colors ${
                    formData.type === type
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
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">
              严重程度
            </label>
            <div className="flex gap-2">
              {(['low', 'medium', 'high', 'critical'] as ExceptionSeverity[]).map((sev) => (
                <button
                  key={sev}
                  onClick={() => setFormData({ ...formData, severity: sev })}
                  className={`flex-1 px-2 py-2 rounded-lg text-sm border transition-colors ${
                    formData.severity === sev
                      ? sev === 'critical' || sev === 'high'
                        ? 'border-danger-500 bg-danger-50 text-danger-700 font-medium'
                        : sev === 'medium'
                        ? 'border-warning-500 bg-warning-50 text-warning-700 font-medium'
                        : 'border-success-500 bg-success-50 text-success-700 font-medium'
                      : 'border-neutral-200 text-neutral-600 hover:border-neutral-300'
                  }`}
                >
                  {sev === 'low' ? '低' : sev === 'medium' ? '中' : sev === 'high' ? '高' : '紧急'}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">
              异常描述 <span className="text-danger-500">*</span>
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              placeholder="请详细描述异常情况..."
              className="input-field resize-none"
            />
          </div>

          <div className="relative">
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">
              安排处理人员 <span className="text-neutral-400 font-normal">（可选，将自动生成处理任务）</span>
            </label>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowInspectorDropdown(!showInspectorDropdown);
              }}
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
                <span className="text-neutral-400">请选择处理人员（可选）</span>
              )}
              <ChevronDown size={16} className="text-neutral-400" />
            </button>
            {showInspectorDropdown && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-dropdown border border-neutral-100 py-1 z-20 max-h-48 overflow-y-auto">
                {inspectors.map((ins) => (
                  <button
                    key={ins.id}
                    onClick={() => {
                      setFormData({ ...formData, handlerId: ins.id, handlerName: ins.name });
                      setShowInspectorDropdown(false);
                    }}
                    className={`w-full px-3 py-2.5 flex items-center gap-3 hover:bg-neutral-50 text-left ${
                      formData.handlerId === ins.id ? 'bg-primary-50' : ''
                    }`}
                  >
                    <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center text-sm font-medium">
                      {ins.name[0]}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-neutral-800">{ins.name}</div>
                      <div className="text-xs text-neutral-500">{ins.area} · {ins.pendingTasks}个待办</div>
                    </div>
                    {formData.handlerId === ins.id && (
                      <CheckCircle size={16} className="text-primary-500" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ExceptionsPage;
