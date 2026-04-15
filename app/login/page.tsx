"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError("")

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError("Email ou mot de passe incorrect.")
      setLoading(false)
      return
    }

    window.location.href = "/"
  }

  return (
    <main className="min-h-screen bg-background px-4 py-8 sm:px-6 sm:py-10">
      <div className="mx-auto flex min-h-[80vh] max-w-md items-center justify-center">
        <div className="w-full overflow-hidden rounded-2xl border border-[#e7dfd1] bg-white/95 shadow-[0_18px_50px_rgba(62,43,14,0.08)] backdrop-blur">
          <div className="border-b border-[#efe7da] bg-gradient-to-b from-[#fffdfa] to-[#f8f3ea] px-5 py-6 sm:px-8">
            <div className="mb-2 inline-flex w-fit rounded-full border border-[#dcc8a4] bg-[#fbf6ed] px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-[#8B5A2B]">
              Admin
            </div>
            <h1 className="font-display text-2xl text-[#8B5A2B] sm:text-3xl">
              Connexion
            </h1>
            <p className="mt-2 text-sm leading-6 text-muted-foreground sm:text-base">
              Connectez-vous pour accéder à l’espace administrateur.
            </p>
          </div>

          <div className="space-y-5 px-5 py-6 sm:px-8 sm:py-8">
            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-semibold text-foreground">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="test@exemple.com"
                  required
                  className="h-12 w-full rounded-xl border border-[#d9cfbf] bg-[#fffdfa] px-4 text-base outline-none transition focus:border-[#8B5A2B]"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-semibold text-foreground">
                  Mot de passe
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Votre mot de passe"
                  required
                  className="h-12 w-full rounded-xl border border-[#d9cfbf] bg-[#fffdfa] px-4 text-base outline-none transition focus:border-[#8B5A2B]"
                />
              </div>

              {error ? (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              ) : null}

              <button
                type="submit"
                disabled={loading}
                className="h-12 w-full rounded-xl bg-[#8B5A2B] text-base font-medium text-white transition hover:bg-[#6f451f] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? "Connexion..." : "Se connecter"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </main>
  )
}