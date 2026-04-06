import React from 'react'
import { Show, SignInButton, SignUpButton, UserButton } from '@clerk/nextjs'
import { Button } from './ui/button'
import Link from 'next/link'

const Navbar = () => {
    return (
        <nav className="flex justify-between items-center p-4 gap-4 h-16">
            {/* Right */}
            <div>
                <Link href="/">
                    <h2>Pulse</h2>
                </Link>
            </div>

            {/* Center */}
            <div className='flex gap-13'> 
                <Link href="/dashboard">
                    Dashboard
                </Link>
                <Link href="/about">
                    About
                </Link>
                <Link href="/contact">
                    Contact
                </Link>
                <Link href="/pricing">
                    Pricing
                </Link>
            </div>

            {/* Left */}
            <div className='flex gap-4'>
                <Show when="signed-out">
                    <SignInButton>
                        <Button>Sign In</Button>
                    </SignInButton>
                    <SignUpButton>
                        <Button>Sign Up</Button>
                    </SignUpButton>
                </Show>
                <Show when="signed-in">
                    <UserButton />
                </Show>
            </div>
        </nav>
    )
}

export default Navbar