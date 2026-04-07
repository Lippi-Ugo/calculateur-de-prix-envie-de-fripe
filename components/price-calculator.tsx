"use client"

import { useState, useMemo, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createClient } from "@/lib/supabase/client"

interface Brand {
  id: string
  name: string
  base_price: number
}

const clothingTypes = [
  { id: "veste", label: "Veste", modifier: 0.20 },
  { id: "bas", label: "Bas", modifier: -0.10 },
  { id: "tshirt", label: "T-Shirt", modifier: -0.20 },
  { id: "tenue", label: "Tenue", modifier: 0.10 },
]

const conditions = [
  { id: "neuf", label: "Neuf", modifier: -0.30 },
  { id: "comme-neuf", label: "Comme Neuf", modifier: -0.45 },
  { id: "bon-etat", label: "Bon État", modifier: -0.50 },
  { id: "satisfaisant", label: "Satisfaisant", modifier: -0.60 },
]

export function PriceCalculator() {
  const [brands, setBrands] = useState<Brand[]>([])
  const [selectedBrandId, setSelectedBrandId] = useState<string>("")
  const [clothingType, setClothingType] = useState<string>("")
  const [condition, setCondition] = useState<string>("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchBrands() {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("brands")
        .select("*")
        .order("name")
      
      if (error) {
        console.error("Erreur lors du chargement des marques:", error)
      } else {
        setBrands(data || [])
      }
      setLoading(false)
    }

    fetchBrands()
  }, [])

  const selectedBrand = brands.find(b => b.id === selectedBrandId)

  const calculation = useMemo(() => {
    if (!selectedBrand || !clothingType || !condition) return null

    const price = selectedBrand.base_price

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
    }
  }, [selectedBrand, clothingType, condition])

  const selectedClothing = clothingTypes.find(c => c.id === clothingType)
  const selectedCondition = conditions.find(c => c.id === condition)

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="text-center mb-10">
        <h1 className="font-display text-4xl md:text-5xl text-foreground mb-3 tracking-wide">
          CALCULATEUR DE PRIX
        </h1>
        <p className="text-muted-foreground text-lg">
          Estimez le prix de revente de vos vêtements de marque
        </p>
      </div>

      <Card className="border-2 border-border shadow-lg">
        <CardHeader className="pb-4">
          <CardTitle className="font-display text-2xl text-[#8B5A2B]">
            PARAMÈTRES
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Sélection de la marque */}
          <div className="space-y-2">
            <Label htmlFor="brand" className="text-base font-medium">
              Marque
            </Label>
            <Select value={selectedBrandId} onValueChange={setSelectedBrandId}>
              <SelectTrigger className="h-12 border-2 text-base">
                <SelectValue placeholder={loading ? "Chargement..." : "Sélectionnez une marque"} />
              </SelectTrigger>
              <SelectContent>
                {brands.map((brand) => (
                  <SelectItem key={brand.id} value={brand.id}>
                    {brand.name} - {brand.base_price.toFixed(2)}€
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Type de vêtement */}
          <div className="space-y-2">
            <Label htmlFor="clothing-type" className="text-base font-medium">
              Type de vêtement
            </Label>
            <Select value={clothingType} onValueChange={setClothingType}>
              <SelectTrigger className="h-12 border-2 text-base">
                <SelectValue placeholder="Sélectionnez un type" />
              </SelectTrigger>
              <SelectContent>
                {clothingTypes.map((type) => (
                  <SelectItem key={type.id} value={type.id}>
                    {type.label} ({type.modifier >= 0 ? '+' : ''}{type.modifier * 100}%)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* État */}
          <div className="space-y-2">
            <Label htmlFor="condition" className="text-base font-medium">
              État
            </Label>
            <Select value={condition} onValueChange={setCondition}>
              <SelectTrigger className="h-12 border-2 text-base">
                <SelectValue placeholder="Sélectionnez un état" />
              </SelectTrigger>
              <SelectContent>
                {conditions.map((cond) => (
                  <SelectItem key={cond.id} value={cond.id}>
                    {cond.label} ({cond.modifier * 100}%)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Résultat */}
          <div className="pt-4 border-t border-border">
            {calculation ? (
              <div className="text-center py-6 bg-[#B8860B]/10 rounded-xl">
                <p className="text-sm text-muted-foreground mb-2">Prix estimé</p>
                <span className="font-display text-5xl md:text-6xl text-[#8B5A2B]">
                  {calculation.finalPrice.toFixed(2)}€
                </span>
                <div className="mt-4 text-sm text-muted-foreground space-y-1">
                  <p>Base: {calculation.basePrice.toFixed(2)}€ × 50% = {calculation.afterBase.toFixed(2)}€</p>
                  <p>
                    {selectedClothing?.label}: {calculation.afterBase.toFixed(2)}€ × {selectedClothing?.modifier && selectedClothing.modifier >= 0 ? '+' : ''}{(selectedClothing?.modifier || 0) * 100}% = {calculation.afterClothing.toFixed(2)}€
                  </p>
                  <p>
                    {selectedCondition?.label}: {calculation.afterClothing.toFixed(2)}€ × {(selectedCondition?.modifier || 0) * 100}% = {calculation.finalPrice.toFixed(2)}€
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                <p>Sélectionnez tous les paramètres pour voir le prix</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
