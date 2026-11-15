import React, { useState, useEffect } from 'react';
import {
  FolderKanban,
  Sparkles,
  Rocket,
  Cpu,
  Layers,
  Globe,
  Shield,
  Zap,
  Terminal,
  Code2,
  Boxes,
  Flame,
  Target,
  Compass,
  Atom,
  Workflow,
  Activity,
  Database,
  Bug,
} from 'lucide-react';

export const processDeviceImage = (file) => {
  return new Promise((resolve, reject) => {
    if (!file) return reject(new Error('No file selected'));

    const allowed = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/svg+xml', 'image/gif'];
    if (!allowed.includes(file.type)) {
      return reject(new Error('Please select a valid image file (PNG, JPG, SVG, WebP, or GIF).'));
    }

    if (file.size > 8 * 1024 * 1024) {
      return reject(new Error('File exceeds 8MB size limit. Please select a smaller image.'));
    }

    // For SVG vector files, read directly
    if (file.type === 'image/svg+xml') {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(new Error('Failed to read SVG file.'));
      reader.readAsDataURL(file);
      return;
    }

    // For raster images, optimize to sharp icon resolution (max 320x320)
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const maxDim = 320;
        let width = img.width;
        let height = img.height;

        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL(file.type === 'image/png' ? 'image/png' : 'image/jpeg', 0.92);
        resolve(dataUrl);
      };
      img.onerror = () => {
        resolve(e.target.result);
      };
      img.src = e.target.result;
    };
    reader.onerror = () => reject(new Error('Failed to read image file from device.'));
    reader.readAsDataURL(file);
  });
};

export const PROJECT_ICON_OPTIONS = [
  { name: 'FolderKanban', label: 'Workspace Folder', icon: FolderKanban },
  { name: 'Rocket', label: 'Rocket Launch', icon: Rocket },
  { name: 'Zap', label: 'Lightning Zap', icon: Zap },
  { name: 'Sparkles', label: 'Sparkles / AI', icon: Sparkles },
  { name: 'Cpu', label: 'CPU Processor', icon: Cpu },
  { name: 'Layers', label: 'Platform Layers', icon: Layers },
  { name: 'Code2', label: 'Source Code', icon: Code2 },
  { name: 'Terminal', label: 'CLI Terminal', icon: Terminal },
  { name: 'Database', label: 'Database Cloud', icon: Database },
  { name: 'Globe', label: 'Web & Network', icon: Globe },
  { name: 'Shield', label: 'Security Shield', icon: Shield },
  { name: 'Boxes', label: 'Microservices', icon: Boxes },
  { name: 'Flame', label: 'Hot Engine', icon: Flame },
  { name: 'Target', label: 'Sprint Target', icon: Target },
  { name: 'Compass', label: 'Core Navigation', icon: Compass },
  { name: 'Atom', label: 'React / Science', icon: Atom },
  { name: 'Workflow', label: 'Automated Flow', icon: Workflow },
  { name: 'Bug', label: 'Bug Tracker', icon: Bug },
];

export const PROJECT_COLOR_PRESETS = [
  { label: 'Iris Primary', value: '#6257D9', bg: '#EDE9FE', border: '#DDD6FE' },
  { label: 'Royal Indigo', value: '#4F46E5', bg: '#EEF2FF', border: '#C7D2FE' },
  { label: 'Sky Cyan', value: '#0284C7', bg: '#E0F2FE', border: '#BAE6FD' },
  { label: 'Emerald Mint', value: '#059669', bg: '#ECFDF5', border: '#A7F3D0' },
  { label: 'Amber Gold', value: '#D97706', bg: '#FFFBEB', border: '#FDE68A' },
  { label: 'Ruby Crimson', value: '#DC2626', bg: '#FEF2F2', border: '#FECACA' },
  { label: 'Rose Pink', value: '#DB2777', bg: '#FDF2F8', border: '#FBCFE8' },
  { label: 'Deep Violet', value: '#7C3AED', bg: '#F5F3FF', border: '#DDD6FE' },
];

export const PROJECT_EMOJI_PRESETS = [
  '🚀', '⚡', '💎', '🛠️', '🛡️', '🌐', '🎯', '🔥', '💻', '🧠', '📦', '🤖', '✨', '⚡', '💡', '🏷️'
];

