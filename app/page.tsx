import Link from "next/link"
import { PriceCalculator } from "@/components/price-calculator"

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 md:py-12">
        <PriceCalculator />
      </div>
      
      <footer className="py-6 text-center border-t border-border">
        <p className="text-sm text-muted-foreground">
          Calculateur de prix pour vêtements de seconde main
        </p>
        <Link href="/admin" className="text-sm text-gold hover:text-gold-light mt-2 inline-block">
          Administration
        </Link>
      </footer>
    </main>
  )
}
