import esbuild from 'esbuild'
import fs from 'fs'
import { S3Client, PutObjectCommand, DeleteObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')

// قراءة متغيرات البيئة من .env.local
function loadEnv() {
  const envPath = path.join(ROOT, '.env.local')
  if (!fs.existsSync(envPath)) return
  const lines = fs.readFileSync(envPath, 'utf-8').split('\n')
  for (const line of lines) {
    const [key, ...rest] = line.split('=')
    if (key && rest.length) process.env[key.trim()] = rest.join('=').trim()
  }
}
loadEnv()

const s3 = new S3Client({
  region:         process.env.AWS_REGION || 'auto',
  endpoint:       process.env.AWS_ENDPOINT,
  forcePathStyle: process.env.AWS_FORCE_PATH_STYLE === 'true',
  credentials: {
    accessKeyId:     process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
})

const BUCKET = process.env.AWS_S3_BUCKET_NAME
const THEMES = path.join(ROOT, 'src/theme')

// اختياري: فلترة بـ --lang و --slug
const args     = process.argv.slice(2)
const onlyLang = args.find(a => a.startsWith('--lang='))?.split('=')[1]
const onlySlug = args.find(a => a.startsWith('--slug='))?.split('=')[1]
const doDelete = args.includes('--delete')

// حذف ثيم من R2
if (doDelete) {
  if (!onlySlug) {
    console.error('❌ --delete requires --slug=<name>')
    process.exit(1)
  }
  const langs = onlyLang ? [onlyLang] : ['fr', 'ar']
  for (const lang of langs) {
    const key = `themes/${lang}/${onlySlug}.js`
    try {
      await s3.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }))
      console.log(`🗑️  deleted ${key}`)
    } catch (err) {
      console.error(`✗ ${key}: ${err.message}`)
    }
  }
  process.exit(0)
}

// قائمة الثيمات المرفوعة
if (args.includes('--list')) {
  const res = await s3.send(new ListObjectsV2Command({ Bucket: BUCKET, Prefix: 'themes/' }))
  res.Contents?.forEach(o => console.log(o.Key))
  process.exit(0)
}

const langs = onlyLang ? [onlyLang] : ['fr', 'ar']
let uploaded = 0, failed = 0

for (const lang of langs) {
  const langDir = path.join(THEMES, lang)
  if (!fs.existsSync(langDir)) continue

  const slugs = onlySlug ? [onlySlug] : fs.readdirSync(langDir)

  for (const slug of slugs) {
    const entry = path.join(langDir, slug, 'main.tsx')
    if (!fs.existsSync(entry)) continue

    try {
      const result = await esbuild.build({
        entryPoints: [entry],
        bundle:   true,
        format:   'cjs',
        platform: 'node',
        external: [
          'react', 'react-dom', 'react/jsx-runtime',
          'next', 'next/*',
          'axios', 'zustand', 'zustand/*',
          'lucide-react',
          'framer-motion',
          'isomorphic-dompurify',
          'uuid',
        ],
        write:    false,
        logLevel: 'silent',
      })

      const code = result.outputFiles[0].text

      await s3.send(new PutObjectCommand({
        Bucket:      BUCKET,
        Key:         `themes/${lang}/${slug}.js`,
        Body:        code,
        ContentType: 'application/javascript',
      }))

      console.log(`✓ ${lang}/${slug}`)
      uploaded++
    } catch (err) {
      console.error(`✗ ${lang}/${slug}: ${err.message}`)
      failed++
    }
  }
}

console.log(`\n✅ Done: ${uploaded} uploaded, ${failed} failed`)
