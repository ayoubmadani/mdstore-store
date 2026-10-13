import esbuild from 'esbuild'
import fs from 'fs'
import { S3Client, PutObjectCommand, DeleteObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT   = path.resolve(__dirname, '..')
const THEMES = path.join(ROOT, 'src/theme')

// ─── env ─────────────────────────────────────────────────────────────────────
function loadEnv() {
  for (const name of ['.env', '.env.local']) {
    const p = path.join(ROOT, name)
    if (!fs.existsSync(p)) continue
    for (const line of fs.readFileSync(p, 'utf-8').split('\n')) {
      const t = line.trim()
      if (!t || t.startsWith('#')) continue
      const idx = t.indexOf('=')
      if (idx < 0) continue
      const key = t.slice(0, idx).trim()
      const val = t.slice(idx + 1).trim()
      if (key) process.env[key] = val
    }
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

// ─── args ────────────────────────────────────────────────────────────────────
const args     = process.argv.slice(2)
const onlySlug = args.find(a => a.startsWith('--slug='))?.split('=')[1]
const doDelete = args.includes('--delete')
// --out=<dir>: بناء محلي فقط (للاختبار) بدون رفع إلى R2
const outDir   = args.find(a => a.startsWith('--out='))?.split('=')[1]

// ─── delete ──────────────────────────────────────────────────────────────────
if (doDelete) {
  if (!onlySlug) { console.error('❌ --delete requires --slug=<name>'); process.exit(1) }
  try {
    await s3.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: `themes/${onlySlug}.js` }))
    console.log(`🗑️  deleted themes/${onlySlug}.js`)
  } catch (err) { console.error(`✗ ${err.message}`) }
  process.exit(0)
}

// ─── list ────────────────────────────────────────────────────────────────────
if (args.includes('--list')) {
  const res = await s3.send(new ListObjectsV2Command({ Bucket: BUCKET, Prefix: 'themes/' }))
  res.Contents?.forEach(o => console.log(o.Key))
  process.exit(0)
}

// ─── skill (تعليمات صنع الثيمات الخاصة بـ Claude في md-store-api) ─────────────
// node scripts/bundle-themes.mjs --skill  ← يرفع skills/mdstore-theme-creator إلى theme-skill/
if (args.includes('--skill')) {
  const dir = path.join(ROOT, 'skills/mdstore-theme-creator')
  const files = ['SKILL.md', 'reference/theme-template.tsx', 'reference/existing-themes.md']
  for (const rel of files) {
    await s3.send(new PutObjectCommand({
      Bucket: BUCKET, Key: `theme-skill/${rel}`,
      Body: fs.readFileSync(path.join(dir, rel)), ContentType: 'text/plain; charset=utf-8',
    }))
    console.log(`✓ theme-skill/${rel}`)
  }
  process.exit(0)
}

// ─── esbuild config ──────────────────────────────────────────────────────────
const ESBUILD = {
  bundle:   true,
  format:   'cjs',
  platform: 'node',
  external: [
    'react', 'react-dom', 'react/jsx-runtime',
    'next', 'next/*',
    'axios', 'zustand', 'zustand/*',
    // lucide-react مدمجة في الحزمة: الأيقونات المستعملة فقط بدل تحميل كل المكتبة في المتجر
    'framer-motion', 'isomorphic-dompurify', 'uuid',
    // يوفّره المتجر وقت التشغيل (src/components/theme/kit.ts)
    '@mdstore/theme-kit',
  ],
  mainFields: ['module', 'main'], // نسخة ESM من lucide حتى يحذف esbuild الأيقونات غير المستعملة
  minify:   true,
  write:    false,
  logLevel: 'silent',
}

let uploaded = 0, failed = 0

// ─── الثيمات: src/theme/*.tsx ─────────────────────────────────────────────
const allSlugs = fs.readdirSync(THEMES)
  .filter(f => f.endsWith('.tsx'))
  .map(f => f.replace(/\.tsx$/, ''))

const toProcess = onlySlug ? [onlySlug] : allSlugs

for (const slug of toProcess) {
  const entry = path.join(THEMES, `${slug}.tsx`)
  if (!fs.existsSync(entry)) {
    console.error(`✗ ${slug}: not found at src/theme/${slug}.tsx`)
    failed++
    continue
  }
  try {
    const result = await esbuild.build({ entryPoints: [entry], ...ESBUILD })
    const code = result.outputFiles[0].text
    if (outDir) {
      fs.mkdirSync(outDir, { recursive: true })
      fs.writeFileSync(path.join(outDir, `${slug}.js`), code)
      console.log(`✓ ${slug} (${(code.length / 1024).toFixed(1)}KB)`)
      uploaded++
      continue
    }
    await s3.send(new PutObjectCommand({
      Bucket: BUCKET, Key: `themes/${slug}.js`,
      Body: code, ContentType: 'application/javascript',
    }))
    console.log(`✓ ${slug}`)
    uploaded++
  } catch (err) {
    console.error(`✗ ${slug}: ${err.message}`)
    failed++
  }
}

console.log(`\n✅ Done: ${uploaded} ${outDir ? `built → ${outDir}` : 'uploaded'}, ${failed} failed`)
