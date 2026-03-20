import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';

export class DevRegisterDto {
  @IsString()
  @IsNotEmpty()
  @Length(3, 64)
  declare username: string;

  @IsString()
  @IsNotEmpty()
  @Length(6, 128)
  declare password: string;

  @IsOptional()
  @IsString()
  @Length(1, 64)
  declare nickname?: string;

  @IsOptional()
  @IsEmail()
  @Length(5, 128)
  declare email?: string;
}
