import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserCreateDto } from './dto/user-create.dto';
import { UserUpdateDto } from './dto/user-update.dto';
import { UserEntity } from './entity/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private usersRepository: Repository<UserEntity>,
  ) {}

  async create(userInfo: UserCreateDto): Promise<UserEntity> {
    const userExists = await this.findByEmail(userInfo.email);
    if (userExists) {
      throw new ConflictException('User already exists');
    }
    const user: UserEntity = this.usersRepository.create(userInfo);
    return await this.usersRepository.save(user);
  }

  async findAll(): Promise<UserEntity[]> {
    return await this.usersRepository.find();
  }

  async findByEmail(email: string): Promise<UserEntity> {
    return await this.usersRepository.findOne({
      where: {
        email,
      },
    });
  }

  async findOneById(id: number): Promise<UserEntity> {
    return await this.usersRepository.findOne({
      where: {
        id,
      },
    });
  }

  async update(id: number, userInfo: UserUpdateDto): Promise<UserEntity> {
    const userExists = await this.findByEmail(userInfo.email);
    if (userExists && id !== userExists.id) {
      throw new ConflictException('User email already exists');
    }
    await this.usersRepository.update({ id }, userInfo);
    return await this.usersRepository.findOne({ id });
  }

  async remove(id: number): Promise<{ deleted: boolean }> {
    await this.usersRepository.delete({ id });
    return { deleted: true };
  }
}
