import Link from "next/link"
import { BrandManager } from "@/components/brand-manager"

export default function AdminPage() {
  return (
    <main className="min-h-screen bg-background px-4 py-8 sm:px-6 sm:py-10">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center text-sm font-medium text-[#8B5A2B] transition hover:text-[#6B4423]"
          >
            ← Retour au calculateur
          </Link>
        </div>

        <BrandManager />
      </div>
    </main>
  )
}