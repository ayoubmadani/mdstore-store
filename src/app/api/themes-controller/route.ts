import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const VALID_LANGS = ['ar', 'en', 'fr'];

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const lang = searchParams.get('lang');
  const slug = searchParams.get('slug');

  if (!lang || !slug) {
    return NextResponse.json(
      { error: 'Missing required params: lang, slug' },
      { status: 400, headers: CORS_HEADERS }
    );
  }

  if (!VALID_LANGS.includes(lang)) {
    return NextResponse.json(
      { error: `Invalid lang. Allowed: ${VALID_LANGS.join(', ')}` },
      { status: 400, headers: CORS_HEADERS }
    );
  }

  const safeSlug = path.basename(slug);
  const dir = path.join(process.cwd(), 'src', 'theme', lang, safeSlug);
  const mainFile = path.join(dir, 'main.tsx');

  const exists = fs.existsSync(mainFile);

  if (searchParams.get('download') === 'true') {
    if (!exists) {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404, headers: CORS_HEADERS }
      );
    }
    const content = fs.readFileSync(mainFile);
    return new NextResponse(content, {
      status: 200,
      headers: {
        ...CORS_HEADERS,
        'Content-Type': 'text/plain; charset=utf-8',
        'Content-Disposition': `attachment; filename="${safeSlug}_${lang}.tsx"`,
      },
    });
  }

  return NextResponse.json(
    { exists, path: `src/theme/${lang}/${safeSlug}/main.tsx` },
    { headers: CORS_HEADERS }
  );
}

export async function POST(req: NextRequest) {
  const formData = await req.formData();

  const file = formData.get('file') as File | null;
  const lang = formData.get('lang') as string | null;
  const slug = formData.get('slug') as string | null;

  if (!file || !lang || !slug) {
    return NextResponse.json(
      { error: 'Missing required fields: file, lang, slug' },
      { status: 400, headers: CORS_HEADERS }
    );
  }

  if (!VALID_LANGS.includes(lang)) {
    return NextResponse.json(
      { error: `Invalid lang. Allowed: ${VALID_LANGS.join(', ')}` },
      { status: 400, headers: CORS_HEADERS }
    );
  }

  const safeSlug     = path.basename(slug);
  const safeFileName = path.basename(file.name);

  const dir      = path.join(process.cwd(), 'src', 'theme', lang, safeSlug);
  const filePath = path.join(dir, safeFileName);

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  fs.writeFileSync(filePath, buffer);

  return NextResponse.json(
    { success: true, path: `src/theme/${lang}/${safeSlug}/${safeFileName}` },
    { status: 200, headers: CORS_HEADERS }
  );
}
