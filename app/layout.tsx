import type { Metadata } from 'next';
import { Montserrat, Source_Sans_3, Geist_Mono } from 'next/font/google';
import "./globals.css";
import { cn } from "@/lib/utils";
import Providers from '@/components/Providers';


const montserratHeading = Montserrat({
  subsets: ['latin'],
  variable: '--font-heading',
  weight: ['500', '600', '700'],
});

const sourceSans3 = Source_Sans_3({
  subsets: ['latin'],
  variable: '--font-sans',
  weight: ['400', '500', '600'],
});

const fontMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
});

export const metadata: Metadata = {
  title: "Pulse — Collaborative AI Whiteboard",
  description: "Real-time collaborative whiteboard with Excalidraw + Liveblocks + AI",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "antialiased",
        sourceSans3.variable,      // --font-sans
        montserratHeading.variable, // --font-heading
        fontMono.variable           // --font-mono (useful later)
      )}
    >
      <body className="font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}