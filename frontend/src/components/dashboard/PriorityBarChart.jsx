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
  Low: '#a78bfa', // soft periwinkle violet
  Medium: '#5b42d6', // signature Iris purple
  High: '#f59e0b', // amber
  Critical: '#e11d48', // rose-red
};

export const PriorityBarChart = ({ data = [] }) => {
  const total = data.reduce((acc, curr) => acc + (curr.count || 0), 0);

  if (total === 0) {
    return (
      <div className="h-64 flex flex-col items-center justify-center text-xs text-slate-400">
        <p className="font-medium text-slate-500">No issues tracked yet</p>
        <p className="text-[11px] mt-0.5">Priority metrics will populate once issues are reported.</p>
      </div>
    );
  }

  return (
    <div className="h-64 sm:h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 20, right: 10, left: -20, bottom: 5 }}
        >
          <XAxis
            dataKey="name"
            tick={{ fontSize: 11, fill: '#64748b', fontWeight: 500 }}
            axisLine={{ stroke: '#e2e8f0' }}
            tickLine={false}
          />
          <YAxis
            allowDecimals={false}
            tick={{ fontSize: 11, fill: '#64748b' }}
            axisLine={{ stroke: '#e2e8f0' }}
            tickLine={false}
          />
          <Tooltip
            cursor={{ fill: 'rgba(241, 245, 249, 0.7)' }}
            formatter={(value) => [`${value} Issues`, 'Volume']}
            contentStyle={{
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.08), 0 4px 6px -4px rgb(0 0 0 / 0.04)',
              fontSize: '12px',
              padding: '8px 12px',
            }}
          />
          <Bar dataKey="count" radius={[6, 6, 0, 0]} maxBarSize={48}>
            {data.map((entry) => (
              <Cell
                key={`bar-${entry.name}`}
                fill={PRIORITY_COLORS[entry.name] || '#5b42d6'}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
