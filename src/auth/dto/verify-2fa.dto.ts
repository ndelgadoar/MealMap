import { IsString, Matches } from 'class-validator';

export class Verify2faDto {
  @IsString()
  @Matches(/^\d{6}$/, { message: 'code debe ser un número de 6 dígitos' })
  code: string;
}
