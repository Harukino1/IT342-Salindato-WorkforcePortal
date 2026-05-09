export function formatDateTime(date) {
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year:    "numeric",
    month:   "long",
    day:     "numeric",
  }) + " | " + date.toLocaleTimeString("en-US", {
    hour:   "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export function parseBackendDate(value) {
  if (!value) return null;

  if (Array.isArray(value)) {
    const [year, month = 1, day = 1, hour = 0, minute = 0, second = 0, nano = 0] = value;
    const millis = Math.floor((Number(nano) || 0) / 1_000_000);
    const parsed = new Date(year, (month - 1), day, hour, minute, second, millis);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  if (typeof value === "object") {
    const year = Number(value.year);
    const month = Number(value.monthValue ?? value.month ?? 1);
    const day = Number(value.dayOfMonth ?? value.day ?? 1);
    const hour = Number(value.hour ?? 0);
    const minute = Number(value.minute ?? 0);
    const second = Number(value.second ?? 0);
    const nano = Number(value.nano ?? 0);
    if (Number.isFinite(year) && Number.isFinite(month) && Number.isFinite(day)) {
      const millis = Math.floor(Math.max(0, nano) / 1_000_000);
      const parsed = new Date(year, month - 1, day, hour, minute, second, millis);
      return Number.isNaN(parsed.getTime()) ? null : parsed;
    }
  }

  const dateValue = typeof value === "string" && !value.includes("T")
    ? `${value}T00:00:00`
    : value;
  const parsed = new Date(dateValue);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function formatTime(value) {
  const date = value instanceof Date ? value : parseBackendDate(value);
  if (!date) return "-";
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatShortDate(value) {
  const date = parseBackendDate(value);
  if (!date) return "-";
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
  });
}

export function formatDurationHM(totalMinutes) {
  if (!Number.isFinite(totalMinutes) || totalMinutes < 0) return "0h0m";
  const safeMinutes = Math.max(0, Math.floor(totalMinutes));
  const hours = Math.floor(safeMinutes / 60);
  const mins = safeMinutes % 60;
  return `${hours}h${mins}m`;
}

export function formatDurationHMS(totalSeconds) {
  if (!Number.isFinite(totalSeconds) || totalSeconds < 0) return "00h00m00s";
  const safeSeconds = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const seconds = safeSeconds % 60;
  return `${String(hours).padStart(2, "0")}h${String(minutes).padStart(2, "0")}m${String(seconds).padStart(2, "0")}s`;
}


export function sameLocalDay(dateA, dateB) {
  return (
    dateA.getFullYear() === dateB.getFullYear() &&
    dateA.getMonth() === dateB.getMonth() &&
    dateA.getDate() === dateB.getDate()
  );
}

export function calculateAttendanceDurations(record, nowDate) {
  const clockInDate = parseBackendDate(record?.clockIn);
  const clockOutDate = parseBackendDate(record?.clockOut);
  const breakStartDate = parseBackendDate(record?.breakStartedAt);

  if (!clockInDate) {
    return { workedSeconds: 0, totalBreakSeconds: 0 };
  }

  const persistedBreakSeconds = Number(record?.breakDuration) || 0;
  const liveBreakSeconds = breakStartDate && !clockOutDate
    ? Math.max(0, Math.floor((nowDate.getTime() - breakStartDate.getTime()) / 1000))
    : 0;
  const totalBreakSeconds = Math.max(0, persistedBreakSeconds + liveBreakSeconds);

  const elapsedSeconds = Math.max(
    0,
    Math.floor(((clockOutDate || nowDate).getTime() - clockInDate.getTime()) / 1000)
  );

  const computedWorkedSeconds = Math.max(0, elapsedSeconds - totalBreakSeconds);
  const persistedWorkedSeconds = Math.max(0, Math.round((Number(record?.totalHours) || 0) * 3600));

  return {
    workedSeconds: clockOutDate ? Math.max(computedWorkedSeconds, persistedWorkedSeconds) : computedWorkedSeconds,
    totalBreakSeconds,
  };
}

export function getRecentActivityDurations(record, nowDate) {
  const clockOutDate = parseBackendDate(record?.clockOut);
  if (!clockOutDate) {
    return {
      workingHours: "-",
      breakDuration: "-",
    };
  }

  const computed = calculateAttendanceDurations(record, nowDate);
  const persistedWorkedSeconds = Math.max(0, Math.round((Number(record?.totalHours) || 0) * 3600));
  const workedSeconds = Math.max(computed.workedSeconds, persistedWorkedSeconds);

  return {
    workingHours: formatDurationHM(Math.floor(workedSeconds / 60)),
    breakDuration: formatDurationHM(Math.floor(computed.totalBreakSeconds / 60)),
  };
}

