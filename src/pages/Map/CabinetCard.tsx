import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ExternalLink, Thermometer, Wifi, Clock, TrendingUp } from 'lucide-react';
import StatusBadge from '@/components/ui/StatusBadge';
import ProgressBar from '@/components/ui/ProgressBar';
import { Cabinet } from '@/types';
import { formatCurrency, formatMinutes } from '@/utils/format';

interface CabinetCardProps {
  cabinet: Cabinet;
  inventoryRate: number;
  onClose: () => void;
}

const CabinetCard: React.FC<CabinetCardProps> = ({ cabinet, inventoryRate, onClose }) => {
  const navigate = useNavigate();

  const handleViewDetail = () => {
    navigate(`/map/cabinet/${cabinet.id}`);
    onClose();
  };

  return (
    <div className="w-72 bg-white rounded-2xl shadow-dropdown border border-neutral-100 overflow-hidden animate-slide-up">
      <div className="p-4 bg-gradient-to-r from-primary-50 to-primary-100/30">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h3 className="text-base font-semibold text-neutral-800">{cabinet.name}</h3>
            <p className="text-xs text-neutral-500 mt-0.5">{cabinet.address}</p>
          </div>
          <StatusBadge status={cabinet.status} />
        </div>
      </div>
      
      <div className="p-4 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2">
            <Thermometer size={16} className="text-primary-500" />
            <span className="text-sm text-neutral-600">
              {cabinet.status === 'offline' || cabinet.status === 'maintenance' ? '--' : `${cabinet.temperature}°C`}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Wifi size={16} className={cabinet.networkStatus === 'good' ? 'text-success-500' : cabinet.networkStatus === 'normal' ? 'text-warning-500' : 'text-danger-500'} />
            <span className="text-sm text-neutral-600">
              {cabinet.networkStatus === 'good' ? '信号良好' : cabinet.networkStatus === 'normal' ? '信号一般' : '信号较弱'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Clock size={16} className="text-neutral-400" />
            <span className="text-sm text-neutral-600">
              {cabinet.onlineMinutes > 0 ? `在线${formatMinutes(cabinet.onlineMinutes)}` : '离线'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <TrendingUp size={16} className="text-success-500" />
            <span className="text-sm text-neutral-600">{formatCurrency(cabinet.todaySales)}</span>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-medium text-neutral-500">库存状态</span>
            <span className={`text-xs font-medium ${inventoryRate < 30 ? 'text-danger-600' : inventoryRate < 60 ? 'text-warning-600' : 'text-success-600'}`}>
              {inventoryRate}%
            </span>
          </div>
          <ProgressBar value={inventoryRate} />
        </div>

        <div className="flex gap-2">
          <button 
            onClick={handleViewDetail}
            className="flex-1 btn-primary text-sm flex items-center justify-center gap-1.5"
          >
            <ExternalLink size={16} />
            查看详情
          </button>
        </div>
      </div>
    </div>
  );
};

export default CabinetCard;
