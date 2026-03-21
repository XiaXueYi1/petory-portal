import { IsNotEmpty, IsString, Length, Matches } from 'class-validator';

export class LoginDto {
  @IsString()
  @IsNotEmpty()
  @Length(11, 11)
  @Matches(/^1[3-9]\d{9}$/)
  declare phone: string;

  @IsString()
  @IsNotEmpty()
  @Length(1, 1024)
  declare password: string;
}
