"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { logout } from "../../utils/auth/auth"

export default function LogoutPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const performLogout = async () => {
      try {
        await logout()
        router.replace("/login")
      } catch (err: any) {
        setError(err.message)
        console.error("Logout error:", err)
        router.replace("/login")
      }
    }

    performLogout()
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      {error ? (
        <p className="text-red-500">Error logging out: {error}</p>
      ) : (
        <p>Logging out…</p>
      )}
    </div>
  )
}
