import type { Metadata } from 'next';
import LegalDoc, { legalText, legalTitle } from '@/components/legal/LegalDoc';

// نص قانوني ثابت (ميتا تفتح هذا الرابط عند مراجعة التطبيق) — المحتوى في components/legal/content.ts
export async function generateMetadata(): Promise<Metadata> {
  const { text } = await legalText('privacy');
  return { title: legalTitle(text), robots: { index: true, follow: true } };
}

export default function PrivacyPage() {
  return <LegalDoc doc="privacy" />;
}
