import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Check, Loader2, CircleDot, Clock, CheckCircle2 } from 'lucide-react';
import { updateIssueStatusApi } from '../../api/issues.api';

export const StatusDropdown = ({
  issueId,
  currentStatus = 'Open',
  onStatusChange,
  disabled = false,
}) => {
  const [status, setStatus] = useState(currentStatus);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [menuCoords, setMenuCoords] = useState({ top: 0, left: 0, width: 200, openUpward: false });
  const buttonRef = useRef(null);
  const menuRef = useRef(null);

  // Sync internal state when currentStatus prop updates
  useEffect(() => {
    setStatus(currentStatus);
  }, [currentStatus]);

  // Recalculate coordinates relative to window viewport
  const updatePosition = () => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const menuHeight = 175;
    const spaceBelow = window.innerHeight - rect.bottom;
    const openUpward = spaceBelow < menuHeight && rect.top > menuHeight;

    setMenuCoords({
      top: openUpward ? rect.top - menuHeight - 8 : rect.bottom + 8,
      left: Math.max(12, Math.min(rect.left, window.innerWidth - 220)),
      width: Math.max(200, rect.width),
      openUpward,
    });
  };

  const handleToggle = (e) => {
    e.stopPropagation();
    if (disabled || isLoading) return;

    if (!isOpen) {
      updatePosition();
    }
    setIsOpen((prev) => !prev);
  };

  // Close on outside click, Escape key, or window resize/scroll
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event) => {
      if (
        buttonRef.current &&
        !buttonRef.current.contains(event.target) &&
        menuRef.current &&
        !menuRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    const handleScrollOrResize = () => {
      updatePosition();
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    window.addEventListener('scroll', handleScrollOrResize, { passive: true, capture: true });
    window.addEventListener('resize', handleScrollOrResize);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('scroll', handleScrollOrResize, { capture: true });
      window.removeEventListener('resize', handleScrollOrResize);
    };
  }, [isOpen]);

  const statusOptions = [
    {
      value: 'Open',
      label: 'To Do',
      sublabel: 'Not Resolved',
      dotColor: 'bg-[#6366F1]',
      badgeClass: 'bg-[#EEF2FF] text-[#4338CA] border-[#C7D2FE]',
      icon: CircleDot,
    },
    {
      value: 'In Progress',
      label: 'In Progress',
      sublabel: 'Under Progress',
      dotColor: 'bg-[#F97316]',
      badgeClass: 'bg-[#FFF7ED] text-[#C2410C] border-[#FED7AA]',
      icon: Clock,
      pulse: true,
    },
    {
      value: 'Resolved',
      label: 'Resolved',
      sublabel: 'Done / Resolved',
      dotColor: 'bg-[#10B981]',
      badgeClass: 'bg-[#ECFDF5] text-[#047857] border-[#A7F3D0]',
      icon: CheckCircle2,
    },
  ];

  const currentOption =
    statusOptions.find((opt) => opt.value === status) || statusOptions[0];

  const handleSelect = async (newStatus, e) => {
    e.stopPropagation();
    if (newStatus === status || isLoading) {
      setIsOpen(false);
      return;
    }

    const previousStatus = status;
    setStatus(newStatus); // Optimistic UI update
    setIsOpen(false);
    setIsLoading(true);

    try {
      const response = await updateIssueStatusApi(issueId, newStatus);
      if (onStatusChange) {
        onStatusChange(newStatus, response.data);
      }
    } catch (err) {
      console.error('Failed to update status:', err);
      // Rollback on failure
      setStatus(previousStatus);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative inline-block text-left" ref={buttonRef}>
      {/* Interactive Trigger Button */}
      <button
        type="button"
        disabled={disabled || isLoading}
        onClick={handleToggle}
        className={`group/badge inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wide shadow-2xs transition-all duration-150 border active:scale-[0.98] select-none ${
          currentOption.badgeClass
        } ${
          disabled
            ? 'opacity-60 cursor-not-allowed'
            : 'cursor-pointer hover:shadow-xs hover:ring-2 hover:ring-[#6257D9]/30 hover:brightness-95'
        }`}
        title="Click to change status (To Do, In Progress, Resolved)"
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        {isLoading ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0 text-current" />
        ) : currentOption.pulse ? (
          <span className="relative flex h-2 w-2 shrink-0">
            <span className="animate-beacon-pulse absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500" />
          </span>
        ) : (
          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${currentOption.dotColor}`} />
        )}

        <span>{currentOption.label}</span>

        <ChevronDown
          className={`w-3.5 h-3.5 shrink-0 opacity-70 group-hover/badge:opacity-100 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Floating Menu Portal - rendered at top level into document.body so NO table row can ever cover it */}
      {isOpen &&
        createPortal(
          <div
            ref={menuRef}
            style={{
              position: 'fixed',
              top: `${menuCoords.top}px`,
              left: `${menuCoords.left}px`,
              zIndex: 99999,
              width: `${menuCoords.width}px`,
            }}
            className="rounded-2xl bg-white border border-[#D5C7EE] shadow-2xl shadow-[#6257D9]/25 p-2 animate-scale-in select-none"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-2.5 py-1 text-[10px] font-bold text-[#7A7398] uppercase tracking-wider border-b border-slate-100 mb-1.5 flex items-center justify-between">
              <span>Mark Status</span>
              <span className="text-[9px] text-[#85819C] font-normal">Click to update</span>
            </div>

            <div className="space-y-1">
              {statusOptions.map((opt) => {
                const isSelected = opt.value === status;
                const Icon = opt.icon;

                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={(e) => handleSelect(opt.value, e)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all duration-150 text-left ${
                      isSelected
                        ? 'bg-[#F0EBFF] text-[#6257D9] border border-[#DDD3FA] shadow-2xs font-bold'
                        : 'text-slate-800 hover:bg-[#F6F3FF] hover:text-[#6257D9] border border-transparent font-medium'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${opt.dotColor}`} />
                      <div className="flex flex-col min-w-0 leading-tight">
                        <span className="text-xs truncate">{opt.label}</span>
                        <span className="text-[10px] text-slate-400 font-normal truncate">
                          {opt.sublabel}
                        </span>
                      </div>
                    </div>

                    {isSelected && (
                      <Check className="w-4 h-4 text-[#6257D9] shrink-0 stroke-[2.5]" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};

export default StatusDropdown;
