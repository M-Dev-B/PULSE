"use client"

import React, { useEffect, useState } from 'react'
import { useTheme } from "next-themes"
import HeroBg from '@/components/HeroBg'
import HeroBgLight from '@/components/HeroBgLight'
import Navbar from '@/components/Navbar'

const HomePage = () => {
  const { resolvedTheme } = useTheme()

  return (
    <main className="relative min-h-dvh w-full">
      {/* Background Layer */}
      <div className="fixed inset-0 -z-10 h-dvh w-full">
        {resolvedTheme === 'dark' ? <HeroBg /> : <HeroBgLight />}
      </div>

      {/* Content Layer */}
      <div className="relative z-10">
        <Navbar />
      </div>
    </main>
  )
}

export default HomePage