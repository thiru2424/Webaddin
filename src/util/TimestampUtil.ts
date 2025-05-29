export function getFormattedTimestamp(): string {
  const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const now = new Date();
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: userTimeZone,
    year: "2-digit",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
    timeZoneName: "short",
  });

  const parts = formatter.formatToParts(now);

  const dateParts: Record<string, string> = {};
  parts.forEach(({ type, value }) => {
    dateParts[type] = value;
  });

  return `${dateParts.day}-${dateParts.month}-${dateParts.year} ${dateParts.hour}:${dateParts.minute}:${dateParts.second} ${dateParts.dayPeriod}`;
}
