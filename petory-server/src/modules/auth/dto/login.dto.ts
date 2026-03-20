import { IsNotEmpty, IsString, Length } from 'class-validator';

export class LoginDto {
  @IsString()
  @IsNotEmpty()
  @Length(3, 64)
  declare username: string;

  @IsString()
  @IsNotEmpty()
  @Length(6, 128)
  declare password: string;
}
