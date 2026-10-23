import React, { useState, useEffect, useRef } from 'react';
import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const AnimatedNumber = ({ value }) => {
  const target = typeof value === 'number' ? value : parseInt(value, 10) || 0;
  const [displayValue, setDisplayValue] = useState(0);
  const prevValueRef = useRef(0);

  useEffect(() => {
    let prefersReducedMotion = false;
    try {
      prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    } catch {
      prefersReducedMotion = false;
    }

    if (prefersReducedMotion) {
      setDisplayValue(target);
      return;
    }

    const start = prevValueRef.current;
    const diff = target - start;
    if (diff === 0) {
      setDisplayValue(target);
      return;
    }

    let startTime = null;
    let animId = null;
    const duration = 750;

    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      // easeOutCubic curve
      const ease = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(Math.round(start + diff * ease));

      if (progress < 1) {
        animId = requestAnimationFrame(step);
      } else {
        prevValueRef.current = target;
      }
    };

    animId = requestAnimationFrame(step);

    return () => {
      if (animId) cancelAnimationFrame(animId);
    };
  }, [target]);

  return <>{displayValue}</>;
};

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
      className={`group relative overflow-hidden bg-white rounded-2xl border border-slate-100/90 p-5 shadow-2xs hover:-translate-y-1 hover:shadow-subtle hover:border-slate-200 transition-all duration-300 flex flex-col justify-between h-full select-none ${
        isClickable ? 'cursor-pointer' : ''
      } ${className}`}
    >
      {/* Top accent line highlight on hover */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#6257D9]/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

      {/* Ambient subtle color wash in top-right */}
      <div
        className={`absolute -top-6 -right-6 w-24 h-24 rounded-full bg-gradient-to-br ${theme.glow} blur-xl pointer-events-none group-hover:scale-125 transition-transform duration-500`}
      />

      {/* Top Row: Title on Left, Icon Badge on Right */}
      <div className="flex items-center justify-between relative z-10">
        <span className="text-xs font-semibold text-slate-600 tracking-wide">
          {title}
        </span>
        {Icon && (
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-2xs ${theme.badge} group-hover:scale-105 transition-transform duration-200`}
          >
            <Icon className="w-4 h-4 stroke-[2]" />
          </div>
        )}
      </div>

      {/* Bottom: Big Bold Metric + Subtitle with status dot */}
      <div className="mt-4 relative z-10">
        <div className="text-3xl sm:text-4xl font-extrabold text-[#20212B] tracking-tight font-geist leading-none group-hover:text-[#6257D9] transition-colors duration-200">
          {loading ? '…' : <AnimatedNumber value={value} />}
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
          <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-[#6257D9] group-hover:translate-x-0.5 transition-all duration-200 shrink-0" />
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
