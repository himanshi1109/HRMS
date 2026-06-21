import React from 'react';
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

export const LineChart = ({
  data = [],
  xKey = 'name',
  series = [], // array of { key, name, color }
  height = 300,
}) => {
  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer>
        <RechartsLineChart
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
            <Line
              key={idx}
              type="monotone"
              dataKey={s.key}
              name={s.name || s.key}
              stroke={s.color}
              strokeWidth={2}
              dot={{ r: 3, fill: s.color }}
              activeDot={{ r: 5 }}
            />
          ))}
        </RechartsLineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default LineChart;
