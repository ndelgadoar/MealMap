export interface IngredientSeed {
  name: string;
  caloriesPer100g: number;
  proteinPer100g: number;
  carbsPer100g: number;
  fatPer100g: number;
  // Peso aproximado de una unidad; solo se usa para calcular macros de recetas en 'unidad'
  gramsPerUnit?: number;
}

// Valores aproximados por 100 g (ingredientes en crudo, salvo indicación)
export const INGREDIENTS: IngredientSeed[] = [
  { name: 'Pechuga de pollo', caloriesPer100g: 165, proteinPer100g: 31, carbsPer100g: 0, fatPer100g: 3.6 },
  { name: 'Carne molida de res', caloriesPer100g: 176, proteinPer100g: 20, carbsPer100g: 0, fatPer100g: 10 },
  { name: 'Salmón', caloriesPer100g: 208, proteinPer100g: 20, carbsPer100g: 0, fatPer100g: 13 },
  { name: 'Atún en lata (al agua)', caloriesPer100g: 116, proteinPer100g: 26, carbsPer100g: 0, fatPer100g: 1 },
  { name: 'Huevo', caloriesPer100g: 143, proteinPer100g: 12.6, carbsPer100g: 0.7, fatPer100g: 9.5, gramsPerUnit: 50 },
  { name: 'Tofu firme', caloriesPer100g: 144, proteinPer100g: 17, carbsPer100g: 3, fatPer100g: 9 },
  { name: 'Arroz blanco', caloriesPer100g: 365, proteinPer100g: 7.1, carbsPer100g: 80, fatPer100g: 0.7 },
  { name: 'Pasta', caloriesPer100g: 371, proteinPer100g: 13, carbsPer100g: 75, fatPer100g: 1.5 },
  { name: 'Avena', caloriesPer100g: 389, proteinPer100g: 16.9, carbsPer100g: 66.3, fatPer100g: 6.9 },
  { name: 'Pan integral', caloriesPer100g: 247, proteinPer100g: 13, carbsPer100g: 41, fatPer100g: 3.4 },
  { name: 'Lentejas', caloriesPer100g: 352, proteinPer100g: 24.6, carbsPer100g: 63.4, fatPer100g: 1.1 },
  { name: 'Frijoles negros', caloriesPer100g: 341, proteinPer100g: 21.6, carbsPer100g: 62.4, fatPer100g: 1.4 },
  { name: 'Garbanzos', caloriesPer100g: 364, proteinPer100g: 19, carbsPer100g: 61, fatPer100g: 6 },
  { name: 'Papa', caloriesPer100g: 77, proteinPer100g: 2, carbsPer100g: 17, fatPer100g: 0.1 },
  { name: 'Batata', caloriesPer100g: 86, proteinPer100g: 1.6, carbsPer100g: 20, fatPer100g: 0.1 },
  { name: 'Tomate', caloriesPer100g: 18, proteinPer100g: 0.9, carbsPer100g: 3.9, fatPer100g: 0.2 },
  { name: 'Cebolla', caloriesPer100g: 40, proteinPer100g: 1.1, carbsPer100g: 9.3, fatPer100g: 0.1 },
  { name: 'Ajo', caloriesPer100g: 149, proteinPer100g: 6.4, carbsPer100g: 33, fatPer100g: 0.5 },
  { name: 'Zanahoria', caloriesPer100g: 41, proteinPer100g: 0.9, carbsPer100g: 9.6, fatPer100g: 0.2 },
  { name: 'Brócoli', caloriesPer100g: 34, proteinPer100g: 2.8, carbsPer100g: 6.6, fatPer100g: 0.4 },
  { name: 'Espinaca', caloriesPer100g: 23, proteinPer100g: 2.9, carbsPer100g: 3.6, fatPer100g: 0.4 },
  { name: 'Pimiento', caloriesPer100g: 31, proteinPer100g: 1, carbsPer100g: 6, fatPer100g: 0.3 },
  { name: 'Aguacate', caloriesPer100g: 160, proteinPer100g: 2, carbsPer100g: 8.5, fatPer100g: 14.7 },
  { name: 'Plátano', caloriesPer100g: 89, proteinPer100g: 1.1, carbsPer100g: 22.8, fatPer100g: 0.3 },
  { name: 'Leche', caloriesPer100g: 42, proteinPer100g: 3.4, carbsPer100g: 5, fatPer100g: 1 },
  { name: 'Yogur griego natural', caloriesPer100g: 59, proteinPer100g: 10, carbsPer100g: 3.6, fatPer100g: 0.4 },
  { name: 'Queso fresco', caloriesPer100g: 270, proteinPer100g: 18, carbsPer100g: 3, fatPer100g: 20 },
  { name: 'Aceite de oliva', caloriesPer100g: 884, proteinPer100g: 0, carbsPer100g: 0, fatPer100g: 100 },
  { name: 'Almendras', caloriesPer100g: 579, proteinPer100g: 21, carbsPer100g: 22, fatPer100g: 50 },
  { name: 'Mantequilla de maní', caloriesPer100g: 588, proteinPer100g: 25, carbsPer100g: 20, fatPer100g: 50 },
];
