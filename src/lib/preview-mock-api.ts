'use client'

import axios, { type AxiosResponse } from 'axios'
import { PREVIEW_PRODUCTS, PREVIEW_WILAYAS, PREVIEW_COMMUNES } from './mock-preview-store'

// يعترض طلبات axios الصادرة من كود الثيم (نفس نسخة axios المُلقّنة داخل ThemeRunner)
// أثناء معاينة /show/[theme] فقط، ويرجّع بيانات وهمية بدل ضرب الـ API الحقيقي —
// بهذا لا يُنشأ أي طلب حقيقي في قاعدة البيانات ولا نعتمد على وجود متجر حقيقي.

type AxiosGet = typeof axios.get
type AxiosPost = typeof axios.post

let installedCount = 0
let originalGet: AxiosGet
let originalPost: AxiosPost

function fakeResponse<T>(data: T): Promise<AxiosResponse<T>> {
  return Promise.resolve({
    data,
    status: 200,
    statusText: 'OK',
    headers: {},
    config: {} as any,
  })
}

export function installPreviewMockApi(): () => void {
  if (installedCount === 0) {
    originalGet = axios.get.bind(axios)
    originalPost = axios.post.bind(axios)

    axios.get = ((url: string, config?: any) => {
      if (typeof url === 'string') {
        if (url.includes('/products/public/')) {
          const search = String(config?.params?.search || '').trim().toLowerCase()
          const data = search
            ? PREVIEW_PRODUCTS.filter(p => p.name.toLowerCase().includes(search))
            : PREVIEW_PRODUCTS
          return fakeResponse(data)
        }
        if (url.includes('/shipping/public/get-shipping/')) return fakeResponse(PREVIEW_WILAYAS)
        if (url.includes('/shipping/get-communes/')) return fakeResponse(PREVIEW_COMMUNES)
      }
      return originalGet(url, config)
    }) as AxiosGet

    axios.post = ((url: string, body?: any, config?: any) => {
      if (typeof url === 'string') {
        if (url.includes('/orders')) {
          return fakeResponse({ success: true, id: `preview-order-${Date.now()}` })
        }
        if (url.includes('/user/contact-user/message')) {
          return fakeResponse({ success: true })
        }
      }
      return originalPost(url, body, config)
    }) as AxiosPost
  }

  installedCount += 1
  return () => {
    installedCount = Math.max(0, installedCount - 1)
    if (installedCount === 0) {
      axios.get = originalGet
      axios.post = originalPost
    }
  }
}
