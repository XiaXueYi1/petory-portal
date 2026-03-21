import { PropsWithChildren } from 'react'
import { useLaunch } from '@tarojs/taro'
import Taro from '@tarojs/taro'

import { miniHttp } from '@/shared/request'
import './app.scss'

function App({ children }: PropsWithChildren<any>) {
  useLaunch(() => {
    const token = miniHttp.getToken()
    if (token) {
      Taro.reLaunch({
        url: '/pages/index/index'
      })
    }
  })

  return children
}

export default App
