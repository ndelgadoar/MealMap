import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UpdateMacrosDto } from './dto/update-macros.dto.js';
import { User } from './entities/user.entity.js';
import { UsersService } from './users.service.js';

describe('UsersService.updateMacros', () => {
  let service: UsersService;

  const usersRepository = {
    update: vi.fn(),
    findOneByOrFail: vi.fn(),
  };

  const storedUser = {
    id: 'user-1',
    email: 'ana@example.com',
    dailyCalories: 2000,
    dailyProtein: 150,
    dailyCarbs: null,
    dailyFat: null,
  };

  // Como llega del ValidationPipe: las propiedades no enviadas existen con valor undefined
  const buildDto = (values: Partial<UpdateMacrosDto>): UpdateMacrosDto =>
    Object.assign(new UpdateMacrosDto(), {
      dailyCalories: undefined,
      dailyProtein: undefined,
      dailyCarbs: undefined,
      dailyFat: undefined,
      ...values,
    });

  beforeEach(async () => {
    vi.resetAllMocks();
    usersRepository.findOneByOrFail.mockResolvedValue(storedUser);

    const moduleRef = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getRepositoryToken(User), useValue: usersRepository },
      ],
    }).compile();

    service = moduleRef.get(UsersService);
  });

  it('actualiza solo las metas enviadas', async () => {
    await service.updateMacros('user-1', buildDto({ dailyCalories: 2000, dailyProtein: 150 }));

    expect(usersRepository.update).toHaveBeenCalledWith('user-1', {
      dailyCalories: 2000,
      dailyProtein: 150,
    });
  });

  it('no toca la base si no se envió ninguna meta', async () => {
    await service.updateMacros('user-1', buildDto({}));

    expect(usersRepository.update).not.toHaveBeenCalled();
  });

  it('guarda una meta en 0 (no la confunde con "no enviada")', async () => {
    await service.updateMacros('user-1', buildDto({ dailyFat: 0 }));

    expect(usersRepository.update).toHaveBeenCalledWith('user-1', { dailyFat: 0 });
  });

  it('devuelve las 4 metas, con null en las que aún no están configuradas', async () => {
    const result = await service.updateMacros('user-1', buildDto({ dailyCalories: 2000 }));

    expect(result).toEqual({
      dailyCalories: 2000,
      dailyProtein: 150,
      dailyCarbs: null,
      dailyFat: null,
    });
  });

  it('no expone otros datos del usuario como el email', async () => {
    const result = await service.updateMacros('user-1', buildDto({ dailyCalories: 2000 }));

    expect(result).not.toHaveProperty('email');
    expect(result).not.toHaveProperty('id');
  });
});
