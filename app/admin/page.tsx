import Link from "next/link"
import { redirect } from "next/navigation"
import { BrandManager } from "@/components/brand-manager"
import { createClient } from "@/lib/supabase/server"
import LogoutButton from "./logout-button"

export default async function AdminPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  return (
    <main className="min-h-screen bg-background px-4 py-8 sm:px-6 sm:py-10">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <Link
              href="/"
              className="inline-flex items-center text-sm font-medium text-[#8B5A2B] transition hover:text-[#6B4423]"
            >
              ← Retour au calculateur
            </Link>

            <p className="text-sm text-muted-foreground">
              Connecté avec : <span className="font-medium">{user.email}</span>
            </p>
          </div>

          <LogoutButton />
        </div>

        <BrandManager />
      </div>
    </main>
  )
}