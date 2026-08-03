import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host");
  const protocol =
    requestHeaders.get("x-forwarded-proto") ??
    (host?.includes("localhost") ? "http" : "https");
  const origin = host ? `${protocol}://${host}` : undefined;
  const image = origin ? `${origin}/og-ui-usability.png` : undefined;

  return {
    title: "校園社團活動 UI／UX 可用性原型｜Group05",
    description:
      "系統分析與設計 0728–0729 成果：三個核心任務、介面狀態、可用性測試與 SDD v1。",
    openGraph: {
      title: "校園社團活動與場地智慧管理平台",
      description: "Group05｜三個核心任務、介面狀態與 SDD v1",
      type: "website",
      images: image ? [{ url: image, width: 1536, height: 1024 }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: "校園社團活動與場地智慧管理平台",
      description: "Group05｜三個核心任務、介面狀態與 SDD v1",
      images: image ? [image] : undefined,
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-Hant">
      <body>{children}</body>
    </html>
  );
}
