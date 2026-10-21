import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

const PRIORITY_COLORS = {
  Low: '#94a3b8',
  Medium: '#38bdf8',
  High: '#fb923c',
  Critical: '#f43f5e',
};

export const PriorityBarChart = ({ data = [] }) => {
  const total = data.reduce((acc, curr) => acc + (curr.count || 0), 0);

  if (total === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-sm text-slate-400">
        No issues available to chart.
      </div>
    );
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 20, right: 20, left: -20, bottom: 5 }}
        >
          <XAxis
            dataKey="name"
            tick={{ fontSize: 12, fill: '#64748b' }}
            axisLine={{ stroke: '#cbd5e1' }}
            tickLine={false}
          />
          <YAxis
            allowDecimals={false}
            tick={{ fontSize: 12, fill: '#64748b' }}
            axisLine={{ stroke: '#cbd5e1' }}
            tickLine={false}
          />
          <Tooltip
            cursor={{ fill: 'rgba(241, 245, 249, 0.6)' }}
            formatter={(value) => [`${value} Issues`, 'Volume']}
            contentStyle={{
              backgroundColor: '#ffffff',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
            }}
          />
          <Bar dataKey="count" radius={[6, 6, 0, 0]}>
            {data.map((entry) => (
              <Cell
                key={`bar-${entry.name}`}
                fill={PRIORITY_COLORS[entry.name] || '#6366f1'}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
