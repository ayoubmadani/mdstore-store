import { NextRequest, NextResponse } from 'next/server'
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3'

export const runtime = 'nodejs'

let s3: S3Client | null = null
function getS3() {
  if (!s3) {
    s3 = new S3Client({
      region:         process.env.AWS_REGION || 'auto',
      endpoint:       process.env.AWS_ENDPOINT,
      forcePathStyle: process.env.AWS_FORCE_PATH_STYLE === 'true',
      credentials: {
        accessKeyId:     process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
    })
  }
  return s3
}

const fetchKey = (key: string) =>
  getS3().send(new GetObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET_NAME!,
    Key:    key,
  }))

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string[] }> },
) {
  const { slug } = await params
  const fullSlug = slug.join('/')
  // Last segment is the theme name — used as flat fallback (strips lang prefix)
  const flatSlug = slug[slug.length - 1]

  try {
    let obj
    try {
      // 1. Try exact path: themes/{lang}/{name}.js or themes/{name}.js
      obj = await fetchKey(`themes/${fullSlug}.js`)
    } catch {
      try {
        // 2. Flat fallback: themes/{name}.js (trilingual single-file themes)
        if (flatSlug !== fullSlug) {
          obj = await fetchKey(`themes/${flatSlug}.js`)
        } else {
          throw new Error('skip')
        }
      } catch {
        // 3. Default theme
        obj = await fetchKey('themes/default.js')
      }
    }

    const code = await (obj.Body as any).transformToString()

    return new NextResponse(code, {
      headers: {
        'Content-Type':  'text/javascript; charset=utf-8',
        'Cache-Control': 'no-store',
      },
    })
  } catch {
    return NextResponse.json(
      { error: `Theme not found: ${fullSlug}` },
      { status: 404 },
    )
  }
}
