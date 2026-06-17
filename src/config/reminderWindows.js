export const REMINDER_WINDOWS = [
  { key: "6h", hours: 6, toleranceMinutes: 5 },
  { key: "3h", hours: 3, toleranceMinutes: 5 },
  { key: "1h", hours: 1, toleranceMinutes: 5 },
];

export const REMINDER_KEYS = REMINDER_WINDOWS.map((w) => w.key);

export const HOURS_BEFORE_LABELS = REMINDER_WINDOWS.reduce((acc, w) => {
  acc[w.key] = `${w.hours} hours`;
  return acc;
}, {});

