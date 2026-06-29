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

export async function GET(req: NextRequest) {
  const lang = req.nextUrl.searchParams.get('lang')
  const slug = req.nextUrl.searchParams.get('slug')

  if (!lang || !slug)
    return NextResponse.json({ error: 'Missing params: lang, slug' }, { status: 400 })

  try {
    const obj = await getS3().send(new GetObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME!,
      Key:    `themes/${lang}/${slug}.js`,
    }))

    const code = await (obj.Body as any).transformToString()

    return new NextResponse(code, {
      headers: {
        'Content-Type':  'text/javascript; charset=utf-8',
        'Cache-Control': 'no-store',
      },
    })
  } catch {
    return NextResponse.json(
      { error: `Theme not found in R2: ${lang}/${slug}` },
      { status: 404 }
    )
  }
}
