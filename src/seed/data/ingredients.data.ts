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
  { name: 'Banano', caloriesPer100g: 89, proteinPer100g: 1.1, carbsPer100g: 22.8, fatPer100g: 0.3 },
  { name: 'Leche', caloriesPer100g: 42, proteinPer100g: 3.4, carbsPer100g: 5, fatPer100g: 1 },
  { name: 'Yogur griego natural', caloriesPer100g: 59, proteinPer100g: 10, carbsPer100g: 3.6, fatPer100g: 0.4 },
  { name: 'Queso fresco', caloriesPer100g: 270, proteinPer100g: 18, carbsPer100g: 3, fatPer100g: 20 },
  { name: 'Aceite de oliva', caloriesPer100g: 884, proteinPer100g: 0, carbsPer100g: 0, fatPer100g: 100 },
  { name: 'Almendras', caloriesPer100g: 579, proteinPer100g: 21, carbsPer100g: 22, fatPer100g: 50 },
  { name: 'Mantequilla de maní', caloriesPer100g: 588, proteinPer100g: 25, carbsPer100g: 20, fatPer100g: 50 },

  // Proteínas
  { name: 'Muslo de pollo (sin piel)', caloriesPer100g: 121, proteinPer100g: 19.7, carbsPer100g: 0, fatPer100g: 4.1 },
  { name: 'Sobrebarriga de res', caloriesPer100g: 155, proteinPer100g: 21, carbsPer100g: 0, fatPer100g: 7.4 },
  { name: 'Lomo de cerdo', caloriesPer100g: 143, proteinPer100g: 21, carbsPer100g: 0, fatPer100g: 5.7 },
  { name: 'Tilapia', caloriesPer100g: 96, proteinPer100g: 20, carbsPer100g: 0, fatPer100g: 1.7 },
  { name: 'Camarón', caloriesPer100g: 85, proteinPer100g: 20, carbsPer100g: 0.2, fatPer100g: 0.5 },
  { name: 'Queso mozzarella', caloriesPer100g: 254, proteinPer100g: 24, carbsPer100g: 2.8, fatPer100g: 16 },
  { name: 'Yogur natural', caloriesPer100g: 61, proteinPer100g: 3.5, carbsPer100g: 4.7, fatPer100g: 3.3 },
  { name: 'Frijol rojo', caloriesPer100g: 333, proteinPer100g: 23.6, carbsPer100g: 60, fatPer100g: 0.8 },
  { name: 'Arveja verde', caloriesPer100g: 81, proteinPer100g: 5.4, carbsPer100g: 14, fatPer100g: 0.4 },

  // Carbohidratos y granos
  { name: 'Arroz integral', caloriesPer100g: 370, proteinPer100g: 7.9, carbsPer100g: 77, fatPer100g: 2.9 },
  { name: 'Quinua', caloriesPer100g: 368, proteinPer100g: 14.1, carbsPer100g: 64.2, fatPer100g: 6.1 },
  { name: 'Harina de maíz precocida', caloriesPer100g: 350, proteinPer100g: 7, carbsPer100g: 77, fatPer100g: 1.5 },
  { name: 'Arepa de maíz', caloriesPer100g: 210, proteinPer100g: 4.5, carbsPer100g: 44, fatPer100g: 1.5, gramsPerUnit: 80 },
  { name: 'Tortilla de trigo', caloriesPer100g: 310, proteinPer100g: 8.3, carbsPer100g: 52, fatPer100g: 7.5, gramsPerUnit: 45 },
  { name: 'Yuca', caloriesPer100g: 160, proteinPer100g: 1.4, carbsPer100g: 38, fatPer100g: 0.3 },
  { name: 'Arracacha', caloriesPer100g: 100, proteinPer100g: 0.9, carbsPer100g: 24, fatPer100g: 0.2 },
  { name: 'Papa criolla', caloriesPer100g: 75, proteinPer100g: 2, carbsPer100g: 17, fatPer100g: 0.3 },
  { name: 'Plátano maduro', caloriesPer100g: 122, proteinPer100g: 1.3, carbsPer100g: 32, fatPer100g: 0.4 },
  { name: 'Plátano verde', caloriesPer100g: 122, proteinPer100g: 1.3, carbsPer100g: 32, fatPer100g: 0.4 },
  { name: 'Maíz dulce', caloriesPer100g: 86, proteinPer100g: 3.3, carbsPer100g: 19, fatPer100g: 1.4 },
  { name: 'Granola', caloriesPer100g: 450, proteinPer100g: 10, carbsPer100g: 64, fatPer100g: 18 },

  // Verduras y hierbas
  { name: 'Ahuyama', caloriesPer100g: 26, proteinPer100g: 1, carbsPer100g: 6.5, fatPer100g: 0.1 },
  { name: 'Habichuela', caloriesPer100g: 31, proteinPer100g: 1.8, carbsPer100g: 7, fatPer100g: 0.2 },
  { name: 'Champiñones', caloriesPer100g: 22, proteinPer100g: 3.1, carbsPer100g: 3.3, fatPer100g: 0.3 },
  { name: 'Lechuga', caloriesPer100g: 15, proteinPer100g: 1.4, carbsPer100g: 2.9, fatPer100g: 0.2 },
  { name: 'Pepino', caloriesPer100g: 15, proteinPer100g: 0.7, carbsPer100g: 3.6, fatPer100g: 0.1 },
  { name: 'Calabacín', caloriesPer100g: 17, proteinPer100g: 1.2, carbsPer100g: 3.1, fatPer100g: 0.3 },
  { name: 'Coliflor', caloriesPer100g: 25, proteinPer100g: 1.9, carbsPer100g: 5, fatPer100g: 0.3 },
  { name: 'Remolacha', caloriesPer100g: 43, proteinPer100g: 1.6, carbsPer100g: 9.6, fatPer100g: 0.2 },
  { name: 'Repollo', caloriesPer100g: 25, proteinPer100g: 1.3, carbsPer100g: 5.8, fatPer100g: 0.1 },
  { name: 'Cebolla larga', caloriesPer100g: 32, proteinPer100g: 1.8, carbsPer100g: 7.3, fatPer100g: 0.2 },
  { name: 'Cilantro', caloriesPer100g: 23, proteinPer100g: 2.1, carbsPer100g: 3.7, fatPer100g: 0.5 },
  { name: 'Limón', caloriesPer100g: 29, proteinPer100g: 1.1, carbsPer100g: 9.3, fatPer100g: 0.3, gramsPerUnit: 50 },

  // Frutas
  { name: 'Mango', caloriesPer100g: 60, proteinPer100g: 0.8, carbsPer100g: 15, fatPer100g: 0.4 },
  { name: 'Papaya', caloriesPer100g: 43, proteinPer100g: 0.5, carbsPer100g: 11, fatPer100g: 0.3 },
  { name: 'Piña', caloriesPer100g: 50, proteinPer100g: 0.5, carbsPer100g: 13, fatPer100g: 0.1 },
  { name: 'Fresa', caloriesPer100g: 32, proteinPer100g: 0.7, carbsPer100g: 7.7, fatPer100g: 0.3 },
  { name: 'Mora', caloriesPer100g: 43, proteinPer100g: 1.4, carbsPer100g: 10, fatPer100g: 0.5 },
  { name: 'Manzana', caloriesPer100g: 52, proteinPer100g: 0.3, carbsPer100g: 14, fatPer100g: 0.2 },

  // Grasas, frutos secos y otros
  { name: 'Aceite vegetal', caloriesPer100g: 884, proteinPer100g: 0, carbsPer100g: 0, fatPer100g: 100 },
  { name: 'Mantequilla', caloriesPer100g: 717, proteinPer100g: 0.9, carbsPer100g: 0.1, fatPer100g: 81 },
  { name: 'Maní', caloriesPer100g: 567, proteinPer100g: 26, carbsPer100g: 16, fatPer100g: 49 },
  { name: 'Nueces', caloriesPer100g: 654, proteinPer100g: 15, carbsPer100g: 14, fatPer100g: 65 },
  { name: 'Chía', caloriesPer100g: 486, proteinPer100g: 16.5, carbsPer100g: 42, fatPer100g: 31 },
  { name: 'Panela', caloriesPer100g: 380, proteinPer100g: 0.4, carbsPer100g: 96, fatPer100g: 0 },
  { name: 'Miel', caloriesPer100g: 304, proteinPer100g: 0.3, carbsPer100g: 82, fatPer100g: 0 },
  { name: 'Salsa de soya', caloriesPer100g: 53, proteinPer100g: 8, carbsPer100g: 4.9, fatPer100g: 0.6 },
];
