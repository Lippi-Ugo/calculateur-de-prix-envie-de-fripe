"use client"

import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

type AuthUser = {
  email?: string
} | null

export function HomeAuthMenu() {
  const router = useRouter()
  const supabase = createClient()
  const menuRef = useRef<HTMLDivElement | null>(null)

  const [user, setUser] = useState<AuthUser>(null)
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadUser() {
      const { data } = await supabase.auth.getUser()
      setUser(data.user ? { email: data.user.email } : null)
      setLoading(false)
    }

    loadUser()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ? { email: session.user.email } : null)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    document.addEventListener("keydown", handleEscape)

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      document.removeEventListener("keydown", handleEscape)
    }
  }, [])

  async function handleLogout() {
    await supabase.auth.signOut()
    setOpen(false)
    window.location.href = "/"
  }

  if (loading) {
    return (
      <div className="h-10 w-28 animate-pulse rounded-xl bg-[#f3ece2]" />
    )
  }

  if (!user) {
    return (
      <Link
        href="/login"
        className="inline-flex h-10 items-center justify-center rounded-xl bg-[#8B5A2B] px-4 text-sm font-medium text-white transition hover:bg-[#6B4423]"
      >
        Connexion
      </Link>
    )
  }

  const initial = user.email?.[0]?.toUpperCase() ?? "U"

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="inline-flex h-11 items-center gap-3 rounded-xl border border-[#dcc8a4] bg-[#fffdfa] px-3 py-2 text-sm text-[#5c3b1e] shadow-sm transition hover:bg-[#f8f1e7]"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#8B5A2B] text-sm font-semibold text-white">
          {initial}
        </span>

        <span className="hidden text-left sm:block">
          <span className="block text-xs uppercase tracking-[0.14em] text-[#8B5A2B]/75">
            Profil
          </span>
          <span className="block max-w-[180px] truncate text-sm font-medium">
            {user.email}
          </span>
        </span>

        <svg
          className={`h-4 w-4 transition ${open ? "rotate-180" : ""}`}
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.168l3.71-3.938a.75.75 0 1 1 1.08 1.04l-4.25 4.51a.75.75 0 0 1-1.08 0l-4.25-4.51a.75.75 0 0 1 .02-1.06Z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {open ? (
        <div className="absolute right-0 z-50 mt-2 w-64 overflow-hidden rounded-2xl border border-[#e7dfd1] bg-white shadow-[0_18px_50px_rgba(62,43,14,0.12)]">
          <div className="border-b border-[#efe7da] bg-[#fffaf4] px-4 py-3">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#8B5A2B]/70">
              Connecté
            </p>
            <p className="mt-1 truncate text-sm font-medium text-[#5c3b1e]">
              {user.email}
            </p>
          </div>

          <div className="p-2">
            <Link
              href="/admin"
              onClick={() => setOpen(false)}
              className="flex w-full items-center rounded-xl px-3 py-2 text-sm text-[#5c3b1e] transition hover:bg-[#f8f1e7]"
            >
              Accéder à l’administration
            </Link>

            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center rounded-xl px-3 py-2 text-left text-sm text-[#5c3b1e] transition hover:bg-[#f8f1e7]"
            >
              Se déconnecter
            </button>
          </div>
        </div>
      ) : null}
    </div>
  )
}