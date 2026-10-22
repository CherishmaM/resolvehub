import React from 'react';

export const Logo = ({
  size = 'md', // 'sm', 'md', 'lg'
  className = '',
}) => {
  const sizeMap = {
    sm: 'h-7',
    md: 'h-9',
    lg: 'h-12',
  };

  return (
    <div className={`inline-flex items-center select-none ${className}`}>
      <img
        src="/logo-theme-cropped.png"
        alt="ResolveHub — Plan • Track • Resolve"
        className={`${sizeMap[size] || 'h-9'} w-auto object-contain drop-shadow-2xs transition-transform duration-200 hover:scale-[1.02]`}
      />
    </div>
  );
};

export const LogoMark = ({
  size = 'md',
  className = '',
}) => {
  const sizeMap = {
    sm: 'h-5',
    md: 'h-7',
    lg: 'h-9',
  };

  return (
    <img
      src="/logo-theme-mark.png"
      alt="ResolveHub Mark"
      className={`${sizeMap[size] || 'h-7'} w-auto object-contain ${className}`}
    />
  );
};

export default Logo;
