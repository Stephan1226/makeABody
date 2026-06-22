import type { Metadata, Viewport } from "next";
import "./globals.css";
import BottomNav from "@/components/BottomNav";
import ChangelogGate from "@/components/ChangelogGate";
import InstallPrompt from "@/components/InstallPrompt";

export const metadata: Metadata = {
  title: "makeABody",
  description: "나만의 다이어트 로드맵 트래커",
  manifest: "/manifest.json",
  icons: {
    icon: "/icon-192.png",
    apple: "/apple-touch-icon.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "makeABody",
  },
};

export const viewport: Viewport = {
  themeColor: "#F2F4F6",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>
        {/* 모바일 우선: 가운데 정렬된 최대폭 컨테이너 */}
        <div className="mx-auto flex min-h-[100dvh] w-full max-w-[480px] flex-col">
          <main className="flex-1 px-5 pb-28 pt-[max(1rem,env(safe-area-inset-top))]">
            <InstallPrompt />
            <ChangelogGate />
            {children}
          </main>
          <BottomNav />
        </div>
      </body>
    </html>
  );
}
