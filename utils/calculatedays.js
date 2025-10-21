export function calculateNumberOfDays(start, end, holidays = []) {
  const startDate = new Date(start);
  const endDate = new Date(end);
  let count = 0;

  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    const day = new Date(d);
    const isWeekend = day.getDay() === 0 || day.getDay() === 6;
    const isHoliday = holidays.some(h => h.toDateString() === day.toDateString());
    if (!isWeekend && !isHoliday) count++;
  }

  return count;
}
