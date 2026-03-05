"use client";

import dynamic from "next/dynamic";
import { notFound } from "next/navigation";
import { use, useMemo } from "react";
import { useStore } from "@/Hook/store-provider"; 

interface StaticPageProps {
  page: string;
}

interface ParamsType {
  params: Promise<{ page: string }>;
}

export default function PolicyPage({ params }: ParamsType) {
  const { page } = use(params);
  
  // ✅ استخدام التنقيب الآمن (Optional Chaining) مع قيمة افتراضية
  const storeData = useStore();
  const selectTheme = storeData?.theme || 'default';

  const DynamicStaticPage = useMemo(() => {
    return dynamic<StaticPageProps>(
      async () => {
        try {
          // استخدام الـ slug الذي حددناه (المخصص أو الافتراضي)
          const md = await import(`@/theme/${selectTheme}/main`);
          return md.StaticPage || md.default;
        } catch (error) {
          console.error(`Error loading theme [${selectTheme}]:`, error);
          // محاولة تحميل الثيم الافتراضي كـ Fallback أخير إذا فشل الثيم المختار
          try {
             const defaultMd = await import(`@/theme/default/main`);
             return defaultMd.StaticPage || defaultMd.default;
          } catch {
             return () => <p className="p-10 text-center">عذراً، هذه الصفحة غير متوفرة.</p>;
          }
        }
      },
      {
        loading: () => <p className="text-center p-10">جاري تحميل القالب...</p>,
        ssr: true,
      }
    );
  }, [selectTheme]);

  const allowedPages = ["terms", "privacy", "cookies", "contact"];
  const currentPage = page?.toLowerCase();

  if (!currentPage || !allowedPages.includes(currentPage)) {
    return notFound();
  }

  return (
    <main>
      <DynamicStaticPage page={currentPage} />
    </main>
  );
}