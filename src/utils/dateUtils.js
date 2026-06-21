const { differenceInMinutes, isWeekend, eachDayOfInterval, isSameDay } = require('date-fns');

/**
 * Calculates the difference in minutes between two dates.
 * Returns 0 if dates are invalid or end is before start.
 */
const calculateMinutesDiff = (start, end) => {
  if (!start || !end) return 0;
  const diff = differenceInMinutes(new Date(end), new Date(start));
  return diff > 0 ? diff : 0;
};

/**
 * Check if a date is a weekend.
 */
const isDateWeekend = (date) => {
  return isWeekend(new Date(date));
};

/**
 * Get all dates in a range.
 */
const getDatesInRange = (startDate, endDate) => {
  return eachDayOfInterval({
    start: new Date(startDate),
    end: new Date(endDate)
  });
};

module.exports = {
  calculateMinutesDiff,
  isDateWeekend,
  getDatesInRange
};
