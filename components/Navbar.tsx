"use client";

import { useUser, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import { Button } from "./ui/button";
import Link from "next/link";
import { usePathname } from "next/navigation";

const Navbar = () => {
    const { isSignedIn, isLoaded } = useUser();
    const pathname = usePathname();

    // Prevent layout shift (better than returning null)
    if (!isLoaded) {
        return (
            <nav className="flex justify-between items-center p-4 h-16 border-b">
                <div className="h-6 w-24 bg-muted animate-pulse rounded" />
                <div className="h-6 w-64 bg-muted animate-pulse rounded" />
                <div className="h-8 w-24 bg-muted animate-pulse rounded" />
            </nav>
        );
    }

    const navLinks = [
        { href: "/dashboard", label: "Dashboard" },
        { href: "/about", label: "About" },
        { href: "/contact", label: "Contact" },
        { href: "/pricing", label: "Pricing" },
    ];

    return (
        <nav className="flex justify-between items-center p-4 gap-4 h-16 border-b bg-background/80 backdrop-blur-xl sticky top-0 z-50">
            {/* Logo */}
            <Link href="/" className="font-semibold text-lg">
                Pulse
            </Link>

            {/* Center */}
            <div className="hidden md:flex gap-10 text-sm">
                {navLinks.map((link) => (
                    <Link
                        key={link.href}
                        href={link.href}
                        className={`transition-colors ${pathname === link.href
                                ? "text-primary font-medium"
                                : "text-muted-foreground hover:text-foreground"
                            }`}
                    >
                        {link.label}
                    </Link>
                ))}
            </div>

            {/* Auth */}
            <div className="flex gap-3 items-center">
                {!isSignedIn ? (
                    <>
                        <SignInButton mode="modal">
                            <Button variant="ghost">Sign In</Button>
                        </SignInButton>

                        <SignUpButton mode="modal">
                            <Button>Get Started</Button>
                        </SignUpButton>
                    </>
                ) : (
                    <UserButton />
                )}
            </div>
        </nav>
    );
};

export default Navbar;