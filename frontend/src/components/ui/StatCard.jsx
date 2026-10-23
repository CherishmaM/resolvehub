import React from 'react';
import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const StatCard = ({
  title,
  value,
  icon: Icon,
  color = 'purple',
  subtitle,
  loading = false,
  to,
  onClick,
  className = '',
}) => {
  const themeMap = {
    purple: {
      badge: 'bg-[#ede9fe] text-[#6257D9]',
      dot: 'bg-[#6257D9]',
      glow: 'from-[#6257D9]/15 to-transparent',
    },
    indigo: {
      badge: 'bg-[#ede9fe] text-[#6257D9]',
      dot: 'bg-[#6257D9]',
      glow: 'from-[#6257D9]/15 to-transparent',
    },
    brand: {
      badge: 'bg-[#ede9fe] text-[#6257D9]',
      dot: 'bg-[#6257D9]',
      glow: 'from-[#6257D9]/15 to-transparent',
    },
    amber: {
      badge: 'bg-[#ffedd5] text-[#ea580c]',
      dot: 'bg-[#ea580c]',
      glow: 'from-[#ea580c]/15 to-transparent',
    },
    blue: {
      badge: 'bg-[#e0f2fe] text-[#0284c7]',
      dot: 'bg-[#0284c7]',
      glow: 'from-[#0284c7]/15 to-transparent',
    },
    sky: {
      badge: 'bg-[#e0f2fe] text-[#0284c7]',
      dot: 'bg-[#0284c7]',
      glow: 'from-[#0284c7]/15 to-transparent',
    },
    emerald: {
      badge: 'bg-[#dcfce7] text-[#16a34a]',
      dot: 'bg-[#16a34a]',
      glow: 'from-[#16a34a]/15 to-transparent',
    },
    green: {
      badge: 'bg-[#dcfce7] text-[#16a34a]',
      dot: 'bg-[#16a34a]',
      glow: 'from-[#16a34a]/15 to-transparent',
    },
  };

  const theme = themeMap[color] || themeMap.purple;
  const isClickable = Boolean(to || onClick);

  const CardContent = (
    <div
      className={`relative overflow-hidden bg-white rounded-2xl border border-slate-100/90 p-5 shadow-2xs hover:-translate-y-0.5 hover:shadow-subtle transition-all duration-200 flex flex-col justify-between h-full ${
        isClickable
          ? 'hover:border-slate-300/80 cursor-pointer group'
          : 'select-none'
      } ${className}`}
    >
      {/* Ambient subtle color wash in top-right */}
      <div
        className={`absolute -top-6 -right-6 w-24 h-24 rounded-full bg-gradient-to-br ${theme.glow} blur-xl pointer-events-none`}
      />

      {/* Top Row: Title on Left, Icon Badge on Right */}
      <div className="flex items-center justify-between relative z-10">
        <span className="text-xs font-semibold text-slate-600 tracking-wide">
          {title}
        </span>
        {Icon && (
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-2xs ${theme.badge}`}
          >
            <Icon className="w-4 h-4 stroke-[2]" />
          </div>
        )}
      </div>

      {/* Bottom: Big Bold Metric + Subtitle with status dot */}
      <div className="mt-4 relative z-10">
        <div className="text-3xl sm:text-4xl font-extrabold text-[#20212B] tracking-tight font-geist leading-none">
          {loading ? '…' : value}
        </div>
        {subtitle && (
          <div className="flex items-center gap-1.5 mt-2.5">
            <span className={`w-1.5 h-1.5 rounded-full ${theme.dot} shrink-0`} />
            <p className="text-xs text-slate-500 font-normal">
              {subtitle}
            </p>
          </div>
        )}
      </div>

      {isClickable && (
        <div className="absolute bottom-4 right-4">
          <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-600 transition-colors shrink-0" />
        </div>
      )}
    </div>
  );

  if (to) {
    return <Link to={to} className="block h-full">{CardContent}</Link>;
  }

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className="w-full h-full text-left">
        {CardContent}
      </button>
    );
  }

  return CardContent;
};
