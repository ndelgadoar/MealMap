const TIME_ZONE = 'America/Bogota';
const MS_PER_DAY = 24 * 60 * 60 * 1000;

// Devuelve el lunes de la semana de `now` en formato YYYY-MM-DD.
// Se usa la hora de Colombia para que el cambio de semana no dependa de la zona horaria del servidor.
export function currentWeekStart(now: Date = new Date()): string {
  // 'en-CA' formatea la fecha como YYYY-MM-DD
  const today = now.toLocaleDateString('en-CA', { timeZone: TIME_ZONE });
  const date = new Date(`${today}T00:00:00Z`);

  const daysSinceMonday = (date.getUTCDay() + 6) % 7; // lunes = 0 ... domingo = 6
  return new Date(date.getTime() - daysSinceMonday * MS_PER_DAY)
    .toISOString()
    .slice(0, 10);
}
