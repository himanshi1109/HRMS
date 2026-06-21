import React from 'react';

export const Badge = ({ status = '' }) => {
  const normStatus = status.trim().toUpperCase();

  let styles = {
    bg: 'bg-indigo-muted',
    text: 'text-stardust-text',
    border: 'border-indigo-border',
  };

  if (normStatus === 'PRESENT' || normStatus === 'ACTIVE' || normStatus === 'ON_TIME') {
    // Badge Present: #704A3C
    styles = {
      bg: 'bg-badge-present/15',
      text: 'text-badge-present',
      border: 'border-badge-present/30',
    };
  } else if (normStatus === 'ABSENT' || normStatus === 'REJECTED' || normStatus === 'INACTIVE' || normStatus === 'TERMINATED') {
    // Badge Absent: #2E1F1B
    styles = {
      bg: 'bg-badge-absent/20',
      text: 'text-[#704A3C]', // Muted red for clear legibility on dark bg, keeping within general color context
      border: 'border-badge-absent/40',
    };
  } else if (normStatus === 'PENDING' || normStatus === 'SUBMITTED') {
    // Badge Pending: #5E4B43
    styles = {
      bg: 'bg-badge-pending',
      text: 'text-grey-text',
      border: 'border-indigo-border',
    };
  } else if (normStatus === 'APPROVED' || normStatus === 'CONFIRMED' || normStatus === 'COMPLETED') {
    // Badge Approved: #5E4B43
    styles = {
      bg: 'bg-badge-approved/20',
      text: 'text-[#E8E3DD]', // Muted teal-light for approved
      border: 'border-badge-approved/30',
    };
  } else if (normStatus === 'LATE' || normStatus === 'WARNING' || normStatus === 'ON_LEAVE' || normStatus === 'HALF_DAY') {
    // Badge Late: #8B7B6F
    styles = {
      bg: 'bg-badge-late/15',
      text: 'text-[#8B7B6F]', // Steel teal tint
      border: 'border-badge-late/30',
    };
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles.bg} ${styles.text} ${styles.border}`}>
      {status.replace(/_/g, ' ')}
    </span>
  );
};

export default Badge;
