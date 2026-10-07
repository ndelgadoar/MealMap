import { Unit } from '../recipes/enums/unit.enum.js';
import { buildShoppingList, ShoppingLine } from './shopping-list.js';

const line = (
  name: string,
  quantityPerServing: number,
  unit: Unit = Unit.GRAMS,
): ShoppingLine => ({
  ingredientId: `id-${name}`,
  name,
  unit,
  quantityPerServing,
});

describe('buildShoppingList', () => {
  it('devuelve una lista vacía si no hay líneas', () => {
    expect(buildShoppingList([])).toEqual([]);
  });

  it('suma el mismo ingrediente que aparece en varias comidas', () => {
    const list = buildShoppingList([
      line('Arroz blanco', 100),
      line('Arroz blanco', 70),
      line('Pechuga de pollo', 150),
    ]);

    expect(list.find((i) => i.name === 'Arroz blanco')?.quantity).toBe(170);
    expect(list.find((i) => i.name === 'Pechuga de pollo')?.quantity).toBe(150);
    expect(list).toHaveLength(2);
  });

  it('redondea hacia arriba al entero', () => {
    const [item] = buildShoppingList([line('Pechuga de pollo', 133.3)]);

    expect(item.quantity).toBe(134);
  });

  it('no sube un entero por error de decimales (3 × 250/3 es 250, no 251)', () => {
    const third = 250 / 3;

    const [item] = buildShoppingList([
      line('Papa', third),
      line('Papa', third),
      line('Papa', third),
    ]);

    expect(item.quantity).toBe(250);
  });

  it('las unidades se acumulan y se redondean a unidades completas', () => {
    const [half] = buildShoppingList([line('Limón', 0.5, Unit.UNIT)]);
    const [whole] = buildShoppingList([
      line('Limón', 0.5, Unit.UNIT),
      line('Limón', 0.5, Unit.UNIT),
    ]);

    expect(half.quantity).toBe(1);
    expect(whole.quantity).toBe(1);
  });

  it('mantiene separado un mismo ingrediente en unidades distintas', () => {
    const list = buildShoppingList([
      line('Harina', 100, Unit.GRAMS),
      line('Harina', 50, Unit.MILLILITERS),
    ]);

    expect(list).toHaveLength(2);
  });

  it('ordena alfabéticamente por nombre', () => {
    const list = buildShoppingList([
      line('Zanahoria', 50),
      line('Aguacate', 50),
      line('Ñame', 50),
      line('Leche', 50, Unit.MILLILITERS),
    ]);

    expect(list.map((i) => i.name)).toEqual(['Aguacate', 'Leche', 'Ñame', 'Zanahoria']);
  });

  describe('label', () => {
    it('gramos por debajo de 1 kg', () => {
      const [item] = buildShoppingList([line('Pechuga de pollo', 500)]);

      expect(item.label).toBe('500 g de pechuga de pollo');
    });

    it('pasa a kg desde 1.000 g, con coma decimal', () => {
      const [exact] = buildShoppingList([line('Arroz blanco', 1000)]);
      const [decimal] = buildShoppingList([line('Pechuga de pollo', 1250)]);

      expect(exact.label).toBe('1 kg de arroz blanco');
      expect(decimal.label).toBe('1,25 kg de pechuga de pollo');
    });

    it('en kg redondea hacia arriba: 1.054 g se muestra como 1,06 kg, no 1,05', () => {
      const [item] = buildShoppingList([line('Pechuga de pollo', 1054)]);

      expect(item.quantity).toBe(1054);
      expect(item.label).toBe('1,06 kg de pechuga de pollo');
    });

    it('mililitros y litros', () => {
      const [small] = buildShoppingList([line('Aceite de oliva', 30, Unit.MILLILITERS)]);
      const [big] = buildShoppingList([line('Leche', 1500, Unit.MILLILITERS)]);

      expect(small.label).toBe('30 ml de aceite de oliva');
      expect(big.label).toBe('1,5 L de leche');
    });

    it('unidades en singular y plural', () => {
      const [one] = buildShoppingList([line('Limón', 1, Unit.UNIT)]);
      const [many] = buildShoppingList([line('Huevo', 7, Unit.UNIT)]);

      expect(one.label).toBe('1 unidad de limón');
      expect(many.label).toBe('7 unidades de huevo');
    });
  });
});
