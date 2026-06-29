import vm from 'vm'
import * as React from 'react'
import * as ReactDOM from 'react-dom'
import * as ReactJSX from 'react/jsx-runtime'
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3'
import * as Zustand from 'zustand'
import * as ZustandMiddleware from 'zustand/middleware'
import axios from 'axios'
import * as LucideReact from 'lucide-react'
import * as FramerMotion from 'framer-motion'
import * as UUID from 'uuid'
import DOMPurify from 'isomorphic-dompurify'

const memCache = new Map<string, any>()

let _s3: S3Client | null = null
function getS3() {
  if (!_s3) {
    _s3 = new S3Client({
      region:         process.env.AWS_REGION || 'auto',
      endpoint:       process.env.AWS_ENDPOINT,
      forcePathStyle: process.env.AWS_FORCE_PATH_STYLE === 'true',
      credentials: {
        accessKeyId:     process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
    })
  }
  return _s3
}

function makeRequire() {
  const pinned: Record<string, any> = {
    'react':                React,
    'react-dom':            ReactDOM,
    'react/jsx-runtime':    ReactJSX,
    'zustand':              Zustand,
    'zustand/middleware':   ZustandMiddleware,
    'axios':                { default: axios, ...axios },
    'lucide-react':         LucideReact,
    'framer-motion':        FramerMotion,
    'uuid':                 UUID,
    'isomorphic-dompurify': { default: DOMPurify, ...DOMPurify },
  }
  return (id: string) => pinned[id] ?? {}
}

export async function loadTheme(lang: string, slug: string): Promise<any> {
  const key = `${lang}/${slug}`
  if (memCache.has(key)) return memCache.get(key)

  const bucket = process.env.AWS_S3_BUCKET_NAME
  const endpoint = process.env.AWS_ENDPOINT

  console.log(`[theme-loader] loading ${key} from ${endpoint}/${bucket}`)

  if (bucket) {
    try {
      const obj = await getS3().send(new GetObjectCommand({
        Bucket: bucket,
        Key:    `themes/${lang}/${slug}.js`,
      }))

      const code = await (obj.Body as any).transformToString()

      const ctx = vm.createContext({
        require: makeRequire(),
        console,
        process: { env: {} },
        Buffer,
        setTimeout,
        clearTimeout,
      })

      // ننشئ module/exports داخل الـ vm context لتجنب مشكلة Object cross-context
      vm.runInContext('var module = { exports: {} }; var exports = module.exports;', ctx)
      vm.runInContext(code, ctx)
      const themeExports = vm.runInContext('module.exports', ctx)

      memCache.set(key, themeExports)
      console.log(`[theme-loader] ✓ loaded ${key}`)
      return themeExports
    } catch (err: any) {
      console.error(`[theme-loader] ✗ R2 ${key}: ${err?.message || String(err)}`)
    }
  } else {
    console.warn('[theme-loader] AWS_S3_BUCKET_NAME not set — using filesystem')
  }

  // Fallback: filesystem
  try {
    const mod = await import(`@/theme/${lang}/${slug}/main`)
    memCache.set(key, mod)
    return mod
  } catch {
    throw new Error(`[theme-loader] Theme not found: ${lang}/${slug}`)
  }
}
