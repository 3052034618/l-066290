import React, { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { formatCurrency } from '@/utils/format';

export interface ChartSeries {
  key: string;
  name: string;
  color: string;
}

interface MultiLineChartProps {
  data: Array<{ date: string; [key: string]: number | string }>;
  series: ChartSeries[];
  height?: number;
  yAxisFormatter?: 'currency' | 'number';
}

const palette = ['#1677FF', '#00B42A', '#FF7D00', '#F53F3F', '#722ED1', '#14C9C9', '#86909C', '#FFC53D'];

const MultiLineChart: React.FC<MultiLineChartProps> = ({
  data,
  series,
  height = 320,
  yAxisFormatter = 'currency',
}) => {
  const mergedData = useMemo(() => {
    if (data.length === 0) return [];
    return data;
  }, [data]);

  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={mergedData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
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
            tickFormatter={(value) => yAxisFormatter === 'currency' ? `¥${value}` : `${value}`}
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
            formatter={(value: number, name: string) => [
              yAxisFormatter === 'currency' ? formatCurrency(value) : `${value}单`,
              name,
            ]}
          />
          <Legend
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ paddingTop: '16px', fontSize: '12px' }}
          />
          {series.map((s, idx) => (
            <Line
              key={s.key}
              type="monotone"
              dataKey={s.key}
              name={s.name}
              stroke={s.color || palette[idx % palette.length]}
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 5, stroke: 'white', strokeWidth: 2 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default MultiLineChart;
