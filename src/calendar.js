export const MONTH_FORMATTER = new Intl.DateTimeFormat("en-IN", {
  month: "long",
  year: "numeric"
});

export const DAY_FORMATTER = new Intl.DateTimeFormat("en-IN", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric"
});

export const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];

export function toDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function todayDate() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

export function daysInMonth(year, monthIndex) {
  return new Date(year, monthIndex + 1, 0).getDate();
}

export function clampDate(year, monthIndex, day) {
  const maxDay = daysInMonth(year, monthIndex);
  return new Date(year, monthIndex, Math.min(day, maxDay));
}

export function addMonths(date, delta) {
  return clampDate(date.getFullYear(), date.getMonth() + delta, date.getDate());
}

export function addYears(date, delta) {
  return clampDate(date.getFullYear() + delta, date.getMonth(), date.getDate());
}

export function buildMonthGrid(displayDate) {
  const year = displayDate.getFullYear();
  const month = displayDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const totalDays = daysInMonth(year, month);
  const cells = [];

  for (let i = 0; i < firstDay; i += 1) cells.push(null);
  for (let day = 1; day <= totalDays; day += 1) cells.push(new Date(year, month, day));
  while (cells.length % 7 !== 0) cells.push(null);

  return cells;
}
