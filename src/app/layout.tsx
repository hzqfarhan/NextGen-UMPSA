import type { Metadata, Viewport } from "next";
// import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { CoachFAB } from "@/components/layout/CoachFAB";
import { SplashScreen } from "@/components/layout/SplashScreen";
import { GlobalBackground } from "@/components/layout/GlobalBackground";
import { StoreSyncHandler } from "@/components/layout/StoreSyncHandler";

const inter = { className: "font-sans" };


const baseUrl = process.env.NEXT_PUBLIC_APP_URL
  ? process.env.NEXT_PUBLIC_APP_URL
  : process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: "BeU NextGen",
  description: "AI-powered financial companion for youth money habits.",
  icons: {
    icon: "/assets/NEXTGEN.png",
    shortcut: "/assets/NEXTGEN.png",
    apple: "/assets/NEXTGEN.png",
  },
  openGraph: {
    title: "BeU NextGen",
    description: "Spend smarter, save better, and understand money before it becomes a problem.",
    url: "/",
    siteName: "BeU NextGen",
    images: [
      {
        url: "/assets/NEXTGEN.png",
        width: 1200,
        height: 630,
        alt: "BeU NextGen Logo",
      },
    ],
    locale: "ms_MY",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "BeU NextGen",
    description: "Spend smarter, save better, and understand money before it becomes a problem.",
    images: ["/assets/NEXTGEN.png"],
  },
  appleWebApp: {
    title: "BeU NextGen",
    statusBarStyle: "default",
    capable: true,
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: "#DF0059",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-background text-foreground min-h-screen selection:bg-primary/30`}>
        <StoreSyncHandler />
        <GlobalBackground />
        <main className="min-h-screen">
          <SplashScreen />
          {children}
        </main>
        <CoachFAB />
        <Navbar />
      </body>
    </html>
  );
}

