import React from 'react';
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

export const BarChart = ({
  data = [],
  xKey = 'name',
  series = [], // array of { key, name, color }
  stacked = false,
  height = 300,
}) => {
  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer>
        <RechartsBarChart
          data={data}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#5E4B43" opacity={0.4} />
          <XAxis
            dataKey={xKey}
            stroke="#8B7B6F"
            fontSize={11}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="#8B7B6F"
            fontSize={11}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#3D2B26',
              borderColor: '#5E4B43',
              borderRadius: '8px',
              color: '#E8E3DD',
            }}
            itemStyle={{ color: '#E8E3DD' }}
          />
          {series.length > 1 && (
            <Legend
              verticalAlign="top"
              height={36}
              iconType="circle"
              wrapperStyle={{ fontSize: '12px', color: '#E8E3DD' }}
            />
          )}
          {series.map((s, idx) => (
            <Bar
              key={idx}
              dataKey={s.key}
              name={s.name || s.key}
              fill={s.color}
              stackId={stacked ? 'stack' : undefined}
              radius={stacked ? [0, 0, 0, 0] : [4, 4, 0, 0]}
            />
          ))}
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default BarChart;
