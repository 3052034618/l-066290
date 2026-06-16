import React from 'react';
import { Bell, Search, User, ChevronDown } from 'lucide-react';
import { useExceptionStore } from '@/store/exceptionStore';

const Header: React.FC = () => {
  const { getStats } = useExceptionStore();
  const stats = getStats();

  return (
    <header className="h-16 bg-white border-b border-neutral-100 flex items-center justify-between px-6 fixed top-0 left-60 right-0 z-40">
      <div className="flex items-center gap-4">
        <div className="relative w-80">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            placeholder="搜索货柜、商品、订单..."
            className="w-full pl-10 pr-4 py-2 bg-neutral-50 rounded-lg text-sm text-neutral-700 placeholder-neutral-400 border border-transparent focus:bg-white focus:border-primary-200 focus:outline-none transition-all"
          />
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <button className="relative p-2 rounded-lg hover:bg-neutral-50 text-neutral-600 transition-colors">
          <Bell size={20} />
          {stats.pending > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-danger-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
              {stats.pending}
            </span>
          )}
        </button>
        
        <div className="h-8 w-px bg-neutral-200" />
        
        <div className="flex items-center gap-3 cursor-pointer hover:bg-neutral-50 px-2 py-1.5 rounded-lg transition-colors">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
            <User size={16} className="text-white" />
          </div>
          <div className="text-left">
            <p className="text-sm font-medium text-neutral-700">运营管理员</p>
            <p className="text-xs text-neutral-400">admin@smartretail.com</p>
          </div>
          <ChevronDown size={16} className="text-neutral-400" />
        </div>
      </div>
    </header>
  );
};

export default Header;
