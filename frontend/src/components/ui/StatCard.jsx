import React, { useState, useEffect, useRef } from 'react';
import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const AnimatedNumber = ({ value }) => {
  const target = typeof value === 'number' ? value : parseInt(value, 10) || 0;
  const [displayValue, setDisplayValue] = useState(0);
  const prevValueRef = useRef(0);
  const isFirstRender = useRef(true);

  useEffect(() => {
    let prefersReducedMotion = false;
    try {
      prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    } catch {
      prefersReducedMotion = false;
    }

    if (prefersReducedMotion) {
      setDisplayValue(target);
      prevValueRef.current = target;
      return;
    }

    const start = isFirstRender.current ? 0 : prevValueRef.current;
    isFirstRender.current = false;
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
      bg: 'bg-gradient-to-br from-[#F7F3FF] via-[#F0EBFF] to-[#FAF8FF]',
      border: 'border-[#E3D9FF]',
      hoverBorder: 'hover:border-[#6257D9]/50',
      badge: 'bg-[#EAE2FF] text-[#6257D9] border border-[#DDD0FE]',
      dot: 'bg-[#6257D9]',
      glow: 'from-[#6257D9]/15 via-[#818CF8]/8 to-transparent',
      accentLine: 'from-transparent via-[#6257D9]/60 to-transparent',
      shadow: 'shadow-[0_4px_20px_-4px_rgba(98,87,217,0.08)] hover:shadow-[0_12px_28px_-6px_rgba(98,87,217,0.15)]',
      hoverValue: 'group-hover:text-[#6257D9]',
    },
    lavender: {
      bg: 'bg-gradient-to-br from-[#F7F3FF] via-[#F0EBFF] to-[#FAF8FF]',
      border: 'border-[#E3D9FF]',
      hoverBorder: 'hover:border-[#6257D9]/50',
      badge: 'bg-[#EAE2FF] text-[#6257D9] border border-[#DDD0FE]',
      dot: 'bg-[#6257D9]',
      glow: 'from-[#6257D9]/15 via-[#818CF8]/8 to-transparent',
      accentLine: 'from-transparent via-[#6257D9]/60 to-transparent',
      shadow: 'shadow-[0_4px_20px_-4px_rgba(98,87,217,0.08)] hover:shadow-[0_12px_28px_-6px_rgba(98,87,217,0.15)]',
      hoverValue: 'group-hover:text-[#6257D9]',
    },
    amber: {
      bg: 'bg-gradient-to-br from-[#FFF9F5] via-[#FDF3EA] to-[#FAF5FF]',
      border: 'border-[#FDE2D0]',
      hoverBorder: 'hover:border-[#EA580C]/50',
      badge: 'bg-[#FFE8D6] text-[#EA580C] border border-[#FED7AA]',
      dot: 'bg-[#EA580C]',
      glow: 'from-[#FB923C]/18 via-[#FBBF24]/8 to-transparent',
      accentLine: 'from-transparent via-[#EA580C]/60 to-transparent',
      shadow: 'shadow-[0_4px_20px_-4px_rgba(234,88,12,0.07)] hover:shadow-[0_12px_28px_-6px_rgba(234,88,12,0.14)]',
      hoverValue: 'group-hover:text-[#EA580C]',
    },
    blue: {
      bg: 'bg-gradient-to-br from-[#F0F6FF] via-[#EEF4FF] to-[#F7F3FF]',
      border: 'border-[#D6E4FF]',
      hoverBorder: 'hover:border-[#3B82F6]/50',
      badge: 'bg-[#DFEDFE] text-[#0284C7] border border-[#BAE6FD]',
      dot: 'bg-[#0284C7]',
      glow: 'from-[#3B82F6]/18 via-[#60A5FA]/8 to-transparent',
      accentLine: 'from-transparent via-[#3B82F6]/60 to-transparent',
      shadow: 'shadow-[0_4px_20px_-4px_rgba(59,130,246,0.08)] hover:shadow-[0_12px_28px_-6px_rgba(59,130,246,0.15)]',
      hoverValue: 'group-hover:text-[#0284C7]',
    },
    sky: {
      bg: 'bg-gradient-to-br from-[#F0F6FF] via-[#EEF4FF] to-[#F7F3FF]',
      border: 'border-[#D6E4FF]',
      hoverBorder: 'hover:border-[#3B82F6]/50',
      badge: 'bg-[#DFEDFE] text-[#0284C7] border border-[#BAE6FD]',
      dot: 'bg-[#0284C7]',
      glow: 'from-[#3B82F6]/18 via-[#60A5FA]/8 to-transparent',
      accentLine: 'from-transparent via-[#3B82F6]/60 to-transparent',
      shadow: 'shadow-[0_4px_20px_-4px_rgba(59,130,246,0.08)] hover:shadow-[0_12px_28px_-6px_rgba(59,130,246,0.15)]',
      hoverValue: 'group-hover:text-[#0284C7]',
    },
    green: {
      bg: 'bg-gradient-to-br from-[#F2FBF6] via-[#EBF9F0] to-[#F5F2FE]',
      border: 'border-[#CFEEDC]',
      hoverBorder: 'hover:border-[#16A34A]/50',
      badge: 'bg-[#D6F7E2] text-[#16A34A] border border-[#BBF7D0]',
      dot: 'bg-[#16A34A]',
      glow: 'from-[#10B981]/18 via-[#34D399]/8 to-transparent',
      accentLine: 'from-transparent via-[#16A34A]/60 to-transparent',
      shadow: 'shadow-[0_4px_20px_-4px_rgba(22,163,74,0.07)] hover:shadow-[0_12px_28px_-6px_rgba(22,163,74,0.14)]',
      hoverValue: 'group-hover:text-[#16A34A]',
    },
    emerald: {
      bg: 'bg-gradient-to-br from-[#F2FBF6] via-[#EBF9F0] to-[#F5F2FE]',
      border: 'border-[#CFEEDC]',
      hoverBorder: 'hover:border-[#16A34A]/50',
      badge: 'bg-[#D6F7E2] text-[#16A34A] border border-[#BBF7D0]',
      dot: 'bg-[#16A34A]',
      glow: 'from-[#10B981]/18 via-[#34D399]/8 to-transparent',
      accentLine: 'from-transparent via-[#16A34A]/60 to-transparent',
      shadow: 'shadow-[0_4px_20px_-4px_rgba(22,163,74,0.07)] hover:shadow-[0_12px_28px_-6px_rgba(22,163,74,0.14)]',
      hoverValue: 'group-hover:text-[#16A34A]',
    },
    brand: {
      bg: 'bg-gradient-to-br from-[#F5F2FF] via-[#EDE8FF] to-[#F0F4FF]',
      border: 'border-[#DDD6FE]',
      hoverBorder: 'hover:border-[#6257D9]/50',
      badge: 'bg-[#E4DBFE] text-[#6257D9] border border-[#DDD6FE]',
      dot: 'bg-[#6257D9]',
      glow: 'from-[#6257D9]/18 via-[#818CF8]/10 to-transparent',
      accentLine: 'from-transparent via-[#6257D9]/60 to-transparent',
      shadow: 'shadow-[0_4px_20px_-4px_rgba(98,87,217,0.08)] hover:shadow-[0_12px_28px_-6px_rgba(98,87,217,0.15)]',
      hoverValue: 'group-hover:text-[#6257D9]',
    },
    indigo: {
      bg: 'bg-gradient-to-br from-[#F5F2FF] via-[#EDE8FF] to-[#F0F4FF]',
      border: 'border-[#DDD6FE]',
      hoverBorder: 'hover:border-[#6257D9]/50',
      badge: 'bg-[#E4DBFE] text-[#6257D9] border border-[#DDD6FE]',
      dot: 'bg-[#6257D9]',
      glow: 'from-[#6257D9]/18 via-[#818CF8]/10 to-transparent',
      accentLine: 'from-transparent via-[#6257D9]/60 to-transparent',
      shadow: 'shadow-[0_4px_20px_-4px_rgba(98,87,217,0.08)] hover:shadow-[0_12px_28px_-6px_rgba(98,87,217,0.15)]',
      hoverValue: 'group-hover:text-[#6257D9]',
    },
  };

  const theme = themeMap[color] || themeMap.purple;
  const isClickable = Boolean(to || onClick);

  const CardContent = (
    <div
      className={`group relative overflow-hidden ${theme.bg} ${theme.border} ${theme.hoverBorder} ${theme.shadow} border rounded-2xl p-5 hover:-translate-y-[3px] transition-all duration-200 flex flex-col justify-between h-full select-none ${
        isClickable ? 'cursor-pointer' : ''
      } ${className}`}
    >
      {/* Top accent line highlight on hover */}
      <div
        className={`absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r ${theme.accentLine} opacity-50 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none`}
      />

      {/* Light sweep across card on hover */}
      <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out bg-gradient-to-r from-transparent via-white/35 to-transparent pointer-events-none" />

      {/* Ambient subtle color wash in top-right */}
      <div
        className={`absolute -top-10 -right-10 w-28 h-28 rounded-full bg-gradient-to-br ${theme.glow} blur-xl pointer-events-none group-hover:scale-125 transition-transform duration-500`}
      />

      {/* Subtle geometric wireframe watermark in bottom-right */}
      <svg
        className="absolute -bottom-5 -right-5 w-24 h-24 text-slate-900 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity duration-300 pointer-events-none"
        viewBox="0 0 100 100"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
      >
        <circle cx="50" cy="50" r="42" strokeDasharray="3 3" />
        <circle cx="50" cy="50" r="26" />
        <rect x="25" y="25" width="50" height="50" rx="8" transform="rotate(45 50 50)" />
      </svg>

      {/* Top Row: Title on Left, Icon Badge on Right */}
      <div className="flex items-center justify-between relative z-10">
        <span className="text-xs font-semibold text-[#4A4568] tracking-wide">
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
        <div
          className={`text-3xl sm:text-4xl font-extrabold text-[#272443] tracking-tight font-geist leading-none ${theme.hoverValue} transition-colors duration-200`}
        >
          {loading ? (
            <div className="h-8 w-16 rounded-md animate-shimmer-lavender my-1" />
          ) : (
            <AnimatedNumber value={value} />
          )}
        </div>
        {subtitle && (
          <div className="flex items-center gap-1.5 mt-2.5">
            <span className={`w-1.5 h-1.5 rounded-full ${theme.dot} shrink-0`} />
            <p className="text-xs text-[#5E597B] font-normal">
              {subtitle}
            </p>
          </div>
        )}
      </div>

      {isClickable && (
        <div className="absolute bottom-4 right-4 relative z-10">
          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#6257D9] group-hover:translate-x-0.5 transition-all duration-200 shrink-0" />
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