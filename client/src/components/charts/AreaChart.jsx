import React from 'react';
import {
  AreaChart as RechartsAreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

export const AreaChart = ({
  data = [],
  xKey = 'name',
  series = [], // array of { key, name, color }
  height = 300,
}) => {
  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer>
        <RechartsAreaChart
          data={data}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
          <defs>
            {series.map((s, idx) => (
              <linearGradient key={idx} id={`color-${s.key}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={s.color} stopOpacity={0.4} />
                <stop offset="95%" stopColor={s.color} stopOpacity={0} />
              </linearGradient>
            ))}
          </defs>
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
            <Area
              key={idx}
              type="monotone"
              dataKey={s.key}
              name={s.name || s.key}
              stroke={s.color}
              strokeWidth={2}
              fillOpacity={1}
              fill={`url(#color-${s.key})`}
            />
          ))}
        </RechartsAreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default AreaChart;
