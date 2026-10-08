import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MacrosResponseDto } from './dto/macros-response.dto.js';
import { UpdateMacrosDto } from './dto/update-macros.dto.js';
import { User } from './entities/user.entity.js';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly usersRepository: Repository<User>,
  ) {}

  // Incluye password (que por defecto no se selecciona) para poder verificar el login
  findByEmailWithPassword(email: string): Promise<User | null> {
    return this.usersRepository
      .createQueryBuilder('user')
      .addSelect(['user.password', 'user.twoFASecret'])
      .where('user.email = :email', { email })
      .getOne();
  }

  // Incluye twoFASecret (que por defecto no se selecciona)
  findByIdWithTwoFASecret(id: string): Promise<User | null> {
    return this.usersRepository
      .createQueryBuilder('user')
      .addSelect('user.twoFASecret')
      .where('user.id = :id', { id })
      .getOne();
  }

  async saveTwoFASecret(id: string, secret: string): Promise<void> {
    await this.usersRepository.update(id, { twoFASecret: secret });
  }

  async activateTwoFA(id: string): Promise<void> {
    await this.usersRepository.update(id, { twoFAEnabled: true });
  }

  // Actualiza solo las metas enviadas y devuelve las cuatro metas resultantes
  async updateMacros(id: string, dto: UpdateMacrosDto): Promise<MacrosResponseDto> {
    // El DTO puede traer las propiedades como undefined; solo se actualizan las enviadas
    const changes = Object.fromEntries(
      Object.entries(dto).filter(([, value]) => value !== undefined),
    );
    if (Object.keys(changes).length > 0) {
      await this.usersRepository.update(id, changes);
    }
    const user = await this.usersRepository.findOneByOrFail({ id });
    return {
      dailyCalories: user.dailyCalories,
      dailyProtein: user.dailyProtein,
      dailyCarbs: user.dailyCarbs,
      dailyFat: user.dailyFat,
    };
  }

  findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOneBy({ email });
  }

  findById(id: string): Promise<User | null> {
    return this.usersRepository.findOneBy({ id });
  }

  create(data: Pick<User, 'email' | 'password'>): Promise<User> {
    return this.usersRepository.save(this.usersRepository.create(data));
  }
}
