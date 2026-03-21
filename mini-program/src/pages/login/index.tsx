import { useState } from 'react'
import { Button, Text, View } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { miniEnv } from '@/shared/config/env'
import { miniHttp } from '@/shared/request'
import { loginWithWechatPhone } from '@/features/auth/api'
import type { MiniWechatPhoneLoginRequest } from '@/features/auth'
import './index.scss'

type LoginStage = 'idle' | 'loading-code' | 'ready' | 'submitting' | 'success' | 'error'

interface PhoneNumberEvent {
  detail?: {
    code?: string
    errMsg?: string
  }
}

export default function LoginPage() {
  const [stage, setStage] = useState<LoginStage>('idle')
  const [statusText, setStatusText] = useState('正在准备微信登录状态')
  const [phoneLoginHint, setPhoneLoginHint] = useState(
    '请点击按钮并授权手机号，当前只支持微信手机号一键登录。'
  )
  const [profileName, setProfileName] = useState('')

  const prepareLoginCode = async () => {
    try {
      setStage('loading-code')
      setStatusText('正在获取微信登录凭证')
      const result = await Taro.login()

      if (!result.code) {
        throw new Error('未获取到微信登录 code')
      }

      setStage('ready')
      setStatusText('微信登录凭证已准备完成')
      return result.code
    } catch (error) {
      console.error('prepareLoginCode failed', error)
      setStage('error')
      setStatusText('微信登录凭证获取失败，请稍后重试')
      return ''
    }
  }

  const handlePhoneLogin = async (event: PhoneNumberEvent) => {
    console.log('handlePhoneLogin event', event)
    const phoneCode = event.detail?.code || ''
    const phoneAuthMessage = event.detail?.errMsg || ''

    if (!phoneCode) {
      const denied =
        phoneAuthMessage.includes('deny') || phoneAuthMessage.includes('fail')

      setStage('error')
      setStatusText('未获取到手机号授权')
      setPhoneLoginHint(
        denied
          ? '请确认你已同意微信手机号授权，并在支持真实手机号能力的环境中测试。'
          : '请确认当前环境支持手机号授权，并重新触发一次微信手机号登录。'
      )

      Taro.showToast({
        title: '未获取手机号授权',
        icon: 'none'
      })
      return
    }

    const currentLoginCode = await prepareLoginCode()

    if (!currentLoginCode) {
      Taro.showToast({
        title: '请稍后重试',
        icon: 'none'
      })
      return
    }

    try {
      setStage('submitting')
      setStatusText('正在提交微信手机号一键登录')
      setPhoneLoginHint('正在与服务器完成手机号绑定与登录。')

      const payload: MiniWechatPhoneLoginRequest = {
        code: currentLoginCode,
        phoneCode
      }

      const response = await loginWithWechatPhone(payload)

      if (!response?.accessToken) {
        throw new Error('登录响应缺少 accessToken')
      }

      miniHttp.setToken(response.accessToken)
      setStage('success')
      setProfileName(
        response.profile?.user?.nickname ||
        response.profile?.user?.username ||
        'Petory 用户'
      )
      setStatusText('登录成功，已完成手机号一键登录')
      setPhoneLoginHint('当前版本只保留微信手机号一键登录入口。')

      Taro.showToast({
        title: '登录成功',
        icon: 'success'
      })
    } catch (error) {
      console.error('phone login failed', error)
      setStage('error')
      setStatusText('登录失败，请稍后重试')
      setPhoneLoginHint('请确认微信授权、AppID 配置以及后端服务是否可用。')
      Taro.showToast({
        title: '登录失败',
        icon: 'none'
      })
    }
  }

  const handleRetry = () => {
    void prepareLoginCode()
  }

  return (
    <View className='login-page'>
      <View className='login-page__orb login-page__orb--one' />
      <View className='login-page__orb login-page__orb--two' />

      <View className='login-page__hero'>
        <Text className='login-page__badge'>PETORY MINI</Text>
        <Text className='login-page__title'>微信手机号一键登录</Text>
        <Text className='login-page__subtitle'>
          当前只保留微信用户手机号一键登录入口。点击按钮后会先获取最新的微信登录凭证，再提交手机号授权完成登录。
        </Text>
      </View>

      <View className='login-page__panel'>
        <View className='login-page__stack'>
          <View className='login-page__summary'>
            <View className='login-page__summary-item'>
              <Text className='login-page__summary-label'>策略</Text>
              <Text className='login-page__summary-value'>
                {miniEnv.loginStrategy === 'wechat-phone-first'
                  ? '手机号一键登录'
                  : miniEnv.loginStrategy}
              </Text>
            </View>
            <View className='login-page__summary-item'>
              <Text className='login-page__summary-label'>状态</Text>
              <Text className='login-page__summary-value'>
                {stage === 'success' ? '已登录' : '待登录'}
              </Text>
            </View>
            <View className='login-page__summary-item'>
              <Text className='login-page__summary-label'>配置</Text>
              <Text className='login-page__summary-value'>
                {miniEnv.wechatPhoneLoginStatus === 'page-ready'
                  ? '页面已就绪'
                  : miniEnv.wechatPhoneLoginStatus}
              </Text>
            </View>
          </View>

          <View className='login-page__note'>
            {statusText}
            {profileName ? `：${profileName}` : ''}
            <View className='login-page__divider' />
            {phoneLoginHint}
          </View>

          <Button
            className='login-page__button'
            openType='getPhoneNumber'
            onGetPhoneNumber={handlePhoneLogin}
            disabled={stage === 'loading-code' || stage === 'submitting'}
          >
            {stage === 'submitting' ? '登录中...' : '微信手机号一键登录'}
          </Button>

          <Button
            className='login-page__button login-page__button--ghost'
            onClick={handleRetry}
            disabled={stage === 'loading-code' || stage === 'submitting'}
          >
            重新获取微信凭证
          </Button>

          {stage === 'error' && (
            <Button
              className='login-page__button login-page__button--danger'
              onClick={handleRetry}
            >
              重新尝试登录
            </Button>
          )}
        </View>
      </View>

      <View className='login-page__footer'>
        <Text>当前只支持微信绑定手机号一键登录。</Text>
        <Text>
          登录成功后会返回 accessToken，mini 端会自动写入请求层并附加 Authorization 头。
        </Text>
      </View>
    </View>
  )
}
