import { ApiProperty } from '@nestjs/swagger';

// Metas diarias del usuario; son null mientras no las configure
export class MacrosResponseDto {
  @ApiProperty({ type: Number, nullable: true, example: 2000, description: 'Calorías por día (kcal)' })
  dailyCalories: number | null;

  @ApiProperty({ type: Number, nullable: true, example: 150, description: 'Proteína por día (g)' })
  dailyProtein: number | null;

  @ApiProperty({ type: Number, nullable: true, example: 200, description: 'Carbohidratos por día (g)' })
  dailyCarbs: number | null;

  @ApiProperty({ type: Number, nullable: true, example: 67, description: 'Grasas por día (g)' })
  dailyFat: number | null;
}