const ICON_MAP = {
  FolderKanban,
  Sparkles,
  Rocket,
  Cpu,
  Layers,
  Globe,
  Shield,
  Zap,
  Terminal,
  Code2,
  Boxes,
  Flame,
  Target,
  Compass,
  Atom,
  Workflow,
  Activity,
  Database,
  Bug,
};

export const ProjectLogo = ({
  project,
  size = 'md',
  className = '',
  showBackground = true,
}) => {
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setImgError(false);
  }, [project?.logo, project?.logoType]);

  const logoType = project?.logoType || 'icon';
  const logoValue = project?.logo || 'FolderKanban';
  const color = project?.logoColor || '#6257D9';

  const sizeClasses = {
    xs: {
      box: 'w-4 h-4 rounded-md text-[10px]',
      icon: 'w-2.5 h-2.5',
      emoji: 'text-[10px]',
      initials: 'text-[9px]',
    },
    sm: {
      box: 'w-5 h-5 rounded-lg text-xs',
      icon: 'w-3 h-3',
      emoji: 'text-xs',
      initials: 'text-[10px]',
    },
    md: {
      box: 'w-7 h-7 rounded-xl text-sm',
      icon: 'w-4 h-4',
      emoji: 'text-sm',
      initials: 'text-xs',
    },
    lg: {
      box: 'w-10 h-10 rounded-2xl text-base',
      icon: 'w-5 h-5',
      emoji: 'text-base',
      initials: 'text-sm',
    },
    xl: {
      box: 'w-14 h-14 rounded-3xl text-xl',
      icon: 'w-7 h-7',
      emoji: 'text-2xl',
      initials: 'text-base',
    },
  };

  const currentSize = sizeClasses[size] || sizeClasses.md;

  // 1. Custom Image / Uploaded Logo
  if (logoType === 'image' && logoValue && !imgError) {
    return (
      <div
        className={`inline-flex items-center justify-center shrink-0 overflow-hidden ${
          currentSize.box
        } ${showBackground ? 'bg-white border border-slate-200 shadow-2xs' : ''} ${className}`}
      >
        <img
          src={logoValue}
          alt={project?.name || 'Project Logo'}
          onError={() => setImgError(true)}
          className="w-full h-full object-cover rounded-inherit"
        />
      </div>
    );
  }

  // 2. Emoji Logo
  if (logoType === 'emoji' && logoValue) {
    return (
      <div
        style={
          showBackground
            ? {
                backgroundColor: `${color}14`,
                borderColor: `${color}35`,
              }
            : {}
        }
        className={`inline-flex items-center justify-center shrink-0 select-none ${
          currentSize.box
        } ${showBackground ? 'border shadow-2xs' : ''} ${className}`}
      >
        <span className={currentSize.emoji} role="img" aria-label="Project Logo Emoji">
          {logoValue}
        </span>
      </div>
    );
  }

  // 3. Initials Monogram Badge
  if (logoType === 'initials') {
    const initials = (project?.key || project?.name || 'PR')
      .replace(/[^A-Za-z0-9]/g, '')
      .slice(0, 2)
      .toUpperCase();

    return (
      <div
        style={{
          backgroundColor: `${color}16`,
          borderColor: `${color}40`,
          color: color,
        }}
        className={`inline-flex items-center justify-center font-bold font-mono tracking-tight shrink-0 select-none border shadow-2xs ${
          currentSize.box
        } ${className}`}
      >
        <span className={currentSize.initials}>{initials}</span>
      </div>
    );
  }

  // 4. Default: Icon Preset
  const IconComponent = ICON_MAP[logoValue] || FolderKanban;

  return (
    <div
      style={
        showBackground
          ? {
              backgroundColor: `${color}14`,
              borderColor: `${color}35`,
              color: color,
            }
          : { color: color }
      }
      className={`inline-flex items-center justify-center shrink-0 transition-transform ${
        currentSize.box
      } ${showBackground ? 'border shadow-2xs' : ''} ${className}`}
    >
      <IconComponent className={currentSize.icon} style={{ color }} />
    </div>
  );
};

export default ProjectLogo;
