import { useState } from 'react'
import { Button, Input, Text, View } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { loginWithMiniPhoneAppCode } from '@/features/auth/api'
import type { MiniPhoneAppCodeLoginRequest } from '@/features/auth'
import { miniHttp } from '@/shared/request'
import './index.scss'

type LoginStage = 'idle' | 'submitting' | 'success' | 'error'

interface PhoneInputEvent {
  detail?: {
    value?: string
  }
}

const PHONE_PATTERN = /^1[3-9]\d{9}$/

export default function LoginPage() {
  const [phone, setPhone] = useState('')
  const [stage, setStage] = useState<LoginStage>('idle')
  const [statusText, setStatusText] = useState('输入手机号，继续进入 Petory Mini。')
  const [hintText, setHintText] = useState('当前登录方式为手机号 + appCode(code)，登录后会自动进入首页。')

  const handlePhoneChange = (event: PhoneInputEvent) => {
    setPhone(event.detail?.value ?? '')
  }

  const handleLogin = async () => {
    const normalizedPhone = phone.trim()

    if (!PHONE_PATTERN.test(normalizedPhone)) {
      setStage('error')
      setStatusText('请输入正确的手机号。')
      setHintText('请填写 11 位大陆手机号后再继续。')
      Taro.showToast({
        title: '手机号格式不正确',
        icon: 'none'
      })
      return
    }

    try {
      setStage('submitting')
      setStatusText('正在登录中...')
      setHintText('登录时会实时获取一份新的 appCode(code)。')

      const loginResult = await Taro.login()
      const code = loginResult.code?.trim()

      if (!code) {
        throw new Error('Failed to get WeChat login code')
      }

      const payload: MiniPhoneAppCodeLoginRequest = {
        phone: normalizedPhone,
        code
      }

      const response = await loginWithMiniPhoneAppCode(payload)

      if (!response?.accessToken) {
        throw new Error('Login response missing accessToken')
      }

      miniHttp.setToken(response.accessToken)
      setStage('success')
      setStatusText('登录成功，正在进入首页...')
      setHintText('登录态已保存，后续请求会自动携带 Authorization 头。')

      Taro.showToast({
        title: '登录成功',
        icon: 'success'
      })

      Taro.reLaunch({
        url: '/pages/index/index'
      })
    } catch (error) {
      console.error('mini auth5 login failed', error)
      setStage('error')
      setStatusText('登录失败，请稍后再试。')
      setHintText('请检查手机号、后端服务和微信登录码是否可用。')
      Taro.showToast({
        title: '登录失败',
        icon: 'none'
      })
    }
  }

  const isSubmitting = stage === 'submitting'

  return (
    <View className='login-page'>
      <View className='login-page__orb login-page__orb--one' />
      <View className='login-page__orb login-page__orb--two' />

      <View className='login-page__hero'>
        <Text className='login-page__badge'>PETORY MINI</Text>
        <Text className='login-page__title'>欢迎回来</Text>
        <Text className='login-page__subtitle'>
          记录宠物的每一天，从一次登录开始。输入手机号即可进入 Petory Mini。
        </Text>
      </View>

      <View className='login-page__panel'>
        <View className='login-page__summary'>
          <View className='login-page__summary-item'>
            <Text className='login-page__summary-label'>登录方式</Text>
            <Text className='login-page__summary-value'>phone + appCode(code)</Text>
          </View>
          <View className='login-page__summary-item'>
            <Text className='login-page__summary-label'>登录后</Text>
            <Text className='login-page__summary-value'>自动进入首页</Text>
          </View>
        </View>

        <View className='login-page__stack'>
          <View className='login-page__field'>
            <Text className='login-page__field-label'>手机号</Text>
            <Input
              className='login-page__input'
              type='number'
              maxlength={11}
              placeholder='请输入手机号'
              value={phone}
              onInput={handlePhoneChange}
            />
            <Text className='login-page__field-tip'>
              点击登录时会实时获取一份新的 appCode(code)。
            </Text>
          </View>

          <View className='login-page__note'>
            <Text>{statusText}</Text>
            <View className='login-page__divider' />
            <Text>{hintText}</Text>
          </View>

          <Button
            className='login-page__button'
            onClick={handleLogin}
            disabled={isSubmitting}
          >
            {isSubmitting ? '登录中...' : '立即登录'}
          </Button>
        </View>
      </View>

      <View className='login-page__footer'>
        <Text>登录成功后会自动进入首页，登录态保存在本地。</Text>
        <Text>如果 token 失效，回到此页重新登录即可。</Text>
      </View>
    </View>
  )
}
