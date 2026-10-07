import { Unit } from '../recipes/enums/unit.enum.js';

// Cantidad de un ingrediente que aporta UNA comida del plan (una porción de una receta)
export interface ShoppingLine {
  ingredientId: string;
  name: string;
  unit: Unit;
  quantityPerServing: number;
}

export interface ShoppingItem {
  ingredientId: string;
  name: string;
  quantity: number; // entero, redondeado hacia arriba
  unit: Unit;
  label: string; // p. ej. "1,2 kg de pechuga de pollo"
}

// Suma lo que aporta cada comida del plan y agrupa por ingrediente.
// Las cantidades se redondean hacia arriba al entero: no se compra medio limón
// ni 83,3 g de arroz. Un mismo ingrediente en dos unidades distintas queda en dos líneas.
export function buildShoppingList(lines: ShoppingLine[]): ShoppingItem[] {
  const totals = new Map<string, ShoppingLine & { total: number }>();

  for (const line of lines) {
    const key = `${line.ingredientId}|${line.unit}`;
    const current = totals.get(key);
    if (current) {
      current.total += line.quantityPerServing;
    } else {
      totals.set(key, { ...line, total: line.quantityPerServing });
    }
  }

  return [...totals.values()]
    .map(({ ingredientId, name, unit, total }) => {
      const quantity = roundUp(total);
      return { ingredientId, name, quantity, unit, label: toLabel(quantity, unit, name) };
    })
    .sort((a, b) => a.name.localeCompare(b.name, 'es'));
}

// Se redondea a 6 decimales antes de subir al entero para absorber el error de los decimales
// (por ejemplo 3 × 83,333… daría 250,00000000000003 y subiría a 251).
function roundUp(value: number): number {
  return Math.ceil(Number(value.toFixed(6)));
}

function toLabel(quantity: number, unit: Unit, name: string): string {
  const ingredient = name.toLocaleLowerCase('es');

  if (unit === Unit.UNIT) {
    return `${quantity} ${quantity === 1 ? 'unidad' : 'unidades'} de ${ingredient}`;
  }
  // A partir de 1.000 g o ml se muestra en kg o litros
  if (quantity >= 1000) {
    const big = unit === Unit.GRAMS ? 'kg' : 'L';
    return `${formatDecimal(quantity / 1000)} ${big} de ${ingredient}`;
  }
  return `${quantity} ${unit} de ${ingredient}`;
}

// Hasta 2 decimales (redondeando hacia arriba, para no mostrar menos de lo que hay que comprar)
// y con coma, como se escribe en español: 1.25 -> "1,25"
function formatDecimal(value: number): string {
  const roundedUp = Math.ceil(Number((value * 100).toFixed(6))) / 100;
  return String(roundedUp).replace('.', ',');
}
