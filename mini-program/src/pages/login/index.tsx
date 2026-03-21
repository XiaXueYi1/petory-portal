import { useState } from 'react'
import { Button, Input, Text, View } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { miniHttp } from '@/shared/request'
import { loginWithMiniPhoneAppCode } from '@/features/auth/api'
import type { MiniPhoneAppCodeLoginRequest } from '@/features/auth'
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
  const [statusText, setStatusText] = useState('Enter your phone number to continue.')
  const [hintText, setHintText] = useState('Mini auth4 uses phone + appCode(code) as the login path.')
  const [profileName, setProfileName] = useState('')

  const handlePhoneChange = (event: PhoneInputEvent) => {
    setPhone(event.detail?.value ?? '')
  }

  const handleLogin = async () => {
    const normalizedPhone = phone.trim()

    if (!PHONE_PATTERN.test(normalizedPhone)) {
      setStage('error')
      setStatusText('Please enter a valid phone number.')
      setHintText('Use a valid mainland China mobile number, then try again.')
      Taro.showToast({
        title: 'Invalid phone number',
        icon: 'none'
      })
      return
    }

    try {
      setStage('submitting')
      setStatusText('Signing you in...')
      setHintText('A fresh appCode(code) is fetched at submit time.')

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

      setProfileName(
        response.profile?.user?.nickname ||
        response.profile?.user?.username ||
        'Petory User'
      )
      setStage('success')
      setStatusText('Login successful. Opening the home page...')
      setHintText('The token is stored locally. The app will jump to the home page now.')

      Taro.showToast({
        title: 'Login successful',
        icon: 'success'
      })

      Taro.reLaunch({
        url: '/pages/index/index'
      })
    } catch (error) {
      console.error('mini auth4 login failed', error)
      setStage('error')
      setStatusText('Login failed. Please try again later.')
      setHintText('Check the phone number, backend service, and WeChat login code.')
      Taro.showToast({
        title: 'Login failed',
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
        <Text className='login-page__title'>Welcome back</Text>
        <Text className='login-page__subtitle'>
          Sign in with your phone number. The current path is phone + appCode(code) for the personal mini-program setup.
        </Text>
      </View>

      <View className='login-page__panel'>
        <View className='login-page__stack'>
          <View className='login-page__field'>
            <Text className='login-page__field-label'>Phone Number</Text>
            <Input
              className='login-page__input'
              type='number'
              maxlength={11}
              placeholder='Enter your phone number'
              value={phone}
              onInput={handlePhoneChange}
            />
            <Text className='login-page__field-tip'>
              A fresh appCode(code) is fetched only when you tap Login.
            </Text>
          </View>

          <View className='login-page__note'>
            <Text>{statusText}</Text>
            {profileName ? <Text>{`, ${profileName}`}</Text> : null}
            <View className='login-page__divider' />
            <Text>{hintText}</Text>
          </View>

          <Button
            className='login-page__button'
            onClick={handleLogin}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Signing in...' : 'Continue'}
          </Button>
        </View>
      </View>

      <View className='login-page__footer'>
        <Text>After login, the token is saved locally and future requests automatically carry the Authorization header.</Text>
        <Text>When the token expires, return to the login page and sign in again.</Text>
      </View>
    </View>
  )
}
