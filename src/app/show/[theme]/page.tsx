import dynamic from 'next/dynamic';
import { use, useMemo } from 'react';

interface ParamsType {
    params: Promise<{ theme: string }>;
}

export default function Page({ params }: ParamsType) {
    const { theme } = use(params);

    // استخدام useMemo لضمان عدم إعادة تحميل المكون إلا إذا تغير اسم القالب
    const Main = useMemo(() => dynamic(
        () => import(`@/constendTheme/${theme}`).catch(() => {
            return () => <p>Theme "{theme}" not found!</p>;
        }),
        {
            loading: () => <p>Loading theme...</p>,
            ssr: true
        }
    ), [theme]);

    return (
        <main>
            
            <Main />
        </main>
    );
}