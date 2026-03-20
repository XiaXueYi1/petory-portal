import { IsNotEmpty, IsString, Length } from 'class-validator';

export class WechatMiniLoginDto {
  @IsString()
  @IsNotEmpty()
  @Length(1, 512)
  declare code: string;

  @IsString()
  @IsNotEmpty()
  @Length(1, 512)
  declare phoneCode: string;
}
