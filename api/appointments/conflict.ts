const ACTIVE = new Set(['scheduled', 'completed']);

export function hasConflict(
  existing: { scheduled_at: string; status: string }[],
  newScheduledAt: string,
  windowMinutes = 30
): boolean {
  const target = Date.parse(newScheduledAt);
  if (isNaN(target)) return false;
  const windowMs = windowMinutes * 60 * 1000;
  return existing.some((appt) => {
    if (!ACTIVE.has(appt.status)) return false;
    const t = Date.parse(appt.scheduled_at);
    if (isNaN(t)) return false;
    return Math.abs(t - target) < windowMs;
  });
}
