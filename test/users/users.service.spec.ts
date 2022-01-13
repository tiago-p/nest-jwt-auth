import { BadRequestException, ConflictException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { plainToClass } from 'class-transformer';
import { Repository } from 'typeorm';
import { UserCreateDto } from '../../src/users/dto/user-create.dto';
import { UserUpdateDto } from '../../src/users/dto/user-update.dto';
import { UserEntity } from '../../src/users/entity/user.entity';
import { GenderEnum } from '../../src/users/enum/gender.enum';
import { UsersService } from '../../src/users/users.service';

describe('UsersService', () => {
  let service: UsersService;
  let repository: Repository<UserEntity>;
  let mockRepository;
  beforeEach(async () => {
    mockRepository = {
      save: jest.fn(),
      find: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      findOne: jest.fn(),
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
    });

    it('should call UsersRepository create with correct values', async () => {
      const createSpy = jest.spyOn(repository, 'create');
      const saveSpy = jest.spyOn(repository, 'save');
      const userDto = plainToClass(UserCreateDto, mockUser);
      await service.create(userDto);
      expect(createSpy).toHaveBeenCalledWith(userDto);
      expect(saveSpy).toHaveBeenCalled();
    });

    it('should throw an error when contains invalid values', async () => {
      mockUser.firstName = '';
      await expect(
        service.create(plainToClass(UserCreateDto, mockUser)),
      ).rejects.toThrow(new BadRequestException('Data validation error'));
    });

    it('should throw an error when user email already exists', async () => {
      mockRepository.findOne.mockResolvedValue({
        id: 2,
        email: 'test@test.com',
      });
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
      mockRepository.findOne.mockResolvedValue({
        id: 5,
        email: 'jonh.doe@test.com',
      });
      await expect(service.update(2, mockUser)).rejects.toThrow(
        new ConflictException('User email already exists'),
      );
    });

    it('should update user with new values', async () => {
      mockRepository.findOne.mockResolvedValueOnce({ id: 2 });
      const updateSpy = jest.spyOn(repository, 'update');
      await service.update(2, mockUser);
      expect(updateSpy).toHaveBeenCalledWith(2, mockUser);
    });
  });

  describe('Find users', () => {
    it('should call repository find', async () => {
      const findSpy = jest.spyOn(repository, 'find');
      await service.findAll();
      expect(findSpy).toHaveBeenCalled();
    });

    it('should call repository findOne with correct id', async () => {
      const findSpy = jest.spyOn(repository, 'findOne');
      await service.findOneById(5);
      expect(findSpy).toHaveBeenCalledWith(5);
    });

    it('should call repository findOne with correct email', async () => {
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

  describe('remove user', () => {
    it('Should call repository delete with correct id', async () => {
      const deleteSpy = jest.spyOn(repository, 'delete');
      await service.remove(2);
      expect(deleteSpy).toHaveBeenCalledWith(2);
    });
  });
});
