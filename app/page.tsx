import { PriceCalculator } from "@/components/price-calculator"
import { HomeAuthMenu } from "@/components/home-auth-menu"

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 md:px-6 md:py-8">
        <header className="mb-8 flex items-center justify-end">
          <HomeAuthMenu />
        </header>

        <PriceCalculator />
      </div>

      <footer className="mt-6 border-t border-border py-4 text-center">
        <p className="text-sm text-muted-foreground mx-3">
          Calculateur de prix pour vêtements de seconde main
        </p>
      </footer>
    </main>
  )
}