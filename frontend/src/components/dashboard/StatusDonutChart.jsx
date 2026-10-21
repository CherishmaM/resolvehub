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
  Open: '#3b82f6',
  'In Progress': '#f59e0b',
  Resolved: '#10b981',
};

export const StatusDonutChart = ({ data = [] }) => {
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
        <PieChart>
          <Pie
            data={data}
            dataKey="count"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={80}
            paddingAngle={4}
          >
            {data.map((entry) => (
              <Cell
                key={`cell-${entry.name}`}
                fill={COLORS[entry.name] || '#94a3b8'}
              />
            ))}
          </Pie>
          <Tooltip
            formatter={(value, name) => [`${value} Issues`, name]}
            contentStyle={{
              backgroundColor: '#ffffff',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
            }}
          />
          <Legend
            verticalAlign="bottom"
            height={36}
            iconType="circle"
            formatter={(value) => <span className="text-xs font-medium text-slate-700">{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};
