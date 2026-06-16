import React, { useState } from 'react';
import { Plus, Wrench, AlertTriangle, Tag, Send } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import { useTaskStore } from '@/store/taskStore';
import { useExceptionStore } from '@/store/exceptionStore';
import { Cabinet } from '@/types';

interface QuickActionsProps {
  cabinet: Cabinet;
}

const QuickActions: React.FC<QuickActionsProps> = ({ cabinet }) => {
  const [showReplenishModal, setShowReplenishModal] = useState(false);
  const [showRepairModal, setShowRepairModal] = useState(false);
  const [showExceptionModal, setShowExceptionModal] = useState(false);
  const [showPriceModal, setShowPriceModal] = useState(false);
  const { createTask } = useTaskStore();
  const { addException } = useExceptionStore();

  const handleCreateReplenishment = () => {
    createTask({
      cabinetId: cabinet.id,
      cabinet,
      type: 'replenishment',
      priority: 'high',
      description: `${cabinet.name} - 运营人员发起的补货任务`,
      dueTime: new Date(Date.now() + 4 * 3600 * 1000),
    });
    setShowReplenishModal(false);
  };

  const handleCreateRepair = () => {
    createTask({
      cabinetId: cabinet.id,
      cabinet,
      type: 'maintenance',
      priority: 'urgent',
      description: `${cabinet.name} - 设备维修`,
      dueTime: new Date(Date.now() + 2 * 3600 * 1000),
    });
    setShowRepairModal(false);
  };

  const handleReportException = () => {
    addException({
      cabinetId: cabinet.id,
      cabinet,
      type: 'device_fault',
      severity: 'high',
      description: `${cabinet.name} - 运营人员上报异常`,
    });
    setShowExceptionModal(false);
  };

  return (
    <div className="card p-6 mb-6">
      <h2 className="text-lg font-semibold text-neutral-800 mb-4">快捷操作</h2>
      <div className="grid grid-cols-4 gap-4">
        <button
          onClick={() => setShowReplenishModal(true)}
          className="flex flex-col items-center gap-3 p-5 rounded-xl bg-success-50 hover:bg-success-100/70 transition-colors group"
        >
          <div className="w-12 h-12 rounded-xl bg-success-500 flex items-center justify-center shadow-lg shadow-success-500/20 group-hover:scale-105 transition-transform">
            <Plus size={24} className="text-white" />
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-success-700">发起补货</p>
            <p className="text-xs text-success-600/70 mt-0.5">创建补货任务并派单</p>
          </div>
        </button>

        <button
          onClick={() => setShowRepairModal(true)}
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
          onClick={() => setShowExceptionModal(true)}
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
          onClick={() => setShowPriceModal(true)}
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
        onClose={() => setShowReplenishModal(false)}
        title="确认发起补货"
        size="md"
        footer={
          <>
            <button className="btn-secondary" onClick={() => setShowReplenishModal(false)}>取消</button>
            <button className="btn-success flex items-center gap-1.5" onClick={handleCreateReplenishment}>
              <Send size={16} />
              确认发起
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-sm text-neutral-600">
            确定要为 <span className="font-semibold text-neutral-800">{cabinet.name}</span> 发起补货任务吗？
          </p>
          <div className="bg-neutral-50 rounded-xl p-4">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-neutral-500">货柜位置</span>
              <span className="text-neutral-800">{cabinet.address}</span>
            </div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-neutral-500">任务类型</span>
              <span className="text-neutral-800">紧急补货</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-neutral-500">预计完成时间</span>
              <span className="text-neutral-800">4小时内</span>
            </div>
          </div>
          <p className="text-xs text-neutral-400">
            系统将自动创建任务并分配给 {cabinet.location} 区域的巡检员
          </p>
        </div>
      </Modal>

      <Modal
        isOpen={showRepairModal}
        onClose={() => setShowRepairModal(false)}
        title="确认设备报修"
        size="md"
        footer={
          <>
            <button className="btn-secondary" onClick={() => setShowRepairModal(false)}>取消</button>
            <button className="btn-warning flex items-center gap-1.5" onClick={handleCreateRepair}>
              <Wrench size={16} />
              提交报修
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-sm text-neutral-600">
            确定要为 <span className="font-semibold text-neutral-800">{cabinet.name}</span> 提交设备报修吗？
          </p>
          <div className="bg-danger-50 rounded-xl p-4 border border-danger-100">
            <p className="text-sm text-danger-700">报修任务将标记为紧急优先级</p>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={showExceptionModal}
        onClose={() => setShowExceptionModal(false)}
        title="上报运营异常"
        size="md"
        footer={
          <>
            <button className="btn-secondary" onClick={() => setShowExceptionModal(false)}>取消</button>
            <button className="btn-danger flex items-center gap-1.5" onClick={handleReportException}>
              <AlertTriangle size={16} />
              提交异常
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-sm text-neutral-600">请填写异常信息：</p>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">异常类型</label>
            <select className="input-field">
              <option>设备故障</option>
              <option>支付异常</option>
              <option>温度异常</option>
              <option>网络故障</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">详细描述</label>
            <textarea className="input-field min-h-[100px]" placeholder="请描述异常情况..." />
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={showPriceModal}
        onClose={() => setShowPriceModal(false)}
        title="商品价格调整"
        size="md"
        footer={
          <>
            <button className="btn-secondary" onClick={() => setShowPriceModal(false)}>取消</button>
            <button className="btn-primary flex items-center gap-1.5" onClick={() => setShowPriceModal(false)}>
              <Tag size={16} />
              确认调整
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">选择商品</label>
            <select className="input-field">
              <option>可口可乐 500ml - ¥3.50</option>
              <option>农夫山泉 550ml - ¥2.00</option>
              <option>乐事薯片 原味 70g - ¥6.50</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">当前价格</label>
              <div className="input-field bg-neutral-50 text-neutral-400">¥3.50</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">新价格</label>
              <input type="number" className="input-field" placeholder="请输入新价格" />
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default QuickActions;
