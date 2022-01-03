import { IsEmail, Length } from 'class-validator';

export class LoginRequestDto {
  @Length(5, 10)
  password: string;

  @IsEmail()
  @Length(5, 100)
  email: string;
}
