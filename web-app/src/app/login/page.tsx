"use client"

import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { Switch } from "../../components/ui/switch"
import { authenticatedFetch } from "@/src/utils/auth/authenticatedFetch"

export default function LoginPage() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [remember, setRemember] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const router = useRouter()

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault()
        setError(null)
        setIsLoading(true)
        try {
            const res = await authenticatedFetch(`/auth/login`, {
                method: "POST",
                body: JSON.stringify({ email, password })
            }, true);
            if (!res.ok) {
                const data = await res.json().catch(() => null)
                const message = data?.message || "Login failed"
                throw new Error(Array.isArray(message) ? message.join(", ") : message)
            }
            router.push("/dashboard")
        } catch (err: any) {
            setError(err.message || "Unexpected error")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-white dark:bg-neutral-900">
            <div className="w-full max-w-6xl mx-6 rounded-lg overflow-hidden">
                <div className="grid grid-cols-1 md:grid-cols-2">
                    <div className="relative flex items-center justify-start p-12 bg-white dark:bg-neutral-900/30">
                        <div className="relative z-10 max-w-xs md:max-w-md">
                            <p className="text-3xl md:text-4xl text-foreground">Bienvenue</p>
                            <p className="text-2xl md:text-3xl text-foreground">sur</p>
                            <h1 className="text-6xl md:text-9xl font-giaza tracking-tight text-foreground">VigilArt</h1>
                        </div>
                    </div>

                    <div className="flex items-center justify-center p-8 bg-transparent">
                        <div className="w-full max-w-md rounded-2xl p-8 shadow-lg border border-transparent backdrop-blur-sm bg-white/95 dark:bg-neutral-800/60 text-foreground">
                            <div className="mb-4 flex items-center gap-3 justify-between">
                                <img src="/vigilart_b.png" alt="VigilArt logo" className="h-20 w-auto dark:hidden" />
                                <img src="/vigilart_w.png" alt="VigilArt logo" className="h-20 w-auto hidden dark:block" />
                                <div className="text-l text-muted-foreground">Nice to see you again</div>
                            </div>

                            <form onSubmit={onSubmit} className="space-y-4">
                                <div>
                                    <Label htmlFor="email" className="mb-2">Login</Label>
                                    <Input id="email" type="email" placeholder="johndoe@example.eu" value={email} onChange={(e) => setEmail(e.target.value)}/>
                                </div>

                                <div>
                                    <Label htmlFor="password" className="mb-2">Password</Label>
                                    <Input id="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)}/>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <Switch checked={remember} onCheckedChange={(val) => setRemember(Boolean(val))} aria-label="Remember me" />
                                        <span className="text-sm">Remember me</span>
                                    </div>
                                    <Link href="#" className="text-sm text-primary">
                                        Forgot password?
                                    </Link>
                                </div>

                                {error && (
                                    <div className="text-sm text-red-500" role="alert">{error}</div>
                                )}
                                <div>
                                    <Button type="submit" className="w-full" disabled={isLoading}>
                                        {isLoading ? "Signing in..." : "Sign in"}
                                    </Button>
                                </div>

                                <div className="flex items-center gap-3">
                                    <div className="flex-1 h-px bg-muted-foreground/30" />
                                    <div className="text-sm text-muted-foreground">or</div>
                                    <div className="flex-1 h-px bg-muted-foreground/30" />
                                </div>

                                <div>
                                    <Button type="button" className="w-full" >
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 mr-2" >
                                            <path d="M21.35 11.1H12v2.8h5.35c-.24 1.4-1.02 2.6-2.18 3.4v2.8h3.52C20.6 19.1 22 15.4 22 12c0-.6-.05-1.2-.15-1.9z" />
                                            <path d="M12 22c2.7 0 4.95-.9 6.6-2.45l-3.52-2.8c-.98.66-2.25 1.05-3.08 1.05-2.36 0-4.36-1.6-5.08-3.75H3.28v2.35C4.92 19.95 8.24 22 12 22z" />
                                            <path d="M6.92 13.05A6.99 6.99 0 0 1 6.6 12c0-.35.05-.7.12-1.05V8.6H3.28A9.98 9.98 0 0 0 2 12c0 1.6.38 3.08 1.05 4.4l3.87-3.35z" />
                                            <path d="M12 6.5c1.46 0 2.77.5 3.8 1.48l2.85-2.85C16.94 3.6 14.7 2.5 12 2.5 8.24 2.5 4.92 4.55 3.28 7.55l3.84 2.9C7.64 8.1 9.64 6.5 12 6.5z" />
                                        </svg>
                                        Or Sign in with Google
                                    </Button>
                                </div>
                            </form>

                            <div className="mt-4 text-center text-sm">
                                Don&apos;t have an account? <Link href="/sign-up" className="text-primary underline underline-offset-2">Sign up now</Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}