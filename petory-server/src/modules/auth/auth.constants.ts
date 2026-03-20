export const AUTH_WEB_CLIENT_TYPE = 'web';
export const AUTH_MINI_PROGRAM_CLIENT_TYPE = 'mini-program';
export const AUTH_REQUEST_CONTEXT_KEY = 'authContext';
export const AUTH_CLIENT_TYPE_HEADER = 'x-client-type';
export const AUTH_DEV_REGISTER_SECRET_HEADER = 'x-dev-register-secret';
export const SUPPORTED_AUTH_CLIENT_TYPES = [
  AUTH_WEB_CLIENT_TYPE,
  AUTH_MINI_PROGRAM_CLIENT_TYPE,
] as const;
