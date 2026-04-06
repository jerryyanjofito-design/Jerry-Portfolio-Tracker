'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function LandingPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to dashboard after a brief delay
    const timer = setTimeout(() => {
      router.push('/dashboard')
    }, 1000)

    return () => clearTimeout(timer)
  }, [router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-500 to-blue-600 flex items-center justify-center">
      <div className="text-center text-white">
        {/* Loading Spinner */}
        <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-6" />

        {/* Brand Text */}
        <h1 className="text-4xl font-bold mb-2 tracking-tight">
          Portfolio Tracker
        </h1>
        <p className="text-blue-100 text-lg mb-8">
          Track your wealth with precision and elegance
        </p>

        {/* Loading Text */}
        <div className="flex items-center justify-center gap-2 text-sm text-blue-200">
          <span>Loading your portfolio</span>
          <span className="animate-bounce">...</span>
        </div>
      </div>
    </div>
  )
}
