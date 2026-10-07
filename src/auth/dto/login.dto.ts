import { Transform } from 'class-transformer';
import { IsEmail, IsOptional, IsString, Matches } from 'class-validator';

export class LoginDto {
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @IsEmail()
  email: string;

  @IsString()
  password: string;

  // Código de Google Authenticator; obligatorio solo si el usuario tiene 2FA activo
  @IsOptional()
  @Matches(/^\d{6}$/, { message: 'totpCode debe ser un número de 6 dígitos' })
  totpCode?: string;
}
