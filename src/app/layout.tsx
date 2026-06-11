import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LoveFirst Church",
  description: "Mobile management application for LoveFirst Church instructors and admins.",
};

export const viewport: Viewport = {
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
    <html lang="en" className="h-full bg-gray-100">
      <body className="h-full font-sans antialiased text-gray-900">
        {/* Device wrapper to mimic mobile phone on desktop */}
        <div className="mx-auto min-h-screen max-w-md bg-gray-50 flex flex-col border-x border-gray-200 shadow-sm relative">
          <main className="flex-1 flex flex-col pb-16">{children}</main>
        </div>
      </body>
    </html>
  );
}
