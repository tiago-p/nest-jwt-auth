import { Expose, plainToClass } from 'class-transformer';
import { UserEntity } from '../entity/user.entity';
import { GenderEnum } from '../enum/gender.enum';

export class UserDto {
  @Expose()
  id: number;

  @Expose()
  email: string;

  @Expose()
  gender: GenderEnum;

  @Expose()
  lastName: string;

  @Expose()
  firstName: string;

  @Expose()
  company?: string;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  static toView(user: UserEntity): UserDto {
    return plainToClass(UserDto, user, {
      excludeExtraneousValues: true,
    });
  }
}
