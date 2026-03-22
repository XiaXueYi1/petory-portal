import { useEffect, useState } from 'react'
import { Button, Text, View } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { miniHttp } from '@/shared/request'
import './index.scss'

export default function HomePage() {
  const [tokenPreview, setTokenPreview] = useState('')
  const nickname = 'Petory 用户'

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
      title: '已退出登录',
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
        <Text className='home-page__title'>今天也要照顾好小家伙</Text>
        <Text className='home-page__subtitle'>
          {nickname} 已登录成功，这里是 Petory Mini 的首页承接页。
        </Text>
      </View>

      <View className='home-page__card'>
        <View className='home-page__grid'>
          <View className='home-page__tile'>
            <Text className='home-page__label'>登录方式</Text>
            <Text className='home-page__value'>phone + appCode(code)</Text>
          </View>
          <View className='home-page__tile'>
            <Text className='home-page__label'>Token</Text>
            <Text className='home-page__value'>{tokenPreview || '已保存到本地'}</Text>
          </View>
        </View>

        <View className='home-page__feature'>
          <Text className='home-page__feature-title'>今日提醒</Text>
          <Text className='home-page__feature-text'>登录流程已经打通，后续可以直接在这里扩宠物档案、记录和提醒模块。</Text>
        </View>

        <View className='home-page__feature home-page__feature--soft'>
          <Text className='home-page__feature-title'>当前状态</Text>
          <Text className='home-page__feature-text'>登录态已保存，本地请求会自动携带 Authorization 头。</Text>
        </View>
      </View>

      <View className='home-page__actions'>
        <Button className='home-page__button' onClick={handleLogout}>
          退出登录
        </Button>
      </View>
    </View>
  )
}
