"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { deleteCookie } from "../cookies"

export default function LogoutPage() {
  const router = useRouter()

  useEffect(() => {
    try {
      deleteCookie("auth_token")
      try { localStorage.removeItem("auth_token") } catch {}
      try { sessionStorage.removeItem("auth_token") } catch {}
    } finally {
      router.replace("/login")
    }
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p>Logging out…</p>
    </div>
  )
}
