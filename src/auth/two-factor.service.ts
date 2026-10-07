import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { generateSecret, generateURI, verify } from 'otplib';
import QRCode from 'qrcode';
import { UsersService } from '../users/users.service.js';

const ISSUER = 'MealMap';
// Tolerancia (en segundos) por si el reloj del celular está un poco desfasado
const CLOCK_TOLERANCE_SECONDS = 30;

@Injectable()
export class TwoFactorService {
  constructor(private readonly usersService: UsersService) {}

  // Paso 1: genera un secreto nuevo y el QR. El 2FA aún NO queda activo.
  async enable(userId: string) {
    const user = await this.usersService.findByIdWithTwoFASecret(userId);
    if (!user) throw new NotFoundException('Usuario no encontrado');
    if (user.twoFAEnabled) {
      throw new ConflictException('El 2FA ya está activo');
    }

    const secret = generateSecret();
    await this.usersService.saveTwoFASecret(user.id, secret);

    const otpauthUrl = generateURI({ issuer: ISSUER, label: user.email, secret });
    const qrCode = await QRCode.toDataURL(otpauthUrl);

    // secret se devuelve por si el usuario no puede escanear el QR y lo escribe a mano
    return { secret, otpauthUrl, qrCode };
  }

  // Paso 2: confirma con un código válido y activa el 2FA.
  async verifyAndActivate(userId: string, code: string): Promise<void> {
    const user = await this.usersService.findByIdWithTwoFASecret(userId);
    if (!user) throw new NotFoundException('Usuario no encontrado');
    if (user.twoFAEnabled) {
      throw new ConflictException('El 2FA ya está activo');
    }
    if (!user.twoFASecret) {
      throw new BadRequestException('Primero llama a POST /auth/2fa/enable');
    }

    if (!(await this.isCodeValid(user.twoFASecret, code))) {
      throw new BadRequestException('Código inválido');
    }
    await this.usersService.activateTwoFA(user.id);
  }

  async isCodeValid(secret: string, code: string): Promise<boolean> {
    const result = await verify({
      secret,
      token: code,
      epochTolerance: CLOCK_TOLERANCE_SECONDS,
    });
    return result.valid;
  }
}
