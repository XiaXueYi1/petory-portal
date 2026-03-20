import { IsOptional, IsString, Length } from 'class-validator';

export class RefreshDto {
  @IsOptional()
  @IsString()
  @Length(32, 4096)
  declare refreshToken?: string;
}
