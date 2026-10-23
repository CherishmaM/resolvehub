import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts';

const COLORS = {
  Open: '#5b42d6', // Signature Iris purple
  'In Progress': '#2d1b54', // Deep Plum violet
  Resolved: '#8c7cf0', // Periwinkle violet
  Closed: '#c4b5fd', // Soft lavender
};

export const StatusDonutChart = ({ data = [] }) => {
  const total = data.reduce((acc, curr) => acc + (curr.count || 0), 0);

  if (total === 0) {
    return (
      <div className="h-64 flex flex-col items-center justify-center text-xs text-slate-400">
        <p className="font-medium text-slate-500">No issues tracked yet</p>
        <p className="text-[11px] mt-0.5">Status metrics will populate once issues are reported.</p>
      </div>
    );
  }

  return (
    <div className="h-64 sm:h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="count"
            nameKey="name"
            cx="50%"
            cy="45%"
            innerRadius={55}
            outerRadius={85}
            paddingAngle={3}
            strokeWidth={2}
            stroke="#ffffff"
            isAnimationActive={true}
            animationDuration={900}
            animationEasing="ease-out"
          >
            {data.map((entry) => (
              <Cell
                key={`cell-${entry.name}`}
                fill={COLORS[entry.name] || '#94a3b8'}
                className="transition-all duration-200 hover:opacity-85 cursor-pointer"
              />
            ))}
          </Pie>
          <Tooltip
            formatter={(value, name) => {
              const pct = total > 0 ? Math.round((value / total) * 100) : 0;
              return [`${value} Issues (${pct}%)`, name];
            }}
            animationDuration={200}
            contentStyle={{
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.08), 0 4px 6px -4px rgb(0 0 0 / 0.04)',
              fontSize: '12px',
              padding: '8px 12px',
            }}
          />
          <Legend
            verticalAlign="bottom"
            height={40}
            iconType="circle"
            formatter={(value, entry) => {
              const item = data.find((d) => d.name === value);
              const count = item ? item.count : 0;
              return (
                <span className="text-xs font-medium text-slate-700 ml-1">
                  {value} <span className="text-slate-400 font-mono text-[11px]">({count})</span>
                </span>
              );
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};
