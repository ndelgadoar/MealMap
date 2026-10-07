import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'node:crypto';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity.js';
import { UsersService } from '../users/users.service.js';
import { LoginDto } from './dto/login.dto.js';
import { RegisterDto } from './dto/register.dto.js';
import { RevokedToken } from './entities/revoked-token.entity.js';
import { AuthenticatedUser } from './interfaces/jwt-payload.interface.js';

const BCRYPT_ROUNDS = 10;

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    @InjectRepository(RevokedToken)
    private readonly revokedTokensRepository: Repository<RevokedToken>,
  ) {}

  async register(dto: RegisterDto): Promise<Pick<User, 'id' | 'email' | 'role'>> {
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException('El email ya está registrado');
    }

    const password = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);
    const user = await this.usersService.create({ email: dto.email, password });

    return { id: user.id, email: user.email, role: user.role };
  }

  async login(dto: LoginDto): Promise<{ accessToken: string }> {
    const user = await this.usersService.findByEmailWithPassword(dto.email);
    // Mismo mensaje si el email no existe o la contraseña es incorrecta
    const valid = user && (await bcrypt.compare(dto.password, user.password));
    if (!user || !valid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const payload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = await this.jwtService.signAsync(payload, {
      jwtid: randomUUID(),
    });
    return { accessToken };
  }

  async logout(user: AuthenticatedUser): Promise<void> {
    await this.revokedTokensRepository.save({
      jti: user.jti,
      expiresAt: new Date(user.exp * 1000),
    });
  }

  isTokenRevoked(jti: string): Promise<boolean> {
    return this.revokedTokensRepository.existsBy({ jti });
  }
}
