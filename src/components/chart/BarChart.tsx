import React from 'react';
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { formatCurrency } from '@/utils/format';

interface DataPoint {
  name: string;
  [key: string]: string | number;
}

interface BarChartProps {
  data: DataPoint[];
  height?: number;
  dataKeys: { key: string; name: string; color: string }[];
  onBarClick?: (data: DataPoint) => void;
}

const BarChartComponent: React.FC<BarChartProps> = ({
  data,
  height = 300,
  dataKeys,
  onBarClick,
}) => {
  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsBarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E6EB" vertical={false} />
          <XAxis
            dataKey="name"
            tick={{ fill: '#86909C', fontSize: 12 }}
            tickLine={false}
            axisLine={{ stroke: '#E5E6EB' }}
            interval={0}
          />
          <YAxis
            tick={{ fill: '#86909C', fontSize: 12 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `¥${value}`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'white',
              border: 'none',
              borderRadius: '12px',
              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1), 0 4px 10px rgba(0, 0, 0, 0.04)',
              padding: '12px 16px',
            }}
            labelStyle={{ color: '#4E5969', fontWeight: 500, marginBottom: '8px' }}
            itemStyle={{ color: '#1D2129', fontWeight: 500 }}
            formatter={(value: number) => formatCurrency(value)}
          />
          <Legend
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ paddingTop: '16px', fontSize: '12px' }}
          />
          {dataKeys.map((dk) => (
            <Bar
              key={dk.key}
              dataKey={dk.key}
              name={dk.name}
              fill={dk.color}
              radius={[6, 6, 0, 0]}
              barSize={28}
              onClick={onBarClick ? (_data, index) => onBarClick(data[index]) : undefined}
              cursor={onBarClick ? 'pointer' : 'default'}
            />
          ))}
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default BarChartComponent;
