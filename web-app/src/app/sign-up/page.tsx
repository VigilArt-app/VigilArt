"use client"

import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { useTranslation } from "react-i18next"

export default function SignUpPage() {
  const [email, setEmail] = useState("")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { t } = useTranslation()

  const router = useRouter()

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (password !== confirmPassword) {
      setError(t("signup_page.error_passwords_no_match"))
      return
    }
    setIsLoading(true)
    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL
      const res = await fetch(`${API_BASE}/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, firstName, lastName })
      })
      if (!res.ok) {
        const data = await res.json().catch(() => null)
        const message = data?.message || t("signup_page.error_signup_failed")
        throw new Error(Array.isArray(message) ? message.join(", ") : message)
      }
      router.push("/login")
    } catch (err: any) {
      setError(err.message || t("signup_page.error_unexpected"))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-neutral-900">
      <div className="w-full max-w-6xl mx-6 rounded-lg overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2">
          <div className="relative flex items-center justify-start p-12 overflow-hidden bg-white dark:bg-neutral-900/30">
            <div className="relative z-10 max-w-xs md:max-w-md">
              <p className="text-3xl md:text-4xl text-foreground">{t("sign_up_page.welcome")}</p>
              <p className="text-2xl md:text-3xl text-foreground">{t("sign_up_page.on")}</p>
              <h1 className="text-6xl md:text-9xl font-giaza tracking-tight text-foreground">VigilArt</h1>
            </div>
          </div>

          <div className="flex items-center justify-center p-8 bg-transparent relative z-20">
            <div className="w-full max-w-md rounded-2xl p-8 shadow-lg border border-transparent backdrop-blur-sm bg-white/95 dark:bg-neutral-800/60 text-foreground">
                <div className="mb-4 flex items-center gap-3 justify-between">
                    <img src="/vigilart_b.png" alt="VigilArt logo" className="h-20 w-auto dark:hidden" />
                    <img src="/vigilart_w.png" alt="VigilArt logo" className="h-20 w-auto hidden dark:block" />
                    <div className="text-l text-muted-foreground">{t("sign_up_page.ready_to_sign_up")}</div>
                </div>

              <form onSubmit={onSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="firstName" className="mb-2">{t("sign_up_page.first_name")}</Label>
                    <Input id="firstName" type="text" placeholder="John" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                  </div>
                  <div>
                    <Label htmlFor="lastName" className="mb-2">{t("sign_up_page.last_name")}</Label>
                    <Input id="lastName" type="text" placeholder="Doe" value={lastName} onChange={(e) => setLastName(e.target.value)} />
                  </div>
                </div>
                <div>
                  <Label htmlFor="email" className="mb-2">{t("sign_up_page.email")}</Label>
                  <Input id="email" type="email" placeholder={t("sign_up_page.placeholder_email")} value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>

                <div>
                  <Label htmlFor="password" className="mb-2">{t("sign_up_page.password")}</Label>
                  <Input id="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>

                <div>
                  <Label htmlFor="confirm" className="mb-2">{t("sign_up_page.confirm_password")}</Label>
                  <Input id="confirm" type="password" placeholder="••••••••" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                </div>

                {error && (
                  <div className="text-sm text-red-500" role="alert">{error}</div>
                )}
                <div>
                  <Button type="submit" className="w-full" disabled={isLoading}>{isLoading ? t("sign_up_page.signing_up") : t("sign_up_page.sign_up")}</Button>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px bg-muted-foreground/30" />
                  <div className="text-sm text-muted-foreground">{t("sign_up_page.or")}</div>
                  <div className="flex-1 h-px bg-muted-foreground/30" />
                </div>

                <div>
                  <Button type="button" className="w-full">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 mr-2">
                      <path d="M21.35 11.1H12v2.8h5.35c-.24 1.4-1.02 2.6-2.18 3.4v2.8h3.52C20.6 19.1 22 15.4 22 12c0-.6-.05-1.2-.15-1.9z" />
                      <path d="M12 22c2.7 0 4.95-.9 6.6-2.45l-3.52-2.8c-.98.66-2.25 1.05-3.08 1.05-2.36 0-4.36-1.6-5.08-3.75H3.28v2.35C4.92 19.95 8.24 22 12 22z" />
                      <path d="M6.92 13.05A6.99 6.99 0 0 1 6.6 12c0-.35.05-.7.12-1.05V8.6H3.28A9.98 9.98 0 0 0 2 12c0 1.6.38 3.08 1.05 4.4l3.87-3.35z" />
                      <path d="M12 6.5c1.46 0 2.77.5 3.8 1.48l2.85-2.85C16.94 3.6 14.7 2.5 12 2.5 8.24 2.5 4.92 4.55 3.28 7.55l3.84 2.9C7.64 8.1 9.64 6.5 12 6.5z" />
                    </svg>
                    {t("sign_up_page.sign_up_with_google")}
                  </Button>
                </div>
              </form>

              <div className="mt-4 text-center text-sm">
                {t("sign_up_page.already_have_account")} <Link href="/login" className="text-primary underline underline-offset-2">{t("sign_up_page.sign_in")}</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
