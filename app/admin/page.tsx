import { BrandManager } from "@/components/brand-manager"
import Link from "next/link"

export default function AdminPage() {
  return (
    <main className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-4xl mx-auto mb-6">
        <Link 
          href="/" 
          className="text-[#8B5A2B] hover:text-[#6B4423] font-medium"
        >
          Retour au calculateur
        </Link>
      </div>
      <BrandManager />
    </main>
  )
}
