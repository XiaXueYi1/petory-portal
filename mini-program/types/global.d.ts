/// <reference types="@tarojs/taro" />

declare module '*.png';
declare module '*.gif';
declare module '*.jpg';
declare module '*.jpeg';
declare module '*.svg';
declare module '*.css';
declare module '*.less';
declare module '*.scss';
declare module '*.sass';
declare module '*.styl';

declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: 'development' | 'production'
    TARO_ENV: 'weapp' | 'swan' | 'alipay' | 'h5' | 'rn' | 'tt' | 'qq' | 'jd' | 'harmony' | 'jdrn'
    TARO_APP_ID: string
    MINI_API_BASE_URL: string
    MINI_AUTH_TOKEN_KEY: string
    MINI_AUTH_HEADER_NAME: string
    MINI_AUTH_HEADER_PREFIX: string
    MINI_REQUEST_TIMEOUT: string
    MINI_LOGIN_STRATEGY: string
    MINI_WECHAT_PHONE_LOGIN_STATUS: string
  }
}
