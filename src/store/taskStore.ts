import { create } from 'zustand';
import { Task, TaskStatus, TaskPriority, TaskType } from '@/types';
import { mockTasks } from '@/mock/tasks';
import { mockInspectors } from '@/mock/inspectors';
import { Inspector } from '@/types';

interface TaskState {
  tasks: Task[];
  inspectors: Inspector[];
  selectedStatus: TaskStatus | 'all';
  selectedType: TaskType | 'all';
  selectedPriority: TaskPriority | 'all';
  setSelectedStatus: (status: TaskStatus | 'all') => void;
  setSelectedType: (type: TaskType | 'all') => void;
  setSelectedPriority: (priority: TaskPriority | 'all') => void;
  getFilteredTasks: () => Task[];
  getPendingTasks: () => Task[];
  getReplenishmentTasks: () => Task[];
  assignTask: (taskId: string, inspectorId: string) => void;
  updateTaskStatus: (taskId: string, status: TaskStatus) => void;
  createTask: (data: Omit<Task, 'id' | 'createdAt' | 'status'>) => void;
  getStats: () => {
    total: number;
    pending: number;
    inProgress: number;
    completed: number;
  };
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: mockTasks,
  inspectors: mockInspectors,
  selectedStatus: 'all',
  selectedType: 'all',
  selectedPriority: 'all',
  
  setSelectedStatus: (status) => set({ selectedStatus: status }),
  setSelectedType: (type) => set({ selectedType: type }),
  setSelectedPriority: (priority) => set({ selectedPriority: priority }),
  
  getFilteredTasks: () => {
    const { tasks, selectedStatus, selectedType, selectedPriority } = get();
    return tasks.filter(t => {
      const matchStatus = selectedStatus === 'all' || t.status === selectedStatus;
      const matchType = selectedType === 'all' || t.type === selectedType;
      const matchPriority = selectedPriority === 'all' || t.priority === selectedPriority;
      return matchStatus && matchType && matchPriority;
    });
  },
  
  getPendingTasks: () => {
    return get().tasks.filter(t => t.status === 'pending' || t.status === 'assigned');
  },
  
  getReplenishmentTasks: () => {
    return get().tasks.filter(t => t.type === 'replenishment');
  },
  
  assignTask: (taskId, inspectorId) => {
    const inspector = get().inspectors.find(i => i.id === inspectorId);
    set(state => ({
      tasks: state.tasks.map(t => 
        t.id === taskId 
          ? { ...t, inspectorId, inspector, status: 'assigned' as TaskStatus } 
          : t
      ),
    }));
  },
  
  updateTaskStatus: (taskId, status) => {
    set(state => ({
      tasks: state.tasks.map(t => 
        t.id === taskId 
          ? { 
              ...t, 
              status, 
              completedAt: status === 'completed' ? new Date() : t.completedAt 
            } 
          : t
      ),
    }));
  },
  
  createTask: (data) => {
    const newTask: Task = {
      ...data,
      id: `t${Date.now()}`,
      status: 'pending',
      createdAt: new Date(),
    };
    set(state => ({
      tasks: [newTask, ...state.tasks],
    }));
  },
  
  getStats: () => {
    const { tasks } = get();
    return {
      total: tasks.length,
      pending: tasks.filter(t => t.status === 'pending' || t.status === 'assigned').length,
      inProgress: tasks.filter(t => t.status === 'in_progress').length,
      completed: tasks.filter(t => t.status === 'completed').length,
    };
  },
}));
