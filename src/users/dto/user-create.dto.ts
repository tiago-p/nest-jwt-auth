import { IsEmail, IsEnum, IsOptional, Length } from 'class-validator';
import { GenderEnum } from '../enum/gender.enum';

export class UserCreateDto {
  @Length(5, 10)
  password: string;

  @IsEmail()
  @Length(5, 100)
  email: string;

  @IsEnum(GenderEnum)
  gender: GenderEnum;

  @Length(2, 100)
  lastName: string;

  @Length(2, 100)
  firstName: string;

  @Length(2, 100)
  @IsOptional()
  company?: string | null;
}
