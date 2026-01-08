// components/Layout.tsx
import React from 'react'; // 确保导入 React
import { Navigation } from './Navigation'
import { Footer } from '@/components/Footer'
import { getCategories } from '@/lib/data';
import { getLocale } from 'next-intl/server';
import { headers } from 'next/headers';
import { NavigationV2 } from './NavigationV2';
import { FooterV2 } from './FooterV2';

export async function Layout({
  children,
  params,
  searchParams
}: {
  children: React.ReactNode;
  params: { locale: string };
  searchParams: Record<string, string>
}) {
  const locale = await getLocale();
  const categories = getCategories(locale);
  const headersList = headers();
  const pathname = headersList.get('x-pathname') || '';

  // 添加调试日志
  console.log('searchParams:', searchParams);
  console.log('isIframe:', searchParams.embed === 'true');
  console.log('pathname:', pathname);

  const isIframe = searchParams.embed === 'true'
  const isRPICalculator = pathname.includes('/tests/rpi-calculator');

  if (isIframe || isRPICalculator) {
    console.log('Rendering without nav and footer');
    return <>{children}</>
  }

  console.log('Rendering full layout');
  return (
    <div className="min-h-screen bg-background font-sans antialiased">
      <NavigationV2/>
      <main className="flex-1">{children}</main>
      <FooterV2 />
    </div>
  )
}