"use client";

import { LiveblocksProvider } from "@liveblocks/react";
import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "sonner";


export default function Providers({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <ClerkProvider>
            <LiveblocksProvider publicApiKey={process.env.NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY!}>
                <ThemeProvider
                    attribute="class"
                    defaultTheme="dark"
                    enableSystem
                    disableTransitionOnChange
                >
                    <Toaster position="top-center" richColors closeButton />
                    {children}
                </ThemeProvider>
            </LiveblocksProvider>
        </ClerkProvider>
    );
}