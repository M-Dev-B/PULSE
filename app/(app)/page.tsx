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

  const [prevTheme, setPrevTheme] = useState(resolvedTheme)

  if (mounted && !isFirstEntry && resolvedTheme !== prevTheme) {
    setPrevTheme(resolvedTheme)
    setShowLoader(true)
    setIsFading(false)
  }

  useEffect(() => {

    const mountTimer = setTimeout(() => setMounted(true), 0)
    return () => clearTimeout(mountTimer)
  }, [])

  useEffect(() => {
    if (!showLoader) return

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