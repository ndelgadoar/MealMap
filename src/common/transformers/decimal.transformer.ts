import { ValueTransformer } from 'typeorm';

// El driver pg devuelve las columnas numeric como string; esto las convierte a number.
export const decimalTransformer: ValueTransformer = {
  to: (value?: number | null) => value,
  from: (value?: string | null) => (value == null ? value : parseFloat(value)),
};
