"use client"

import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

export default function LogoutButton() {
  const router = useRouter()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/login")
    router.refresh()
  }

  return (
    <button
      onClick={handleLogout}
      className="inline-flex h-10 items-center justify-center rounded-xl bg-[#8B5A2B] px-4 text-sm font-medium text-white transition hover:bg-[#6B4423]"
    >
      Se déconnecter
    </button>
  )
}