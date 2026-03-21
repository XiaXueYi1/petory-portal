import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  Matches,
} from 'class-validator';

export class DevRegisterDto {
  @IsString()
  @IsNotEmpty()
  @Length(11, 11)
  @Matches(/^1[3-9]\d{9}$/)
  declare phone: string;

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
