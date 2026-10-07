import { Unit } from '../../recipes/enums/unit.enum.js';

export interface RecipeSeed {
  name: string;
  description: string;
  category: string;
  prepTimeMinutes: number;
  // Porciones que rinde la receta completa; las cantidades son para la receta completa
  servingSize: number;
  ingredients: { ingredient: string; quantity: number; unit: Unit }[];
}

const g = (ingredient: string, quantity: number) => ({ ingredient, quantity, unit: Unit.GRAMS });
const ml = (ingredient: string, quantity: number) => ({ ingredient, quantity, unit: Unit.MILLILITERS });
const u = (ingredient: string, quantity: number) => ({ ingredient, quantity, unit: Unit.UNIT });

export const RECIPES: RecipeSeed[] = [
  {
    name: 'Avena con banano y mantequilla de maní',
    description: 'Avena cocida en leche con banano en rodajas y una cucharada de mantequilla de maní.',
    category: 'Desayuno',
    prepTimeMinutes: 8,
    servingSize: 1,
    ingredients: [g('Avena', 60), ml('Leche', 250), g('Banano', 120), g('Mantequilla de maní', 15)],
  },
  {
    name: 'Huevos revueltos con espinaca y pan integral',
    description: 'Huevos revueltos con espinaca salteada, acompañados de pan integral.',
    category: 'Desayuno',
    prepTimeMinutes: 10,
    servingSize: 1,
    ingredients: [u('Huevo', 3), g('Espinaca', 50), g('Pan integral', 60), ml('Aceite de oliva', 5)],
  },
  {
    name: 'Yogur griego con avena y almendras',
    description: 'Yogur griego natural con avena cruda y almendras picadas.',
    category: 'Snack',
    prepTimeMinutes: 3,
    servingSize: 1,
    ingredients: [g('Yogur griego natural', 200), g('Avena', 30), g('Almendras', 15)],
  },
  {
    name: 'Tostada con mantequilla de maní y banano',
    description: 'Pan integral tostado con mantequilla de maní y banano en rodajas.',
    category: 'Snack',
    prepTimeMinutes: 5,
    servingSize: 1,
    ingredients: [g('Pan integral', 40), g('Mantequilla de maní', 20), g('Banano', 80)],
  },
  {
    name: 'Pollo con arroz y brócoli',
    description: 'Pechuga de pollo a la plancha con arroz blanco y brócoli al vapor.',
    category: 'Alto en proteína',
    prepTimeMinutes: 30,
    servingSize: 2,
    ingredients: [
      g('Pechuga de pollo', 400),
      g('Arroz blanco', 150),
      g('Brócoli', 200),
      ml('Aceite de oliva', 10),
      g('Ajo', 5),
    ],
  },
  {
    name: 'Pasta con carne molida y tomate',
    description: 'Pasta con salsa de tomate casera y carne molida magra.',
    category: 'Alto en proteína',
    prepTimeMinutes: 35,
    servingSize: 3,
    ingredients: [
      g('Pasta', 240),
      g('Carne molida de res', 300),
      g('Tomate', 300),
      g('Cebolla', 80),
      g('Ajo', 5),
      ml('Aceite de oliva', 10),
    ],
  },
  {
    name: 'Salmón al horno con batata y brócoli',
    description: 'Filete de salmón horneado con batata asada y brócoli.',
    category: 'Alto en proteína',
    prepTimeMinutes: 35,
    servingSize: 2,
    ingredients: [g('Salmón', 300), g('Batata', 400), g('Brócoli', 200), ml('Aceite de oliva', 10)],
  },
  {
    name: 'Lentejas guisadas con verduras',
    description: 'Guiso de lentejas con papa, zanahoria, tomate y cebolla.',
    category: 'Vegetariano',
    prepTimeMinutes: 40,
    servingSize: 4,
    ingredients: [
      g('Lentejas', 300),
      g('Zanahoria', 150),
      g('Cebolla', 100),
      g('Tomate', 200),
      g('Papa', 200),
      g('Ajo', 10),
      ml('Aceite de oliva', 20),
    ],
  },
  {
    name: 'Bowl de arroz, frijoles y aguacate',
    description: 'Arroz con frijoles negros, aguacate, tomate y pimiento.',
    category: 'Vegetariano',
    prepTimeMinutes: 25,
    servingSize: 2,
    ingredients: [
      g('Arroz blanco', 150),
      g('Frijoles negros', 120),
      g('Aguacate', 120),
      g('Tomate', 150),
      g('Pimiento', 100),
      g('Cebolla', 40),
    ],
  },
  {
    name: 'Tofu salteado con verduras y arroz',
    description: 'Tofu firme salteado con brócoli, zanahoria y pimiento, servido con arroz.',
    category: 'Vegetariano',
    prepTimeMinutes: 20,
    servingSize: 2,
    ingredients: [
      g('Tofu firme', 300),
      g('Arroz blanco', 140),
      g('Brócoli', 150),
      g('Zanahoria', 100),
      g('Pimiento', 100),
      ml('Aceite de oliva', 10),
    ],
  },
  {
    name: 'Garbanzos con espinaca',
    description: 'Garbanzos guisados con espinaca, tomate y cebolla.',
    category: 'Vegetariano',
    prepTimeMinutes: 25,
    servingSize: 3,
    ingredients: [
      g('Garbanzos', 240),
      g('Espinaca', 200),
      g('Tomate', 200),
      g('Cebolla', 80),
      g('Ajo', 5),
      ml('Aceite de oliva', 15),
    ],
  },
  {
    name: 'Ensalada de atún con aguacate',
    description: 'Atún al agua con aguacate, tomate y cebolla.',
    category: 'Rápido',
    prepTimeMinutes: 10,
    servingSize: 1,
    ingredients: [
      g('Atún en lata (al agua)', 120),
      g('Aguacate', 80),
      g('Tomate', 100),
      g('Cebolla', 20),
      ml('Aceite de oliva', 5),
    ],
  },
  {
    name: 'Tortilla de papa y huevo',
    description: 'Tortilla española con papa y cebolla.',
    category: 'Rápido',
    prepTimeMinutes: 20,
    servingSize: 2,
    ingredients: [u('Huevo', 4), g('Papa', 300), g('Cebolla', 80), ml('Aceite de oliva', 15)],
  },
  {
    name: 'Sándwich de pollo y aguacate',
    description: 'Pan integral con pechuga de pollo, aguacate, tomate y queso fresco.',
    category: 'Rápido',
    prepTimeMinutes: 10,
    servingSize: 1,
    ingredients: [
      g('Pan integral', 80),
      g('Pechuga de pollo', 120),
      g('Aguacate', 50),
      g('Tomate', 50),
      g('Queso fresco', 30),
    ],
  },
];
