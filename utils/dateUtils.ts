/**
 * Formats a date to display in a user-friendly format
 * @param date The date to format
 * @returns Formatted date string
 */
export const formatDate = (date: Date): string => {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const isToday = date.getDate() === today.getDate() &&
                  date.getMonth() === today.getMonth() &&
                  date.getFullYear() === today.getFullYear();
  
  const isTomorrow = date.getDate() === tomorrow.getDate() &&
                     date.getMonth() === tomorrow.getMonth() &&
                     date.getFullYear() === tomorrow.getFullYear();
  
  if (isToday) {
    return 'Today';
  } else if (isTomorrow) {
    return 'Tomorrow';
  } else {
    // Check if it's within the next 7 days
    const diffTime = Math.abs(date.getTime() - today.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 7 && date > today) {
      return date.toLocaleDateString(undefined, { weekday: 'long' });
    } else {
      return date.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
      });
    }
  }
};

/**
 * Formats a time to display in a user-friendly format
 * @param date The date containing the time to format
 * @returns Formatted time string
 */
export const formatTime = (date: Date): string => {
  return date.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
};

/**
 * Formats a date range to display in a user-friendly format
 * @param startDate The start date
 * @param endDate The end date
 * @returns Formatted date range string
 */
export const formatDateRange = (startDate: Date, endDate: Date): string => {
  const startMonth = startDate.toLocaleDateString(undefined, { month: 'short' });
  const endMonth = endDate.toLocaleDateString(undefined, { month: 'short' });
  const startDay = startDate.getDate();
  const endDay = endDate.getDate();
  const startYear = startDate.getFullYear();
  const endYear = endDate.getFullYear();
  
  if (startYear !== endYear) {
    return `${startMonth} ${startDay}, ${startYear} - ${endMonth} ${endDay}, ${endYear}`;
  } else if (startMonth !== endMonth) {
    return `${startMonth} ${startDay} - ${endMonth} ${endDay}, ${startYear}`;
  } else if (startDay !== endDay) {
    return `${startMonth} ${startDay} - ${endDay}, ${startYear}`;
  } else {
    return `${startMonth} ${startDay}, ${startYear}`;
  }
};