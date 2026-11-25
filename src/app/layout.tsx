import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import { RegisterSW } from "@/components/register-sw";
import "./globals.css";

const geist = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Due",
  description: "Assignment and form deadlines for your batch, with reminders.",
  appleWebApp: { capable: true, title: "Due", statusBarStyle: "default" },
  icons: { apple: "/icons/apple-touch-icon.png" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f5f3ee" },
    { media: "(prefers-color-scheme: dark)", color: "#101216" },
  ],
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${geist.variable} antialiased`}>
        {children}
        <RegisterSW />
      </body>
    </html>
  );
}
