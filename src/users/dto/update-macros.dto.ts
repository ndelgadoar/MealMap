import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

// Metas diarias de macros. Todos los campos son opcionales (PATCH parcial).
export class UpdateMacrosDto {
  @ApiPropertyOptional({ example: 2000, description: 'Calorías por día (kcal)' })
  @IsOptional()
  @IsInt()
  @Min(500)
  @Max(10000)
  dailyCalories?: number;

  @ApiPropertyOptional({ example: 150, description: 'Proteína por día (g)' })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(1000)
  dailyProtein?: number;

  @ApiPropertyOptional({ example: 200, description: 'Carbohidratos por día (g)' })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(1500)
  dailyCarbs?: number;

  @ApiPropertyOptional({ example: 60, description: 'Grasas por día (g)' })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(500)
  dailyFat?: number;
}
