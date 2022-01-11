import { BadRequestException, ConflictException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { plainToClass } from 'class-transformer';
import { Repository } from 'typeorm';
import { UserCreateDto } from '../dto/user-create.dto';
import { UserUpdateDto } from '../dto/user-update.dto';
import { UserEntity } from '../entity/user.entity';
import { GenderEnum } from '../enum/gender.enum';
import { UsersService } from '../users.service';

describe('UsersService', () => {
  let service: UsersService;
  let repository: Repository<UserEntity>;

  let findUser: jest.Mock;

  beforeEach(async () => {
    findUser = jest.fn();
    const mockRepository = {
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      update: jest.fn(),
      findById: jest.fn(),
      findOne: findUser,
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(UserEntity),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repository = module.get(getRepositoryToken(UserEntity));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('User creation', () => {
    let mockUser: UserCreateDto;
    beforeEach(() => {
      mockUser = {
        email: 'jonh.doe@test.com',
        gender: GenderEnum.M,
        password: 'ssssdddd',
        lastName: 'Doe',
        firstName: 'Jonh',
        company: 'TEST',
      };
      findUser.mockResolvedValue(undefined);
    });

    it('should call UsersRepository create with correct values', async () => {
      const createSpy = jest.spyOn(repository, 'save');
      const userDto = plainToClass(UserCreateDto, mockUser);
      await service.create(userDto);
      expect(createSpy).toHaveBeenCalledWith(userDto);
    });

    it('should throw an error when contains invalid values', async () => {
      mockUser.firstName = '';
      await expect(
        service.create(plainToClass(UserCreateDto, mockUser)),
      ).rejects.toThrow(new BadRequestException('Data validation error'));
    });

    it('should throw an error when user email already exists', async () => {
      findUser.mockResolvedValue({ id: 2, email: 'test@test.com' });
      await expect(service.create(mockUser)).rejects.toThrow(
        new ConflictException('User already exists'),
      );
    });
  });

  describe('Update user', () => {
    let mockUser: UserUpdateDto;
    beforeEach(() => {
      mockUser = plainToClass(UserUpdateDto, {
        email: 'jonh.doe@test.com',
        gender: GenderEnum.M,
        lastName: 'Doe',
        firstName: 'Jonh',
        company: 'TEST',
      });
    });

    it('should throw an error when property should not exist', async () => {
      mockUser['password'] = 'eeee vv';
      await expect(service.update(5, mockUser)).rejects.toThrow(
        new BadRequestException('Data validation error'),
      );
    });

    it('should throw an error when contains invalid values', async () => {
      mockUser.lastName = 'v';
      await expect(service.update(5, mockUser)).rejects.toThrow(
        new BadRequestException('Data validation error'),
      );
    });

    it('should throw an error when another user exists with this email', async () => {
      findUser.mockResolvedValue({ id: 5, email: 'jonh.doe@test.com' });
      await expect(service.update(2, mockUser)).rejects.toThrow(
        new ConflictException('User email already exists'),
      );
    });

    it('should update user with values', async () => {
      findUser.mockResolvedValueOnce({ id: 2 });
      const updateSpy = jest.spyOn(repository, 'update');
      await service.update(2, mockUser);
      expect(updateSpy).toHaveBeenCalledWith(2, mockUser);
    });
  });

  describe('Find users', () => {
    it('should call UserRepository find', async () => {
      const findSpy = jest.spyOn(repository, 'find');
      await service.findAll();
      expect(findSpy).toHaveBeenCalled();
    });

    it('should call UsersRepository findOne with correct id', async () => {
      const findSpy = jest.spyOn(repository, 'findOne');
      await service.findOneById(5);
      expect(findSpy).toHaveBeenCalledWith(5);
    });

    it('should call UsersRepository findOne with correct email', async () => {
      const findSpy = jest.spyOn(repository, 'findOne');
      await service.findByEmail('jonh.doe@test.com');
      expect(findSpy).toHaveBeenCalledWith({
        where: { email: 'jonh.doe@test.com' },
      });
    });

    it('should throw if repository find throws', async () => {
      jest.spyOn(repository, 'find').mockRejectedValueOnce(new Error());
      await expect(service.findAll()).rejects.toThrow(new Error());
    });
  });
});
