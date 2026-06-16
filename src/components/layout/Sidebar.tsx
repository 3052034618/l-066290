import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  MapPin, 
  Package, 
  Route, 
  AlertTriangle, 
  BarChart3,
  Box
} from 'lucide-react';

const menuItems = [
  { path: '/', label: '货柜地图', icon: MapPin, end: true },
  { path: '/products', label: '商品监控', icon: Package },
  { path: '/replenishment', label: '补货路线', icon: Route },
  { path: '/exceptions', label: '异常处理', icon: AlertTriangle },
  { path: '/analytics', label: '经营分析', icon: BarChart3 },
];

const Sidebar: React.FC = () => {
  return (
    <aside className="w-60 bg-white border-r border-neutral-100 h-screen flex flex-col fixed left-0 top-0">
      <div className="h-16 flex items-center gap-3 px-6 border-b border-neutral-100">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-lg shadow-primary-500/20">
          <Box size={20} className="text-white" />
        </div>
        <div>
          <h1 className="text-base font-bold text-neutral-800 leading-tight">智慧零售</h1>
          <p className="text-xs text-neutral-400">运营管理平台</p>
        </div>
      </div>
      
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        <p className="px-4 py-2 text-xs font-semibold text-neutral-400 uppercase tracking-wider">
          运营管理
        </p>
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.end}
            className={({ isActive }) =>
              isActive ? 'sidebar-link-active' : 'sidebar-link'
            }
          >
            <item.icon size={20} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
      
      <div className="p-4 border-t border-neutral-100">
        <div className="bg-gradient-to-br from-primary-50 to-primary-100/50 rounded-xl p-4">
          <p className="text-sm font-semibold text-primary-700 mb-1">运营提示</p>
          <p className="text-xs text-primary-600 mb-3">今日有 3 个紧急任务待处理</p>
          <button className="w-full text-xs font-medium text-primary-600 bg-white rounded-lg py-2 hover:bg-primary-50 transition-colors">
            查看详情
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
