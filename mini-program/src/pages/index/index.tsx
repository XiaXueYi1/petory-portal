import { useEffect, useState } from 'react'
import { Button, Text, View } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { miniHttp } from '@/shared/request'
import './index.scss'

export default function HomePage() {
  const [tokenPreview, setTokenPreview] = useState('')
  const nickname = 'Petory User'

  useEffect(() => {
    const token = miniHttp.getToken()

    if (!token) {
      Taro.reLaunch({ url: '/pages/login/index' })
      return
    }

    setTokenPreview(`${token.slice(0, 10)}...`)
  }, [])

  const handleLogout = () => {
    miniHttp.clearToken()
    Taro.showToast({
      title: 'Logged out',
      icon: 'none'
    })
    Taro.reLaunch({ url: '/pages/login/index' })
  }

  return (
    <View className='home-page'>
      <View className='home-page__orb home-page__orb--one' />
      <View className='home-page__orb home-page__orb--two' />

      <View className='home-page__hero'>
        <Text className='home-page__badge'>PETORY MINI</Text>
        <Text className='home-page__title'>Welcome back</Text>
        <Text className='home-page__subtitle'>
          {nickname} is signed in. The token is stored locally and future requests carry the Bearer header automatically.
        </Text>
      </View>

      <View className='home-page__card'>
        <View className='home-page__row'>
          <Text className='home-page__label'>Login mode</Text>
          <Text className='home-page__value'>phone + appCode(code)</Text>
        </View>
        <View className='home-page__row'>
          <Text className='home-page__label'>Token</Text>
          <Text className='home-page__value'>{tokenPreview || 'Bearer token stored'}</Text>
        </View>
        <View className='home-page__row'>
          <Text className='home-page__label'>Next step</Text>
          <Text className='home-page__value'>Build the real pet dashboard later</Text>
        </View>
      </View>

      <View className='home-page__actions'>
        <Button className='home-page__button' onClick={handleLogout}>
          Log out
        </Button>
      </View>
    </View>
  )
}
