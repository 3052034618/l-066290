import React from 'react';
import { ArrowLeft, MapPin, Thermometer, Wifi, Clock, CircleDot } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import StatusBadge from '@/components/ui/StatusBadge';
import { Cabinet } from '@/types';
import { formatCurrency, formatMinutes } from '@/utils/format';

interface CabinetInfoProps {
  cabinet: Cabinet;
}

const CabinetInfo: React.FC<CabinetInfoProps> = ({ cabinet }) => {
  const navigate = useNavigate();

  return (
    <div className="card p-6 mb-6">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <button
            onClick={() => navigate('/')}
            className="p-2 rounded-lg hover:bg-neutral-100 text-neutral-500 hover:text-neutral-700 transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-neutral-800">{cabinet.name}</h1>
              <StatusBadge status={cabinet.status} />
            </div>
            <div className="flex items-center gap-1 text-sm text-neutral-500">
              <MapPin size={14} />
              <span>{cabinet.address}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 text-right">
          <div>
            <p className="text-xs text-neutral-500">今日营收</p>
            <p className="text-xl font-bold text-primary-600">{formatCurrency(cabinet.todaySales)}</p>
          </div>
          <div className="w-px h-10 bg-neutral-200" />
          <div>
            <p className="text-xs text-neutral-500">今日订单</p>
            <p className="text-xl font-bold text-neutral-800">{cabinet.todayOrders}<span className="text-sm font-normal text-neutral-500 ml-1">单</span></p>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-4 gap-4 mt-6 pt-6 border-t border-neutral-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center">
            <Thermometer size={20} className="text-primary-600" />
          </div>
          <div>
            <p className="text-xs text-neutral-500">柜内温度</p>
            <p className="text-base font-semibold text-neutral-800">
              {cabinet.status === 'offline' || cabinet.status === 'maintenance' ? '--' : `${cabinet.temperature}°C`}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
            cabinet.networkStatus === 'good' ? 'bg-success-50' : cabinet.networkStatus === 'normal' ? 'bg-warning-50' : 'bg-danger-50'
          }`}>
            <Wifi size={20} className={
              cabinet.networkStatus === 'good' ? 'text-success-600' : cabinet.networkStatus === 'normal' ? 'text-warning-600' : 'text-danger-600'
            } />
          </div>
          <div>
            <p className="text-xs text-neutral-500">网络状态</p>
            <p className="text-base font-semibold text-neutral-800">
              {cabinet.networkStatus === 'good' ? '信号良好' : cabinet.networkStatus === 'normal' ? '信号一般' : '信号较弱'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-neutral-100 flex items-center justify-center">
            <Clock size={20} className="text-neutral-600" />
          </div>
          <div>
            <p className="text-xs text-neutral-500">今日在线</p>
            <p className="text-base font-semibold text-neutral-800">
              {cabinet.onlineMinutes > 0 ? formatMinutes(cabinet.onlineMinutes) : '离线'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-success-50 flex items-center justify-center">
            <CircleDot size={20} className="text-success-600" />
          </div>
          <div>
            <p className="text-xs text-neutral-500">所在区域</p>
            <p className="text-base font-semibold text-neutral-800">{cabinet.location}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CabinetInfo;
