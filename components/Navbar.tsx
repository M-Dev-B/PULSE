"use client";

import { useUser, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { BgAnimateButton } from "./ui/bg-animate-button";




const Navbar = () => {
    const { isSignedIn, isLoaded } = useUser();
    const pathname = usePathname();

    if (!isLoaded) return <div className="h-16" />; // Simple spacer for loading

    const navLinks = [
        { href: "/dashboard", label: "Dashboard" },
        { href: "/about", label: "About" },
        { href: "/contact", label: "Contact" },
        { href: "/pricing", label: "Pricing" },
    ];

    return (
        <nav className="flex justify-between items-center p-4 h-16 bg-transparent rounded-full backdrop-blur-md sticky top-0 z-50">
            <Link href="/" className="font-semibold text-xl text-slate-900">
                <Image src="/logo.png" alt="Logo" width={50} height={50} />
            </Link>

            <div className="hidden md:flex gap-10 text-lg font-bold">
                {navLinks.map((link) => (
                    <Link
                        key={link.href}
                        href={link.href}
                        className={`transition-colors ${pathname === link.href ? "text-slate-900 font-medium" : "text-slate-900/70 hover:text-slate-900"}`}
                    >
                        {link.label}
                    </Link>
                ))}
            </div>

            <div className="flex gap-3 items-center">
                {!isSignedIn ? (
                    <>
                        <SignInButton mode="modal">
                            <BgAnimateButton gradient="ocean" rounded="2xl" animation="spin-slow" className="cursor-pointer">Sign In</BgAnimateButton>
                        </SignInButton>

                        <SignUpButton mode="modal">
                            <BgAnimateButton gradient="sunset" rounded="2xl" animation="spin-slow" className="cursor-pointer">Sign Up</BgAnimateButton>
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