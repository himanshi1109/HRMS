import React from 'react';

export const Spinner = ({ size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4 border',
    md: 'w-8 h-8 border-2',
    lg: 'w-12 h-12 border-3',
  };

  return (
    <div className="flex justify-center items-center">
      <div
        className={`${sizeClasses[size] || sizeClasses.md} rounded-full animate-spin border-t-indigo-brand border-indigo-border/20`}
      />
    </div>
  );
};

export const Skeleton = ({ className = '' }) => {
  return (
    <div className={`animate-shimmer rounded-lg ${className}`} />
  );
};

export const SkeletonPage = () => {
  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-32" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Skeleton className="h-80 lg:col-span-2" />
        <Skeleton className="h-80" />
      </div>
      <Skeleton className="h-64 w-full" />
    </div>
  );
};

export default Spinner;
