import React from 'react';
import StatsOverview from './StatsOverview';
import CabinetMap from './CabinetMap';

const MapPage: React.FC = () => {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-neutral-800 mb-1">货柜地图</h1>
        <p className="text-sm text-neutral-500">实时监控所有货柜的运营状态和地理分布</p>
      </div>
      <StatsOverview />
      <CabinetMap />
    </div>
  );
};

export default MapPage;
