import type { Metadata } from 'next';
import { Suspense } from 'react';
import EmbedClient from './EmbedClient';

interface ParamsType {
    params: Promise<{ theme: string }>;
}

export const metadata: Metadata = {
    title: 'معاينة الثيم',
    robots: { index: false, follow: false },
};

export default async function Page({ params }: ParamsType) {
    const { theme } = await params;

    return (
        <main>
            {/* يُخفي شريط التمرير الخاص بمستند هذا الـ iframe فقط (نفس-المصدر، فلا يؤثر على
               أي صفحة أخرى) — التمرير يبقى يعمل عادياً، فقط الخط المرئي يُخفى لمحاكاة
               شاشة هاتف حقيقية بدل نافذة متصفح عادية.
               خلفية html/body شفافة: إن كان محتوى الثيم أقصر من ارتفاع الإطار، تظهر خلفية
               إطار الهاتف الغامقة في الأب بدل الأبيض الافتراضي (لا يعتمد على لون ثيم بعينه). */}
            <style>{`
                html, body { scrollbar-width: none; -ms-overflow-style: none; background: transparent; }
                html::-webkit-scrollbar, body::-webkit-scrollbar { display: none; width: 0; height: 0; }
            `}</style>
            <Suspense fallback={null}>
                <EmbedClient theme={theme} />
            </Suspense>
        </main>
    );
}
