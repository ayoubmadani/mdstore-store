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

const s3 = new S3Client({
  region:         process.env.AWS_REGION || 'auto',
  endpoint:       process.env.AWS_ENDPOINT,
  forcePathStyle: process.env.AWS_FORCE_PATH_STYLE === 'true',
  credentials: {
    accessKeyId:     process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
})

const BUCKET = process.env.AWS_S3_BUCKET_NAME

function makeRequire() {
  const pinned: Record<string, any> = {
    'react':                  React,
    'react-dom':              ReactDOM,
    'react/jsx-runtime':      ReactJSX,
    'zustand':                Zustand,
    'zustand/middleware':     ZustandMiddleware,
    'axios':                  { default: axios, ...axios },
    'lucide-react':           LucideReact,
    'framer-motion':          FramerMotion,
    'uuid':                   UUID,
    'isomorphic-dompurify':   { default: DOMPurify, ...DOMPurify },
  }
  return (id: string) => pinned[id] ?? {}
}

export async function loadTheme(lang: string, slug: string): Promise<any> {
  const key = `${lang}/${slug}`
  if (memCache.has(key)) return memCache.get(key)

  if (BUCKET) {
    try {
      const obj = await s3.send(new GetObjectCommand({
        Bucket: BUCKET,
        Key:    `themes/${lang}/${slug}.js`,
      }))

      const code = await (obj.Body as any).transformToString()

      const mod = { exports: {} as Record<string, any> }
      vm.runInNewContext(code, {
        module:  mod,
        exports: mod.exports,
        require: makeRequire(),
        console,
        process: { env: {} },
        Buffer,
        setTimeout,
        clearTimeout,
      })

      memCache.set(key, mod.exports)
      return mod.exports
    } catch (err: any) {
      console.error(`[theme-loader] R2 error ${lang}/${slug}: ${err?.message || String(err)}`)
    }
  }

  // Fallback: filesystem import
  return import(`@/theme/${lang}/${slug}/main`).catch(
    () => import(`@/theme/${lang}/default/main`)
  )
}
