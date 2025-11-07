import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { PageTransition } from "@/components/layout/page-transition";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { AuthProvider } from "@/components/providers/session-provider";
import { getAuthSession } from "@/lib/auth";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteName = "张亚斌 · 前端开发者";
const description = "张亚斌的个人网站与博客，专注 Next.js、React、前端工程化与全栈技术。";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.SITE_URL ?? "http://localhost:3000"),
  title: {
    default: siteName,
    template: `%s · ${siteName}`,
  },
  description,
  openGraph: {
    title: siteName,
    description,
    type: "website",
    url: "/",
    siteName,
  },
  twitter: {
    card: "summary_large_image",
    title: siteName,
    description,
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getAuthSession();

  return (
    <html lang="zh-CN">
      <body className={`${geistSans.variable} ${geistMono.variable} theme-minimal antialiased`}>
        <ThemeProvider>
          <AuthProvider session={session}>
            <div className="flex min-h-screen flex-col">
              <SiteHeader session={session} />
              <main className="flex-1 overflow-x-hidden">
                <PageTransition>{children}</PageTransition>
              </main>
              <SiteFooter />
            </div>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
