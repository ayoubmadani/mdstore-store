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

// ─── esbuild config ──────────────────────────────────────────────────────────
const ESBUILD = {
  bundle:   true,
  format:   'cjs',
  platform: 'node',
  external: [
    'react', 'react-dom', 'react/jsx-runtime',
    'next', 'next/*',
    'axios', 'zustand', 'zustand/*',
    'lucide-react', 'framer-motion', 'isomorphic-dompurify', 'uuid',
  ],
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

console.log(`\n✅ Done: ${uploaded} uploaded, ${failed} failed`)
