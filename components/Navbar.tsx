"use client";

import { useUser, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { BgAnimateButton } from "./ui/bg-animate-button";
import { ThemeToggle } from "./ThemeToggle"; // ✨ Imported the toggle

const Navbar = () => {
    const { isSignedIn, isLoaded } = useUser();
    const pathname = usePathname();

    if (!isLoaded) return <div className="h-16" />; 

    const navLinks = [
        { href: "/dashboard", label: "Dashboard" },
        { href: "/about", label: "About" },
        { href: "/contact", label: "Contact" },
        { href: "/pricing", label: "Pricing" },
        { href: "/board", label: "Board" },
    ];

    return (
        <nav className="flex justify-between items-center p-4 h-16 bg-transparent rounded-full backdrop-blur-md sticky top-0 z-50">
            {/* Logo area */}
            <Link href="/" className="block">
                <Image
                    src="/logo.png"
                    alt="Pulse Logo"
                    width={80}
                    height={40}
                    priority 
                    className="dark:invert-0 invert transition-all" 
                />
            </Link>

            {/* Navigation Links */}
            <div className="hidden md:flex gap-10 text-base font-medium tracking-wide">
                {navLinks.map((link) => (
                    <Link
                        key={link.href}
                        href={link.href}
                        className={`transition-colors duration-200 ${pathname === link.href
                                ? "text-black dark:text-white font-semibold" 
                                : "text-slate-600 dark:text-slate-300 hover:text-black dark:hover:text-white" 
                            }`}
                    >
                        {link.label}
                    </Link>
                ))}
            </div>

            {/* Auth Buttons & Theme Toggle */}
            <div className="flex gap-4 items-center">
                {/* ✨ Added Theme Toggle here */}
                <ThemeToggle />

                {!isSignedIn ? (
                    <>
                        <SignInButton mode="modal">
                            <BgAnimateButton gradient="ocean" rounded="2xl" animation="spin-slow" className="cursor-pointer font-medium text-white">
                                Sign In
                            </BgAnimateButton>
                        </SignInButton>

                        <SignUpButton mode="modal">
                            <BgAnimateButton gradient="sunset" rounded="2xl" animation="spin-slow" className="cursor-pointer font-medium text-white">
                                Sign Up
                            </BgAnimateButton>
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