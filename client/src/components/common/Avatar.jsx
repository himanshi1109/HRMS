import React from 'react';

export const Avatar = ({ name = '', src, size = 'md' }) => {
  const getInitials = (fullName) => {
    if (!fullName) return '?';
    const parts = fullName.trim().split(' ');
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const sizeClasses = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-14 h-14 text-lg font-semibold',
    xl: 'w-24 h-24 text-2xl font-bold',
  };

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={`${sizeClasses[size] || sizeClasses.md} rounded-full object-cover border border-indigo-border`}
      />
    );
  }

  // Generate initials
  const initials = getInitials(name);
  
  return (
    <div
      className={`${sizeClasses[size] || sizeClasses.md} rounded-full flex items-center justify-center font-medium bg-indigo-brand border border-indigo-border text-stardust-text uppercase tracking-wide select-none`}
    >
      {initials}
    </div>
  );
};

export default Avatar;
