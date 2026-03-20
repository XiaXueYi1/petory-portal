import { defineConfig, type UserConfigExport } from '@tarojs/cli'
import TsconfigPathsPlugin from 'tsconfig-paths-webpack-plugin'
import { loadMiniProgramEnv, toDefineConstantMap } from './env'
import devConfig from './dev'
import prodConfig from './prod'

// https://taro-docs.jd.com/docs/next/config#defineconfig-辅助函数
export default defineConfig<'webpack5'>(async (merge, { command, mode }) => {
  const loadedEnv = loadMiniProgramEnv(mode)
  const runtimeEnv = {
    TARO_APP_ID: process.env.TARO_APP_ID ?? loadedEnv.TARO_APP_ID ?? '',
    MINI_API_BASE_URL: process.env.MINI_API_BASE_URL ?? loadedEnv.MINI_API_BASE_URL ?? '',
    MINI_AUTH_TOKEN_KEY: process.env.MINI_AUTH_TOKEN_KEY ?? loadedEnv.MINI_AUTH_TOKEN_KEY ?? '',
    MINI_AUTH_HEADER_NAME: process.env.MINI_AUTH_HEADER_NAME ?? loadedEnv.MINI_AUTH_HEADER_NAME ?? '',
    MINI_AUTH_HEADER_PREFIX: process.env.MINI_AUTH_HEADER_PREFIX ?? loadedEnv.MINI_AUTH_HEADER_PREFIX ?? '',
    MINI_REQUEST_TIMEOUT: process.env.MINI_REQUEST_TIMEOUT ?? loadedEnv.MINI_REQUEST_TIMEOUT ?? '',
    MINI_LOGIN_STRATEGY: process.env.MINI_LOGIN_STRATEGY ?? loadedEnv.MINI_LOGIN_STRATEGY ?? '',
    MINI_WECHAT_PHONE_LOGIN_STATUS: process.env.MINI_WECHAT_PHONE_LOGIN_STATUS ?? loadedEnv.MINI_WECHAT_PHONE_LOGIN_STATUS ?? ''
  }

  const baseConfig: UserConfigExport<'webpack5'> = {
    projectName: 'mini-program',
    date: '2026-3-20',
    designWidth: 750,
    deviceRatio: {
      640: 2.34 / 2,
      750: 1,
      375: 2,
      828: 1.81 / 2
    },
    sourceRoot: 'src',
    outputRoot: 'dist',
    plugins: [
      "@tarojs/plugin-generator",
      "@tarojs/plugin-http"
    ],
    defineConstants: {
      ...toDefineConstantMap(runtimeEnv)
    },
    copy: {
      patterns: [
      ],
      options: {
      }
    },
    framework: 'react',
    compiler: 'webpack5',
    cache: {
      enable: false // Webpack 持久化缓存配置，建议开启。默认配置请参考：https://docs.taro.zone/docs/config-detail#cache
    },
    mini: {
      postcss: {
        pxtransform: {
          enable: true,
          config: {

          }
        },
        cssModules: {
          enable: false, // 默认为 false，如需使用 css modules 功能，则设为 true
          config: {
            namingPattern: 'module', // 转换模式，取值为 global/module
            generateScopedName: '[name]__[local]___[hash:base64:5]'
          }
        }
      },
      webpackChain(chain) {
        chain.resolve.plugin('tsconfig-paths').use(TsconfigPathsPlugin)
      }
    },
    h5: {
      publicPath: '/',
      staticDirectory: 'static',
      output: {
        filename: 'js/[name].[hash:8].js',
        chunkFilename: 'js/[name].[chunkhash:8].js'
      },
      miniCssExtractPluginOption: {
        ignoreOrder: true,
        filename: 'css/[name].[hash].css',
        chunkFilename: 'css/[name].[chunkhash].css'
      },
      postcss: {
        autoprefixer: {
          enable: true,
          config: {}
        },
        cssModules: {
          enable: false, // 默认为 false，如需使用 css modules 功能，则设为 true
          config: {
            namingPattern: 'module', // 转换模式，取值为 global/module
            generateScopedName: '[name]__[local]___[hash:base64:5]'
          }
        }
      },
      webpackChain(chain) {
        chain.resolve.plugin('tsconfig-paths').use(TsconfigPathsPlugin)
      }
    },
    rn: {
      appName: 'taroDemo',
      postcss: {
        cssModules: {
          enable: false, // 默认为 false，如需使用 css modules 功能，则设为 true
        }
      }
    }
  }

  process.env.BROWSERSLIST_ENV = process.env.NODE_ENV

  if (process.env.NODE_ENV === 'development') {
    // 本地开发构建配置（不混淆压缩）
    return merge({}, baseConfig, devConfig)
  }
  // 生产构建配置（默认开启压缩混淆等）
  return merge({}, baseConfig, prodConfig)
})
