import "./globals.css";

import type { Metadata } from "next";
import { IBM_Plex_Mono, Inter } from "next/font/google";
import { Suspense } from "react";

import { Providers } from "@/context/auth/auth-ui.providers";
import { ConvexClientProvider } from "@/context/convex/convex-client.provider";

const inter = Inter({
  variable: "--font-inter-sans",
  subsets: ["latin"],
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Polaris",
  description:
    "代码在线编辑网站，通过AI助手实现创建项目，导入项目，查看项目列表等功能。并可以随时查看项目的UI展示",
  icons: {
    icon: "/logo.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className={`${inter.variable} ${plexMono.variable} antialiased`}>
        <ConvexClientProvider>
          <Suspense>
            <Providers>{children}</Providers>
          </Suspense>
        </ConvexClientProvider>
      </body>
    </html>
  );
}
