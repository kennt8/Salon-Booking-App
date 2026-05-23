const MORNING_SLOTS = [
  { h: 9, m: 0 },
  { h: 9, m: 30 },
  { h: 10, m: 0 },
  { h: 10, m: 30 },
  { h: 11, m: 0 },
  { h: 11, m: 30 },
];

const AFTERNOON_SLOTS = [
  { h: 13, m: 0 },
  { h: 13, m: 30 },
  { h: 14, m: 0 },
  { h: 14, m: 30 },
  { h: 15, m: 0 },
  { h: 15, m: 30 },
];

export const BOOKING_TIME_SLOTS = [...MORNING_SLOTS, ...AFTERNOON_SLOTS];

export function formatSlotLabel({ h, m }) {
  const date = new Date();
  date.setHours(h, m, 0, 0);
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

export function applySlotToDate(baseDate, slot) {
  const next = new Date(baseDate);
  next.setHours(slot.h, slot.m, 0, 0);
  return next;
}

export function slotKey(slot) {
  return `${slot.h}:${slot.m}`;
}

export function parseSlotKey(key) {
  const [h, m] = key.split(":").map(Number);
  return { h, m };
}

export function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning,";
  if (hour < 17) return "Good afternoon,";
  return "Good evening,";
}

export function buildDateOptions(count = 14) {
  const options = [];
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  for (let i = 0; i < count; i += 1) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    options.push(d);
  }
  return options;
}

export function formatDayLabel(date) {
  return date.toLocaleDateString("en-US", { weekday: "short" });
}

export function formatMonthYear(date) {
  return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

export function isSameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}
