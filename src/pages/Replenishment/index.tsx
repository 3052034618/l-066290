import React, { useState, useMemo } from 'react';
import {
  Route,
  MapPin,
  User,
  Clock,
  Package,
  Send,
  ChevronRight,
  CheckCircle,
  Map,
  Navigation,
  Phone,
  Briefcase,
} from 'lucide-react';
import StatusBadge from '@/components/ui/StatusBadge';
import Modal from '@/components/ui/Modal';
import StatCard from '@/components/ui/StatCard';
import { useTaskStore } from '@/store/taskStore';
import { formatDate } from '@/utils/date';
import { Task } from '@/types';

const ReplenishmentPage: React.FC = () => {
  const { getReplenishmentTasks, inspectors, assignTask } = useTaskStore();

  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [selectedInspector, setSelectedInspector] = useState<string>('');

  const replenishmentTasks = useMemo(() => getReplenishmentTasks(), [getReplenishmentTasks]);

  const pendingTasks = useMemo(
    () => replenishmentTasks.filter((t) => t.status === 'pending' || t.status === 'assigned'),
    [replenishmentTasks]
  );
  const inProgressTasks = useMemo(
    () => replenishmentTasks.filter((t) => t.status === 'in_progress'),
    [replenishmentTasks]
  );
  const completedTasks = useMemo(
    () => replenishmentTasks.filter((t) => t.status === 'completed'),
    [replenishmentTasks]
  );

  const tasksByArea = useMemo(() => {
    const map: Record<string, Task[]> = {};
    pendingTasks.forEach((task) => {
      const area = task.cabinet?.location || '其他';
      if (!map[area]) map[area] = [];
      map[area].push(task);
    });
    return map;
  }, [pendingTasks]);

  const sortedAreas = useMemo(() => {
    return Object.entries(tasksByArea)
      .sort((a, b) => b[1].length - a[1].length)
      .map(([area, tasks]) => ({ area, tasks }));
  }, [tasksByArea]);

  const handleOpenAssignModal = (task: Task) => {
    setSelectedTask(task);
    setSelectedInspector(task.inspectorId || '');
    setAssignModalOpen(true);
  };

  const handleConfirmAssign = () => {
    if (selectedTask && selectedInspector) {
      assignTask(selectedTask.id, selectedInspector);
      setAssignModalOpen(false);
      setSelectedTask(null);
      setSelectedInspector('');
    }
  };

  const getPriorityColor = (priority: string) => {
    const map: Record<string, string> = {
      low: 'bg-success-100 text-success-700 border-success-200',
      medium: 'bg-warning-100 text-warning-700 border-warning-200',
      high: 'bg-danger-100 text-danger-700 border-danger-200',
      urgent: 'bg-danger-500 text-white border-danger-600',
    };
    return map[priority] || 'bg-neutral-100 text-neutral-700 border-neutral-200';
  };

  const getPriorityLabel = (priority: string) => {
    const map: Record<string, string> = {
      low: '低',
      medium: '中',
      high: '高',
      urgent: '紧急',
    };
    return map[priority] || priority;
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-neutral-800 mb-1">补货路线</h1>
        <p className="text-sm text-neutral-500">智能规划补货路线，高效完成巡检任务</p>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        <StatCard
          title="待补货任务"
          value={pendingTasks.length}
          suffix="单"
          icon={Package}
          iconBg="bg-warning-50"
          iconColor="text-warning-600"
        />
        <StatCard
          title="进行中"
          value={inProgressTasks.length}
          suffix="单"
          icon={Navigation}
          iconBg="bg-primary-50"
          iconColor="text-primary-600"
        />
        <StatCard
          title="已完成"
          value={completedTasks.length}
          suffix="单"
          icon={CheckCircle}
          iconBg="bg-success-50"
          iconColor="text-success-600"
        />
        <StatCard
          title="可用巡检员"
          value={inspectors.length}
          suffix="人"
          icon={User}
          iconBg="bg-primary-50"
          iconColor="text-primary-600"
        />
      </div>

      <div className="grid grid-cols-5 gap-6">
        <div className="col-span-3 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-neutral-800 flex items-center gap-2">
              <Package size={20} className="text-primary-500" />
              补货任务清单
            </h2>
            <span className="text-sm text-neutral-500">共 {pendingTasks.length} 个待处理任务</span>
          </div>

          {pendingTasks.length === 0 ? (
            <div className="card p-16 text-center text-neutral-400">
              <CheckCircle size={48} className="mx-auto mb-3 text-success-300" />
              <p className="text-lg">暂无待处理的补货任务</p>
              <p className="text-sm mt-1">所有任务均已派发或完成</p>
            </div>
          ) : (
            <div className="space-y-4">
              {sortedAreas.map(({ area, tasks }) => (
                <div key={area} className="space-y-3">
                  <div className="flex items-center gap-2">
                    <MapPin size={16} className="text-primary-500" />
                    <span className="font-medium text-neutral-700">{area}</span>
                    <span className="badge-primary">{tasks.length}个货柜</span>
                  </div>
                  {tasks.map((task, index) => (
                    <div
                      key={task.id}
                      className="card p-4 hover:shadow-card-hover transition-all"
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center text-sm font-semibold">
                          {index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4 mb-2">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold text-neutral-800">
                                  {task.cabinet?.name}
                                </h3>
                                <span
                                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getPriorityColor(
                                    task.priority
                                  )}`}
                                >
                                  {getPriorityLabel(task.priority)}优先级
                                </span>
                                <StatusBadge status={task.status} />
                              </div>
                              <p className="text-sm text-neutral-500 flex items-center gap-1">
                                <MapPin size={14} />
                                {task.cabinet?.address}
                              </p>
                            </div>
                            <button
                              onClick={() => handleOpenAssignModal(task)}
                              className="btn-primary flex items-center gap-1.5 flex-shrink-0"
                              disabled={task.status === 'in_progress' || task.status === 'completed'}
                            >
                              <Send size={16} />
                              {task.inspector ? '改派' : '派发'}
                            </button>
                          </div>

                          {task.description && (
                            <p className="text-sm text-neutral-600 mb-3">{task.description}</p>
                          )}

                          <div className="flex items-center gap-6 flex-wrap">
                            <div className="flex items-center gap-1.5 text-sm text-neutral-500">
                              <Clock size={14} />
                              截止：{formatDate(task.dueTime, 'MM-DD HH:mm')}
                            </div>
                            {task.inspector && (
                              <div className="flex items-center gap-1.5 text-sm text-neutral-500">
                                <User size={14} />
                                负责人：{task.inspector.name}
                              </div>
                            )}
                            {task.products && task.products.length > 0 && (
                              <div className="flex items-center gap-1.5 text-sm text-neutral-500">
                                <Package size={14} />
                                需补 {task.products.length} 种商品
                              </div>
                            )}
                          </div>

                          {task.products && task.products.length > 0 && (
                            <div className="mt-3 pt-3 border-t border-neutral-100">
                              <div className="flex flex-wrap gap-2">
                                {task.products.map((p, idx) => (
                                  <span
                                    key={idx}
                                    className="inline-flex items-center px-2.5 py-1 rounded-md bg-neutral-50 text-sm text-neutral-600"
                                  >
                                    {p.productName}
                                    <span className="text-primary-600 font-medium ml-1">
                                      ×{p.quantity}
                                    </span>
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="col-span-2 space-y-4">
          <div className="card p-4">
            <h2 className="text-lg font-semibold text-neutral-800 flex items-center gap-2 mb-4">
              <Map size={20} className="text-primary-500" />
              路线规划
            </h2>
            {sortedAreas.length === 0 ? (
              <div className="py-12 text-center text-neutral-400">
                <Route size={40} className="mx-auto mb-2 opacity-50" />
                <p>暂无待规划路线</p>
              </div>
            ) : (
              <div className="space-y-6">
                {sortedAreas.map(({ area, tasks }, areaIdx) => (
                  <div key={area}>
                    <div className="flex items-center gap-2 mb-3">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${
                          areaIdx === 0
                            ? 'bg-primary-500 text-white'
                            : 'bg-neutral-100 text-neutral-600'
                        }`}
                      >
                        {areaIdx + 1}
                      </div>
                      <span className="font-medium text-neutral-800">{area}区域</span>
                      <span className="text-xs text-neutral-500 ml-auto">
                        {tasks.length} 个点位
                      </span>
                    </div>
                    <div className="ml-3 pl-4 border-l-2 border-dashed border-neutral-200 space-y-3">
                      {tasks.map((task, idx) => (
                        <div key={task.id} className="relative">
                          <div
                            className={`absolute -left-[25px] top-1 w-4 h-4 rounded-full border-2 border-white shadow ${
                              task.priority === 'urgent' || task.priority === 'high'
                                ? 'bg-danger-500'
                                : task.priority === 'medium'
                                ? 'bg-warning-500'
                                : 'bg-success-500'
                            }`}
                          />
                          <div className="bg-neutral-50 rounded-lg p-3">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-medium text-neutral-800">
                                {idx + 1}. {task.cabinet?.name}
                              </p>
                              <ChevronRight size={16} className="text-neutral-400" />
                            </div>
                            <p className="text-xs text-neutral-500 mt-1 truncate">
                              {task.cabinet?.address}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="card p-4">
            <h2 className="text-lg font-semibold text-neutral-800 flex items-center gap-2 mb-4">
              <User size={20} className="text-primary-500" />
              巡检员列表
            </h2>
            <div className="space-y-3">
              {inspectors.map((inspector) => {
                const inspectorTasks = pendingTasks.filter(
                  (t) => t.inspectorId === inspector.id
                );
                return (
                  <div
                    key={inspector.id}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-neutral-50 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                      <User size={20} className="text-primary-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-neutral-800">{inspector.name}</p>
                        <span className="badge-primary">{inspector.area}</span>
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-neutral-500">
                        <span className="flex items-center gap-1">
                          <Phone size={12} />
                          {inspector.phone}
                        </span>
                        <span className="flex items-center gap-1">
                          <Briefcase size={12} />
                          {inspector.pendingTasks + inspectorTasks.length} 个任务
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <Modal
        isOpen={assignModalOpen}
        onClose={() => {
          setAssignModalOpen(false);
          setSelectedTask(null);
          setSelectedInspector('');
        }}
        title="派发任务"
        size="md"
        footer={
          <>
            <button
              onClick={() => {
                setAssignModalOpen(false);
                setSelectedTask(null);
                setSelectedInspector('');
              }}
              className="btn-secondary"
            >
              取消
            </button>
            <button
              onClick={handleConfirmAssign}
              className="btn-primary"
              disabled={!selectedInspector}
            >
              <Send size={16} />
              确认派发
            </button>
          </>
        }
      >
        {selectedTask && (
          <div className="space-y-5">
            <div className="p-4 bg-neutral-50 rounded-xl space-y-2">
              <h3 className="font-semibold text-neutral-800">{selectedTask.cabinet?.name}</h3>
              <p className="text-sm text-neutral-500 flex items-center gap-1">
                <MapPin size={14} />
                {selectedTask.cabinet?.address}
              </p>
              <p className="text-sm text-neutral-600">{selectedTask.description}</p>
              <div className="flex items-center gap-4 pt-2">
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getPriorityColor(
                    selectedTask.priority
                  )}`}
                >
                  {getPriorityLabel(selectedTask.priority)}优先级
                </span>
                <span className="text-sm text-neutral-500 flex items-center gap-1">
                  <Clock size={14} />
                  截止 {formatDate(selectedTask.dueTime, 'MM-DD HH:mm')}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-3">
                选择巡检员
              </label>
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {inspectors.map((inspector) => {
                  const inspectorTasks = pendingTasks.filter(
                    (t) => t.inspectorId === inspector.id && t.id !== selectedTask.id
                  );
                  const isSelected = selectedInspector === inspector.id;
                  return (
                    <label
                      key={inspector.id}
                      className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="inspector"
                        value={inspector.id}
                        checked={isSelected}
                        onChange={() => setSelectedInspector(inspector.id)}
                        className="w-4 h-4 text-primary-500 focus:ring-primary-500"
                      />
                      <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                        <User size={18} className="text-primary-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-neutral-800">{inspector.name}</span>
                          <span className="badge-primary text-xs">{inspector.area}</span>
                        </div>
                        <div className="flex items-center gap-3 mt-0.5 text-xs text-neutral-500">
                          <span>{inspector.phone}</span>
                          <span>当前 {inspector.pendingTasks + inspectorTasks.length} 个任务</span>
                        </div>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ReplenishmentPage;
