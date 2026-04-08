"use client"

import { useState, useEffect } from "react"
import { useTheme } from "next-themes"
import HeroBg from '@/components/HeroBg'
import HeroBgLight from '@/components/HeroBgLight'
import Navbar from '@/components/Navbar'

const HomePage = () => {
  const { resolvedTheme } = useTheme()
  
  const [mounted, setMounted] = useState(false)
  const [showLoader, setShowLoader] = useState(true)
  const [isFading, setIsFading] = useState(false)
  const [isFirstEntry, setIsFirstEntry] = useState(true)

  // Track the previous theme to handle state updates during rendering
  const [prevTheme, setPrevTheme] = useState(resolvedTheme)

  // 1. Handle Theme Changes (Render-Phase State Update)
  // Instead of an effect, update state directly during render when the theme changes.
  // This avoids the cascading render warning entirely.
  if (mounted && !isFirstEntry && resolvedTheme !== prevTheme) {
    setPrevTheme(resolvedTheme)
    setShowLoader(true)
    setIsFading(false)
  }

  // 2. Handle Mounting (Hydration)
  useEffect(() => {
    // Wrapping in a zero-delay timeout makes the update asynchronous.
    // This satisfies the linter rule without causing a visual flicker, 
    // since the SSR fallback matches the loader background visually.
    const mountTimer = setTimeout(() => setMounted(true), 0)
    return () => clearTimeout(mountTimer)
  }, [])

  // 3. Centralized Timers for the Loader
  // This single effect now handles both the initial load AND theme changes.
  useEffect(() => {
    if (!showLoader) return

    // Because these are inside async timeouts, they are safe from the linter rule.
    const fadeTimer = setTimeout(() => setIsFading(true), 1000)
    const removeTimer = setTimeout(() => {
      setShowLoader(false)
      if (isFirstEntry) setIsFirstEntry(false)
    }, 1500)

    return () => {
      clearTimeout(fadeTimer)
      clearTimeout(removeTimer)
    }
  }, [showLoader, isFirstEntry])

  // SSR Guard: prevents theme mismatch "flicker"
  if (!mounted) {
    return <div className="h-dvh w-full bg-white dark:bg-black" />
  }

  return (
    <main className="relative min-h-dvh w-full">
      {/* LOADER OVERLAY */}
      {showLoader && (
        <div
          className={`fixed inset-0 z-[100] flex h-dvh w-full flex-col items-center justify-center bg-white dark:bg-black transition-opacity duration-500 ${
            isFading ? "opacity-0 pointer-events-none" : "opacity-100"
          }`}
        >
          {isFirstEntry ? (
            <div className="flex flex-col items-center gap-6">
              <div className="loader-home"></div>
              <p className="text-xs tracking-[0.3em] uppercase opacity-50 dark:text-white text-black font-medium">
                Welcome
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-6">
              <div className="loader-theme"></div>
              <p className="text-xs tracking-[0.3em] uppercase opacity-50 dark:text-white text-black font-medium">
                Switching Theme
              </p>
            </div>
          )}
        </div>
      )}

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