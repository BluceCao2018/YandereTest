import './globals.css';
import '@radix-ui/themes/styles.css';
import React from 'react';
import { Inter } from 'next/font/google'
import { Layout } from '@/components/Layout';
import { Metadata } from 'next'
import { GoogleAnalyticsScript } from "@/components/analytics/GoogleAnalyticsScript";
import { PlausibleAnalyticsScript } from "@/components/analytics/PlausibleAnalyticsScript";
import GoogleAdsenseScript from "@/components/ads/GoogleAdsenseScript";
import { ThemeProvider } from "next-themes"
import { DM_Sans } from "next/font/google";
import { cn } from "@/lib/utils";

import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { headers } from 'next/headers';
import { Toaster } from 'sonner'
import { GoogleOAuthProvider } from '@react-oauth/google';
import { getTranslations } from 'next-intl/server';

const inter = Inter({ subsets: ['latin'] })
const sansFont = DM_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
});

// export const metadata: Metadata = {
//   title: {
//     default: '',
//     template: '%s | Fun Benchmark'
//   },
//   description: '',
//   authors: { name: '', url: '' },
//   keywords: '',
//   alternates: {
//     canonical: "", languages: {
//       "en-US": "",
//       "zh-CN": "",
//     }
//   },
//   icons: [
//     { rel: "icon", type: 'image/png', sizes: "16x16", url: "/favicon-16x16.png" },
//     { rel: "icon", type: 'image/png', sizes: "32x32", url: "/favicon-32x32.png" },
//     { rel: "icon", type: 'image/ico', url: "/favicon.ico" },
//     { rel: "apple-touch-icon", sizes: "180x180", url: "/favicon-180x180.png" },
//     { rel: "android-chrome", sizes: "512x512", url: "/favicon-512x512.png" },

//   ],
// }


export async function generateMetadata() {
  const w = await getTranslations('love-possession-calculator');
  const s=await getTranslations('domain');
  return {
    title: w("meta_title"),
    description: w("meta_description"),
    alternates: {
      canonical: `${s("domain")}`
    },
    openGraph: {
       title: w("meta_title"),
    description: w("meta_description"),
      type: 'website',
      images: [{
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
      }],
    }
  };
}

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const messages = await getMessages();
  const headersList = headers();
  
  const fetchDest = headersList.get('sec-fetch-dest');
  console.log('Fetch destination:', fetchDest);
  
  const searchParams = {
    embed: fetchDest === 'iframe' ? 'true' : 'false'
  };
  
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  if (!clientId) {
    console.error('Google Client ID is not configured');
    return null;
  }

  return (
    <>
      <html lang={params.locale} suppressHydrationWarning>
        <head />
        <body className={cn(inter.className, sansFont.variable)}>
          <NextIntlClientProvider messages={messages}>
            <ThemeProvider attribute="class" forcedTheme="light">
              <GoogleOAuthProvider clientId={clientId}>
                <Layout params={params} searchParams={searchParams}>{children}</Layout>
                <GoogleAdsenseScript />
                <GoogleAnalyticsScript />
                <PlausibleAnalyticsScript />
                <Toaster 
                  theme="system" 
                  closeButton
                  richColors
                />
              </GoogleOAuthProvider>
            </ThemeProvider>
          </NextIntlClientProvider>
        </body>
      </html>
    </>
  )
}