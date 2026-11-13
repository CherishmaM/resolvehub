import React, { useState, useRef, useEffect } from 'react';
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
  const [openUpward, setOpenUpward] = useState(false);
  const dropdownRef = useRef(null);

  // Sync internal state when currentStatus prop updates
  useEffect(() => {
    setStatus(currentStatus);
  }, [currentStatus]);

  // Handle outside clicks and keyboard escape
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const statusOptions = [
    {
      value: 'Open',
      label: 'To Do',
      dotColor: 'bg-[#6366F1]',
      badgeClass: 'bg-[#EEF2FF] text-[#4338CA] border-[#C7D2FE]',
      icon: CircleDot,
    },
    {
      value: 'In Progress',
      label: 'In Progress',
      dotColor: 'bg-[#F97316]',
      badgeClass: 'bg-[#FFF7ED] text-[#C2410C] border-[#FED7AA]',
      icon: Clock,
      pulse: true,
    },
    {
      value: 'Resolved',
      label: 'Done',
      dotColor: 'bg-[#10B981]',
      badgeClass: 'bg-[#ECFDF5] text-[#047857] border-[#A7F3D0]',
      icon: CheckCircle2,
    },
  ];

  const currentOption =
    statusOptions.find((opt) => opt.value === status) || statusOptions[0];

  const handleToggle = (e) => {
    e.stopPropagation();
    if (disabled || isLoading) return;

    if (!isOpen && dropdownRef.current) {
      const rect = dropdownRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      setOpenUpward(spaceBelow < 160);
    }

    setIsOpen((prev) => !prev);
  };

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
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        disabled={disabled || isLoading}
        onClick={handleToggle}
        className={`group/badge inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wide shadow-2xs transition-all duration-150 border active:scale-[0.98] select-none ${
          currentOption.badgeClass
        } ${
          disabled
            ? 'opacity-60 cursor-not-allowed'
            : 'cursor-pointer hover:shadow-xs hover:ring-2 hover:ring-[#6257D9]/25 hover:brightness-95'
        }`}
        title="Click to change status"
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
          className={`w-3 h-3 shrink-0 opacity-60 group-hover/badge:opacity-100 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Floating Status Dropdown Menu */}
      {isOpen && (
        <div
          className={`absolute left-0 w-44 rounded-2xl bg-white border border-[#E2DBF7] shadow-xl shadow-[#6257D9]/15 z-50 p-1.5 animate-dropdown select-none ${
            openUpward ? 'bottom-full mb-1.5' : 'top-full mt-1.5'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="px-2.5 py-1 text-[10px] font-bold text-[#7A7398] uppercase tracking-wider border-b border-slate-100 mb-1">
            Set Status
          </div>

          <div className="space-y-0.5">
            {statusOptions.map((opt) => {
              const isSelected = opt.value === status;
              const Icon = opt.icon;

              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={(e) => handleSelect(opt.value, e)}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all text-left ${
                    isSelected
                      ? `${opt.badgeClass} shadow-2xs`
                      : 'text-slate-700 hover:bg-[#F6F3FF] hover:text-[#6257D9]'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <Icon className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{opt.label}</span>
                  </div>

                  {isSelected && (
                    <Check className="w-3.5 h-3.5 text-current shrink-0 stroke-[2.5]" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default StatusDropdown;
