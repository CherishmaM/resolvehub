import React from 'react';

export const getInitials = (name) => {
  if (!name) return 'U';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return parts[0].slice(0, 2).toUpperCase();
};

export const getTitleColor = (title = '') => {
  if (!title) return 'bg-[#7c3aed] text-white';

  const t = title.toLowerCase();

  // Role & Title specific distinctive color palettes
  if (t.includes('frontend') || t.includes('react') || t.includes('web')) {
    return 'bg-indigo-600 text-white';
  }
  if (t.includes('backend') || t.includes('database') || t.includes('api')) {
    return 'bg-emerald-600 text-white';
  }
  if (t.includes('full-stack') || t.includes('full stack')) {
    return 'bg-purple-600 text-white';
  }
  if (t.includes('product') || t.includes('project') || t.includes('manager')) {
    return 'bg-amber-600 text-white';
  }
  if (t.includes('qa') || t.includes('test') || t.includes('quality')) {
    return 'bg-rose-600 text-white';
  }
  if (t.includes('design') || t.includes('ui') || t.includes('ux')) {
    return 'bg-fuchsia-600 text-white';
  }
  if (t.includes('devops') || t.includes('sre') || t.includes('cloud') || t.includes('infra')) {
    return 'bg-sky-600 text-white';
  }
  if (t.includes('lead') || t.includes('admin') || t.includes('head') || t.includes('director')) {
    return 'bg-[#5b42d6] text-white';
  }

  // Consistent color palette hash for custom titles
  const palette = [
    'bg-indigo-600 text-white',
    'bg-emerald-600 text-white',
    'bg-purple-600 text-white',
    'bg-amber-600 text-white',
    'bg-rose-600 text-white',
    'bg-fuchsia-600 text-white',
    'bg-sky-600 text-white',
    'bg-teal-600 text-white',
    'bg-blue-600 text-white',
  ];

  let hash = 0;
  for (let i = 0; i < title.length; i++) {
    hash = title.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % palette.length;
  return palette[index];
};

export const UserAvatar = ({
  name = 'User',
  title = '',
  jobTitle = '',
  role = '',
  avatar,
  size = 'md',
  className = '',
}) => {
  const sizeClasses = {
    xs: 'w-5 h-5 text-[9px]',
    sm: 'w-6 h-6 text-[10px]',
    md: 'w-8 h-8 text-xs',
    lg: 'w-10 h-10 text-sm',
    xl: 'w-12 h-12 text-base',
  };

  // If user provided a custom uploaded photo (and not dicebear default URL)
  if (avatar && !avatar.includes('api.dicebear.com')) {
    return (
      <img
        src={avatar}
        alt={name}
        className={`${sizeClasses[size] || sizeClasses.md} rounded-full object-cover border border-slate-200 shrink-0 ${className}`}
      />
    );
  }

  // Assign distinct profile picture background color based on job title / role
  const effectiveTitle = title || jobTitle || role || name;
  const colorClass = getTitleColor(effectiveTitle);

  return (
    <div
      className={`${sizeClasses[size] || sizeClasses.md} rounded-full ${colorClass} font-bold flex items-center justify-center shrink-0 select-none shadow-2xs ${className}`}
      title={effectiveTitle ? `${name} (${effectiveTitle})` : name}
    >
      {getInitials(name)}
    </div>
  );
};
