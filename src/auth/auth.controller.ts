import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AuthService } from './auth.service.js';
import { CurrentUser } from './decorators/current-user.decorator.js';
import { LoginDto } from './dto/login.dto.js';
import { RegisterDto } from './dto/register.dto.js';
import { Verify2faDto } from './dto/verify-2fa.dto.js';
import { TwoFactorService } from './two-factor.service.js';
import { JwtAuthGuard } from './guards/jwt-auth.guard.js';
import type { AuthenticatedUser } from './interfaces/jwt-payload.interface.js';

const INVALID_SESSION = 'Falta el token, es inválido, expiró o la sesión fue cerrada';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly twoFactorService: TwoFactorService,
  ) {}

  @Post('register')
  @ApiOperation({
    summary: 'Registrar un usuario nuevo',
    description: 'Crea el usuario con rol USER. El email se guarda en minúsculas y la contraseña (8 a 72 caracteres) se almacena cifrada.',
  })
  @ApiCreatedResponse({
    description: 'Usuario creado (nunca se devuelve la contraseña)',
    schema: { example: { id: '4fd93762-1c76-4854-918b-26dc6659de5e', email: 'ana@example.com', role: 'USER' } },
  })
  @ApiBadRequestResponse({ description: 'Email inválido, contraseña muy corta o campos que no existen (por ejemplo "role")' })
  @ApiConflictResponse({ description: 'El email ya está registrado' })
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Iniciar sesión',
    description: 'Devuelve un JWT para usar como Bearer token. Si el usuario tiene 2FA activo, también hay que enviar `totpCode` (6 dígitos de Google Authenticator).',
  })
  @ApiOkResponse({
    description: 'Sesión iniciada',
    schema: { example: { accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' } },
  })
  @ApiBadRequestResponse({ description: 'Datos con formato inválido' })
  @ApiUnauthorizedResponse({
    description: 'Credenciales inválidas (mismo mensaje si falla el email o la contraseña), falta el código 2FA o el código 2FA es incorrecto',
  })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('2fa/enable')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Habilitar 2FA (paso 1)',
    description: 'Genera un secreto y un código QR para escanear con Google Authenticator. El 2FA todavía no queda activo: hay que confirmarlo con POST /auth/2fa/verify.',
  })
  @ApiCreatedResponse({
    description: 'Secreto y QR generados',
    schema: {
      example: {
        secret: 'JBSWY3DPEHPK3PXP',
        otpauthUrl: 'otpauth://totp/MealMap:ana@example.com?secret=JBSWY3DPEHPK3PXP&issuer=MealMap',
        qrCode: 'data:image/png;base64,iVBORw0KGgo...',
      },
    },
  })
  @ApiUnauthorizedResponse({ description: INVALID_SESSION })
  @ApiConflictResponse({ description: 'El 2FA ya está activo' })
  enable2fa(@CurrentUser() user: AuthenticatedUser) {
    return this.twoFactorService.enable(user.id);
  }

  @Post('2fa/verify')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Verificar el código y activar 2FA (paso 2)',
    description: 'Confirma con un código de 6 dígitos válido. Desde ese momento el login exige el código.',
  })
  @ApiOkResponse({ description: '2FA activado', schema: { example: { message: '2FA activado' } } })
  @ApiBadRequestResponse({ description: 'Código con formato inválido, código incorrecto o todavía no se llamó a POST /auth/2fa/enable' })
  @ApiUnauthorizedResponse({ description: INVALID_SESSION })
  @ApiConflictResponse({ description: 'El 2FA ya está activo' })
  async verify2fa(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: Verify2faDto,
  ) {
    await this.twoFactorService.verifyAndActivate(user.id, dto.code);
    return { message: '2FA activado' };
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Cerrar sesión',
    description: 'Invalida el token actual: no se podrá volver a usar aunque no haya expirado.',
  })
  @ApiNoContentResponse({ description: 'Sesión cerrada (sin contenido)' })
  @ApiUnauthorizedResponse({ description: INVALID_SESSION })
  logout(@CurrentUser() user: AuthenticatedUser) {
    return this.authService.logout(user);
  }
}
