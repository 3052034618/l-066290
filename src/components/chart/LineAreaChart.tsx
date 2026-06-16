import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { formatCurrency } from '@/utils/format';

interface DataPoint {
  date: string;
  sales: number;
  orders?: number;
}

interface LineAreaChartProps {
  data: DataPoint[];
  height?: number;
  dataKey?: string;
  color?: string;
  showOrders?: boolean;
}

const LineAreaChart: React.FC<LineAreaChartProps> = ({
  data,
  height = 280,
  dataKey = 'sales',
  color = '#1677FF',
  showOrders = false,
}) => {
  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id={`gradient-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.3} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E6EB" vertical={false} />
          <XAxis
            dataKey="date"
            tick={{ fill: '#86909C', fontSize: 12 }}
            tickLine={false}
            axisLine={{ stroke: '#E5E6EB' }}
          />
          <YAxis
            tick={{ fill: '#86909C', fontSize: 12 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => showOrders ? `${value}` : `¥${value}`}
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
            formatter={(value: number) => [dataKey === 'sales' ? formatCurrency(value) : `${value}单`, dataKey === 'sales' ? '销售额' : '订单数']}
          />
          <Area
            type="monotone"
            dataKey={dataKey}
            stroke={color}
            strokeWidth={2.5}
            fill={`url(#gradient-${dataKey})`}
            dot={false}
            activeDot={{ r: 6, fill: color, stroke: 'white', strokeWidth: 2 }}
          />
          {showOrders && (
            <Area
              type="monotone"
              dataKey="orders"
              stroke="#00B42A"
              strokeWidth={2}
              fill="transparent"
              dot={false}
            />
          )}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default LineAreaChart;
