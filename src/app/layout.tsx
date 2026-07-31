import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import { APP_NAME, APP_NAME_ZH, TAGLINE } from "@/constants/app";

export const metadata: Metadata = {
  title: {
    default: `${APP_NAME} · ${APP_NAME_ZH}`,
    template: `%s · ${APP_NAME}`,
  },
  description: "面向初中生、高中生与导数初学者的交互式数学学习网站：函数画布、计算验证、分步解题与导数可视化。",
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1">
          <ErrorBoundary>{children}</ErrorBoundary>
        </main>
        <footer className="border-t border-slate-200 bg-slate-50 px-6 py-4 text-center text-xs text-slate-500">
          {APP_NAME} · {APP_NAME_ZH}（{TAGLINE}）— 公益开源项目，仅用于学习与研究用途
        </footer>
      </body>
    </html>
  );
}
