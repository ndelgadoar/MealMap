import { currentWeekStart } from './week.util.js';

describe('currentWeekStart', () => {
  it('devuelve el lunes de la semana para un día entre semana', () => {
    // Miércoles 7 de octubre de 2026, mediodía en Colombia
    expect(currentWeekStart(new Date('2026-10-07T17:00:00Z'))).toBe('2026-10-05');
  });

  it('un lunes devuelve ese mismo día', () => {
    expect(currentWeekStart(new Date('2026-10-05T17:00:00Z'))).toBe('2026-10-05');
  });

  it('un domingo devuelve el lunes anterior', () => {
    expect(currentWeekStart(new Date('2026-10-11T17:00:00Z'))).toBe('2026-10-05');
  });

  it('usa la hora de Colombia: domingo 10 p. m. allá ya es lunes en UTC, pero sigue siendo la semana anterior', () => {
    // 2026-10-05 03:00 UTC = domingo 4 de octubre, 10:00 p. m. en Bogotá (UTC-5)
    expect(currentWeekStart(new Date('2026-10-05T03:00:00Z'))).toBe('2026-09-28');
  });

  it('funciona al cruzar de mes y de año', () => {
    // Viernes 1 de enero de 2027 -> lunes 28 de diciembre de 2026
    expect(currentWeekStart(new Date('2027-01-01T17:00:00Z'))).toBe('2026-12-28');
  });
});
