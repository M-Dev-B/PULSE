import type { Metadata } from 'next';
import { Montserrat, Source_Sans_3, Geist_Mono } from 'next/font/google';
import "./globals.css";
import { ClerkProvider } from '@clerk/nextjs';
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "sonner";
import { cn } from "@/lib/utils";

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
      <body className="font-sans">   {/* Default to body font */}
        <ClerkProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"        // Pulse looks best in dark mode
            enableSystem={true}
            disableTransitionOnChange
          >
            <Toaster position="top-center" richColors closeButton />
            {children}
          </ThemeProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}