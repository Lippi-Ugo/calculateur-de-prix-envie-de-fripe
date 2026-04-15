import Link from "next/link"
import { PriceCalculator } from "@/components/price-calculator"

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 md:py-12">
        <PriceCalculator />
      </div>

      <footer className="border-t border-border py-6 text-center">
        <p className="text-sm text-muted-foreground">
          Calculateur de prix pour vêtements de seconde main
        </p>
        <Link
          href="/admin"
          className="mt-2 inline-block text-sm text-gold hover:text-gold-light"
        >
          Administration
        </Link>
      </footer>
    </main>
  )
}