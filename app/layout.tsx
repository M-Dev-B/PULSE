import { Geist, Geist_Mono, Source_Sans_3, Montserrat } from "next/font/google"

import type { Metadata } from 'next'
import { ClerkProvider, Show, SignInButton, SignUpButton, UserButton } from '@clerk/nextjs'
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { cn } from "@/lib/utils";

const montserratHeading = Montserrat({subsets:['latin'],variable:'--font-heading'});

const sourceSans3 = Source_Sans_3({subsets:['latin'],variable:'--font-sans'})

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export const metadata: Metadata = {
  title: "Pulse — Collaborative Whiteboard",
  description: "Real-time whiteboard with AI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("antialiased", fontMono.variable, "font-sans", sourceSans3.variable, montserratHeading.variable)}
    >
      <body>
        <ClerkProvider>
          <ThemeProvider>{children}</ThemeProvider>
        </ClerkProvider>
        
      </body>
    </html>
  )
}
