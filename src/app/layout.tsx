import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { RegisterSW } from "@/components/register-sw";
import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Due",
  description: "Assignment and form deadlines for your batch, with reminders.",
  appleWebApp: { capable: true, title: "Due", statusBarStyle: "black-translucent" },
  icons: { apple: "/icons/due-apple-180.png" },
};

export const viewport: Viewport = {
  themeColor: "#050506",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} antialiased`}>
        {children}
        <RegisterSW />
      </body>
    </html>
  );
}
