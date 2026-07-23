export interface FutureDateOptions {
  hours?: number;
  minutes?: number;
  seconds?: number;
  milliseconds?: number;
}

export function getFutureDateIso(
  days = 1,
  options: FutureDateOptions = {},
): string {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + days);
  date.setUTCHours(
    options.hours ?? 9,
    options.minutes ?? 0,
    options.seconds ?? 0,
    options.milliseconds ?? 0,
  );
  return date.toISOString();
}
