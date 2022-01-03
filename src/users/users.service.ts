import { BadRequestException, Injectable } from '@nestjs/common';
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

  async create(data: UserCreateDto): Promise<UserEntity> {
    const userExists = await this.findByEmail(data.email);
    if (userExists) {
      throw new BadRequestException('User already exists');
    }
    const user: UserEntity = this.usersRepository.create(data);
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

  async update(id: number, data: UserUpdateDto): Promise<UserEntity> {
    await this.usersRepository.update({ id }, data);
    return await this.usersRepository.findOne({ id });
  }

  async remove(id: number): Promise<{ deleted: boolean }> {
    await this.usersRepository.delete({ id });
    return { deleted: true };
  }
}
