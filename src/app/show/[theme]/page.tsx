import type { Metadata } from 'next';
import PreviewClient from './PreviewClient';

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
            <PreviewClient theme={theme} />
        </main>
    );
}