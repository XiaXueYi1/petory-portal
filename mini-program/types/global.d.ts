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
    TARO_APP_API_BASE_URL: string
    TARO_APP_AUTH_TOKEN_KEY: string
    TARO_APP_AUTH_HEADER_NAME: string
    TARO_APP_AUTH_HEADER_PREFIX: string
    TARO_APP_REQUEST_TIMEOUT: string
    TARO_APP_LOGIN_STRATEGY: string
    TARO_APP_WECHAT_PHONE_LOGIN_STATUS: string
  }
}
