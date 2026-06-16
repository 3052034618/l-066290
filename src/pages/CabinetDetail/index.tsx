import React from 'react';
import { useParams } from 'react-router-dom';
import { useCabinetStore } from '@/store/cabinetStore';
import { useExceptionStore } from '@/store/exceptionStore';
import CabinetInfo from './CabinetInfo';
import QuickActions from './QuickActions';
import SalesChart from './SalesChart';
import InventoryPanel from './InventoryPanel';
import ExceptionHistory from './ExceptionHistory';
import EmptyState from '@/components/ui/EmptyState';

const CabinetDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { getCabinetById, getCabinetInventory } = useCabinetStore();
  const { exceptions } = useExceptionStore();

  const cabinet = getCabinetById(id || '');
  const inventories = cabinet ? getCabinetInventory(cabinet.id) : [];
  const cabinetExceptions = exceptions.filter(e => e.cabinetId === id);

  if (!cabinet) {
    return (
      <div className="max-w-xl mx-auto mt-20">
        <EmptyState
          title="货柜不存在"
          description="未找到对应的货柜信息，请返回地图重新选择"
        />
      </div>
    );
  }

  return (
    <div>
      <CabinetInfo cabinet={cabinet} />
      <QuickActions cabinet={cabinet} />
      <SalesChart cabinetId={cabinet.id} />
      <div className="grid grid-cols-2 gap-6 mt-6">
        <InventoryPanel inventories={inventories} />
        <ExceptionHistory exceptions={cabinetExceptions} />
      </div>
    </div>
  );
};

export default CabinetDetailPage;
