import { IsEmail, Length } from 'class-validator';

export class LoginDto {
  @Length(5, 10)
  password: string;

  @IsEmail()
  @Length(5, 100)
  email: string;
}
