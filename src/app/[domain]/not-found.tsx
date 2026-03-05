'use client';

import { useParams } from 'next/navigation';

export default function NotFound() {
  const params = useParams();
  const domain = params?.domain as string;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center p-8">
        <div className="text-6xl mb-4">🔴</div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
        <h2 className="text-xl text-gray-600 mb-4">المتجر غير موجود</h2>
        <p className="text-gray-500">
          Domain: <strong className="text-gray-700">{domain}</strong>
        </p>
      </div>
    </div>
  );
}