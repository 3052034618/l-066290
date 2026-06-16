import React from 'react';
import { MonitorDot, Wifi, PackageX, AlertOctagon } from 'lucide-react';
import StatCard from '@/components/ui/StatCard';
import { useCabinetStore } from '@/store/cabinetStore';

const StatsOverview: React.FC = () => {
  const { getStats } = useCabinetStore();
  const stats = getStats();

  return (
    <div className="grid grid-cols-4 gap-4 mb-6">
      <StatCard
        title="货柜总数"
        value={stats.total}
        icon={MonitorDot}
        iconBg="bg-primary-50"
        iconColor="text-primary-600"
        trend={5.2}
      />
      <StatCard
        title="在线率"
        value={stats.onlineRate}
        format="percent"
        icon={Wifi}
        iconBg="bg-success-50"
        iconColor="text-success-600"
        trend={2.1}
      />
      <StatCard
        title="低库存点位"
        value={stats.lowStock}
        suffix="个"
        icon={PackageX}
        iconBg="bg-warning-50"
        iconColor="text-warning-600"
        trend={-12.5}
      />
      <StatCard
        title="故障货柜"
        value={stats.fault}
        suffix="个"
        icon={AlertOctagon}
        iconBg="bg-danger-50"
        iconColor="text-danger-600"
        trend={-25.0}
      />
    </div>
  );
};

export default StatsOverview;
