import { format, parseISO } from 'date-fns';

export const formatDate = (dateString, formatStr = 'dd MMM yyyy') => {
  if (!dateString) return '-';
  try {
    const date = typeof dateString === 'string' ? parseISO(dateString) : new Date(dateString);
    return format(date, formatStr);
  } catch (error) {
    return '-';
  }
};

export const formatTime = (timeString) => {
  if (!timeString) return '-';
  try {
    const date = typeof timeString === 'string' ? parseISO(timeString) : new Date(timeString);
    return format(date, 'hh:mm a');
  } catch (error) {
    return timeString;
  }
};

export const formatCurrency = (amount) => {
  if (amount === null || amount === undefined) return '-';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
};

export const capitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase().replace(/_/g, ' ');
};
