"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

const clothingTypes = [
  { id: "veste", label: "Veste", modifier: 0.20, icon: "🧥" },
  { id: "bas", label: "Bas", modifier: -0.10, icon: "👖" },
  { id: "tshirt", label: "T-Shirt", modifier: -0.20, icon: "👕" },
  { id: "tenue", label: "Tenue", modifier: 0.10, icon: "👔" },
]

const conditions = [
  { id: "neuf", label: "Neuf", modifier: -0.30, description: "Jamais porté, avec étiquette" },
  { id: "comme-neuf", label: "Comme Neuf", modifier: -0.45, description: "Porté 1-2 fois, parfait état" },
  { id: "bon-etat", label: "Bon État", modifier: -0.50, description: "Légères traces d'usure" },
  { id: "satisfaisant", label: "Satisfaisant", modifier: -0.60, description: "Usure visible mais fonctionnel" },
]

export function PriceCalculator() {
  const [basePrice, setBasePrice] = useState<string>("")
  const [clothingType, setClothingType] = useState<string>("veste")
  const [condition, setCondition] = useState<string>("neuf")

  const calculation = useMemo(() => {
    const price = parseFloat(basePrice) || 0
    if (price <= 0) return null

    // Étape 1: 50% du prix de base
    const step1 = price * 0.50

    // Étape 2: Modificateur type de vêtement
    const clothingMod = clothingTypes.find(c => c.id === clothingType)?.modifier || 0
    const step2 = step1 * (1 + clothingMod)

    // Étape 3: Modificateur état
    const conditionMod = conditions.find(c => c.id === condition)?.modifier || 0
    const finalPrice = step2 * (1 + conditionMod)

    return {
      basePrice: price,
      afterBase: step1,
      afterClothing: step2,
      finalPrice: Math.round(finalPrice * 100) / 100,
      clothingModifier: clothingMod,
      conditionModifier: conditionMod,
    }
  }, [basePrice, clothingType, condition])

  const selectedClothing = clothingTypes.find(c => c.id === clothingType)
  const selectedCondition = conditions.find(c => c.id === condition)

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="text-center mb-10">
        <h1 className="font-display text-4xl md:text-5xl text-foreground mb-3 tracking-wide">
          CALCULATEUR DE PRIX
        </h1>
        <p className="text-muted-foreground text-lg">
          Estimez le prix de revente de vos vêtements de marque
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Formulaire */}
        <Card className="border-2 border-border shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="font-display text-2xl text-gold-dark">
              PARAMÈTRES
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Prix de base */}
            <div className="space-y-2">
              <Label htmlFor="base-price" className="text-base font-medium">
                Prix de base (marque)
              </Label>
              <div className="relative">
                <Input
                  id="base-price"
                  type="number"
                  placeholder="Entrez le prix original"
                  value={basePrice}
                  onChange={(e) => setBasePrice(e.target.value)}
                  className="text-lg h-12 pr-10 border-2 focus:border-gold focus:ring-gold"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">
                  €
                </span>
              </div>
            </div>

            {/* Type de vêtement */}
            <div className="space-y-3">
              <Label className="text-base font-medium">Type de vêtement</Label>
              <RadioGroup
                value={clothingType}
                onValueChange={setClothingType}
                className="grid grid-cols-2 gap-3"
              >
                {clothingTypes.map((type) => (
                  <div key={type.id}>
                    <RadioGroupItem
                      value={type.id}
                      id={type.id}
                      className="peer sr-only"
                    />
                    <Label
                      htmlFor={type.id}
                      className="flex flex-col items-center justify-center rounded-lg border-2 border-border bg-card p-4 cursor-pointer transition-all hover:border-gold peer-data-[state=checked]:border-gold peer-data-[state=checked]:bg-gold/10"
                    >
                      <span className="text-2xl mb-1">{type.icon}</span>
                      <span className="font-medium">{type.label}</span>
                      <span className={`text-sm ${type.modifier >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                        {type.modifier >= 0 ? '+' : ''}{type.modifier * 100}%
                      </span>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            {/* État */}
            <div className="space-y-3">
              <Label className="text-base font-medium">État du vêtement</Label>
              <RadioGroup
                value={condition}
                onValueChange={setCondition}
                className="space-y-2"
              >
                {conditions.map((cond) => (
                  <div key={cond.id}>
                    <RadioGroupItem
                      value={cond.id}
                      id={cond.id}
                      className="peer sr-only"
                    />
                    <Label
                      htmlFor={cond.id}
                      className="flex items-center justify-between rounded-lg border-2 border-border bg-card p-4 cursor-pointer transition-all hover:border-gold peer-data-[state=checked]:border-gold peer-data-[state=checked]:bg-gold/10"
                    >
                      <div>
                        <span className="font-medium">{cond.label}</span>
                        <p className="text-sm text-muted-foreground">{cond.description}</p>
                      </div>
                      <span className="text-red-500 font-medium">
                        {cond.modifier * 100}%
                      </span>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          </CardContent>
        </Card>

        {/* Résultat */}
        <div className="space-y-6">
          <Card className="border-2 border-gold bg-card shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="font-display text-2xl text-gold-dark">
                PRIX ESTIMÉ
              </CardTitle>
            </CardHeader>
            <CardContent>
              {calculation ? (
                <div className="space-y-4">
                  <div className="text-center py-6 bg-gold/10 rounded-xl">
                    <span className="font-display text-5xl md:text-6xl text-gold-dark">
                      {calculation.finalPrice.toFixed(2)}€
                    </span>
                  </div>
                </div>
              ) : (
                <div className="text-center py-10 text-muted-foreground">
                  <p className="text-lg">Entrez un prix de base pour voir le résultat</p>
                </div>
              )}
            </CardContent>
          </Card>

          {calculation && (
            <Card className="border-2 border-border shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="font-display text-xl text-gold-dark">
                  DÉTAIL DU CALCUL
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-border">
                  <span className="text-muted-foreground">Prix de base</span>
                  <span className="font-medium">{calculation.basePrice.toFixed(2)}€</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border">
                  <span className="text-muted-foreground">Base de calcul (50%)</span>
                  <span className="font-medium">{calculation.afterBase.toFixed(2)}€</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border">
                  <span className="text-muted-foreground">
                    Type: {selectedClothing?.label} ({selectedClothing?.modifier && selectedClothing.modifier >= 0 ? '+' : ''}{(selectedClothing?.modifier || 0) * 100}%)
                  </span>
                  <span className="font-medium">{calculation.afterClothing.toFixed(2)}€</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border">
                  <span className="text-muted-foreground">
                    État: {selectedCondition?.label} ({(selectedCondition?.modifier || 0) * 100}%)
                  </span>
                  <span className="font-medium text-gold-dark">{calculation.finalPrice.toFixed(2)}€</span>
                </div>
                
                <div className="mt-4 p-4 bg-secondary/50 rounded-lg">
                  <p className="text-sm text-muted-foreground text-center">
                    <strong>Formule:</strong> Prix × 50% × (1 + modificateur vêtement) × (1 + modificateur état)
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
