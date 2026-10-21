import React from 'react';

export const StatCard = ({ title, value, icon: Icon, color = 'indigo', subtitle }) => {
  const colorMap = {
    indigo: 'bg-indigo-50/80 text-indigo-600 border-indigo-200/60 ring-1 ring-indigo-500/10',
    blue: 'bg-sky-50/80 text-sky-600 border-sky-200/60 ring-1 ring-sky-500/10',
    amber: 'bg-amber-50/80 text-amber-600 border-amber-200/60 ring-1 ring-amber-500/10',
    emerald: 'bg-emerald-50/80 text-emerald-600 border-emerald-200/60 ring-1 ring-emerald-500/10',
    purple: 'bg-purple-50/80 text-purple-600 border-purple-200/60 ring-1 ring-purple-500/10',
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-card transition-all duration-200 hover:shadow-md hover:border-slate-300/80 group">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">{title}</p>
          <p className="text-3xl font-extrabold text-slate-900 mt-1.5 tracking-tight group-hover:text-indigo-600 transition-colors">
            {value}
          </p>
          {subtitle && <p className="text-[11px] text-slate-400 mt-1">{subtitle}</p>}
        </div>
        {Icon && (
          <div className={`p-3 rounded-2xl border transition-transform duration-200 group-hover:scale-105 ${colorMap[color] || colorMap.indigo}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
    </div>
  );
};
