import React, { useRef } from 'react';
import {
  Globe,
  Box,
  BarChart3,
  FileText,
  Sparkles,
  ShieldCheck,
  Terminal,
  Database,
  ChevronLeft,
  ChevronRight,
  Layers,
} from 'lucide-react';

export const PILL_CATEGORIES = [
  {
    id: 'UI/UX',
    label: 'UI/UX Design',
    leftBg: 'bg-[#fef08a]',
    leftTextColor: 'text-slate-900',
    rightBg: 'bg-white',
    icon: (
      <span className="font-mono text-base font-black leading-none select-none">
        &#x2731;
      </span>
    ), // Asterisk matching Reference Image
  },
  {
    id: 'Frontend',
    label: 'Web Development',
    leftBg: 'bg-[#18181b]',
    leftTextColor: 'text-[#67e8f9]',
    rightBg: 'bg-[#cffafe]', // Pastel cyan pill body matching Reference Image
    icon: <Globe className="w-4 h-4 stroke-[2]" />,
  },
  {
    id: 'Backend',
    label: 'Backend API',
    leftBg: 'bg-[#fbcfe8]',
    leftTextColor: 'text-slate-900',
    rightBg: 'bg-white',
    icon: <BarChart3 className="w-4 h-4 stroke-[2]" />,
  },
  {
    id: 'Database',
    label: 'Database & Storage',
    leftBg: 'bg-[#99f6e4]',
    leftTextColor: 'text-slate-900',
    rightBg: 'bg-white',
    icon: <Database className="w-4 h-4 stroke-[2]" />,
  },
  {
    id: 'DevOps',
    label: 'DevOps & Cloud',
    leftBg: 'bg-[#e9d5ff]',
    leftTextColor: 'text-slate-900',
    rightBg: 'bg-white',
    icon: <Box className="w-4 h-4 stroke-[2]" />, // Wireframe box matching Theme Dev
  },
  {
    id: 'QA Testing',
    label: 'QA & Testing',
    leftBg: 'bg-[#fed7aa]',
    leftTextColor: 'text-slate-900',
    rightBg: 'bg-white',
    icon: <ShieldCheck className="w-4 h-4 stroke-[2]" />,
  },
  {
    id: 'Feature Request',
    label: 'Feature Planning',
    leftBg: 'bg-[#fef08a]',
    leftTextColor: 'text-slate-900',
    rightBg: 'bg-white',
    icon: <Sparkles className="w-4 h-4 stroke-[2]" />,
  },
  {
    id: 'Other',
    label: 'General & Docs',
    leftBg: 'bg-[#bae6fd]',
    leftTextColor: 'text-slate-900',
    rightBg: 'bg-white',
    icon: <FileText className="w-4 h-4 stroke-[2]" />,
  },
];

export const PillSlider = ({
  selectedCategory,
  onSelectCategory,
  variant = 'slider', // 'slider' | 'filter' | 'form'
  showAllOption = false,
  className = '',
  title,
}) => {
  const scrollRef = useRef(null);

  const handleScroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = 260;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div className={`space-y-2.5 ${className}`}>
      {title && (
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            {title}
          </span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => handleScroll('left')}
              className="w-7 h-7 rounded-full bg-white border border-slate-200/90 hover:border-slate-400 text-slate-600 hover:text-slate-900 flex items-center justify-center shadow-2xs hover:shadow-xs transition-all active:scale-95"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => handleScroll('right')}
              className="w-7 h-7 rounded-full bg-white border border-slate-200/90 hover:border-slate-400 text-slate-600 hover:text-slate-900 flex items-center justify-center shadow-2xs hover:shadow-xs transition-all active:scale-95"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Outer Slider Container */}
      <div className="relative group/slider">
        {/* Left Arrow Floating Button */}
        {!title && (
          <button
            type="button"
            onClick={() => handleScroll('left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 z-20 w-8 h-8 rounded-full bg-white border border-slate-900/80 text-slate-800 shadow-md flex items-center justify-center hover:bg-slate-50 transition-all opacity-0 group-hover/slider:opacity-100 focus:opacity-100"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}

        {/* Scrollable Horizontal Track */}
        <div
          ref={scrollRef}
          className="flex items-center gap-2.5 sm:gap-3 overflow-x-auto scroll-smooth py-1 px-1 scrollbar-none"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {/* Optional "All Categories" Pill for Filters */}
          {showAllOption && (
            <button
              type="button"
              onClick={() => onSelectCategory?.('')}
              className={`inline-flex items-stretch overflow-hidden rounded-full border border-slate-900 shadow-2xs transition-all duration-150 select-none shrink-0 ${
                !selectedCategory
                  ? 'ring-2 ring-[#6257D9] ring-offset-2 scale-[1.03] shadow-xs'
                  : 'hover:scale-[1.02] opacity-85 hover:opacity-100'
              }`}
            >
              <div className="w-10 sm:w-11 flex items-center justify-center border-r border-slate-900 bg-slate-900 text-white shrink-0">
                <Layers className="w-4 h-4 stroke-[2]" />
              </div>
              <div className="px-4 py-2 flex items-center bg-white">
                <span className="text-xs sm:text-sm font-bold text-slate-900 tracking-tight whitespace-nowrap">
                  All Categories
                </span>
              </div>
            </button>
          )}

          {/* Capsule Pills matching the user's reference image */}
          {PILL_CATEGORIES.map((pill) => {
            const isSelected = selectedCategory === pill.id;

            return (
              <button
                key={pill.id}
                type="button"
                onClick={() => onSelectCategory?.(pill.id)}
                className={`inline-flex items-stretch overflow-hidden rounded-full border border-slate-900 shadow-2xs transition-all duration-150 select-none shrink-0 cursor-pointer ${
                  isSelected
                    ? 'ring-2 ring-[#6257D9] ring-offset-2 scale-[1.03] shadow-xs'
                    : 'hover:scale-[1.02] opacity-90 hover:opacity-100'
                }`}
                title={`Filter by ${pill.label}`}
              >
                {/* Left Split Segment: Color Box with Icon */}
                <div
                  className={`w-10 sm:w-11 flex items-center justify-center border-r border-slate-900 ${pill.leftBg} ${pill.leftTextColor} shrink-0`}
                >
                  {pill.icon}
                </div>

                {/* Right Split Segment: Label Area */}
                <div className={`px-4 py-2 flex items-center ${pill.rightBg}`}>
                  <span className="text-xs sm:text-sm font-bold text-slate-900 tracking-tight whitespace-nowrap">
                    {pill.label}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Right Arrow Floating Button */}
        {!title && (
          <button
            type="button"
            onClick={() => handleScroll('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 z-20 w-8 h-8 rounded-full bg-white border border-slate-900/80 text-slate-800 shadow-md flex items-center justify-center hover:bg-slate-50 transition-all opacity-0 group-hover/slider:opacity-100 focus:opacity-100"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
