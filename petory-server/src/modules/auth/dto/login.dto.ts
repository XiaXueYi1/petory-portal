export interface LoginDto {
  username?: string;
  password?: string;
  clientType?: 'web' | 'mini-program';
}
