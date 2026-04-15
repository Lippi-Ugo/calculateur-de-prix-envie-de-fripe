"use client"

import { useEffect, useMemo, useState } from "react"
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
  { id: "veste", label: "Veste", modifier: 0.2 },
  { id: "bas", label: "Bas", modifier: -0.1 },
  { id: "tshirt", label: "T-Shirt", modifier: -0.2 },
  { id: "tenue", label: "Tenue", modifier: 0.1 },
  { id: "chaussures", label: "Chaussures", modifier: 0.15 },
  { id: "sac", label: "Sac à Main", modifier: 0.05 },
]

const shoeGroups = [
  {
    label: "Mixte",
    items: [
      { id: "basket", label: "Basket", modifier: 0 },
      { id: "autres", label: "Autres", modifier: -0.1 },
    ],
  },
  {
    label: "Femme",
    items: [
      { id: "botte-bottine", label: "Botte / Bottine", modifier: 0.1 },
      { id: "talon", label: "Chaussure à talon", modifier: 0.05 },
      { id: "plate", label: "Plate", modifier: -0.05 },
      { id: "sandales", label: "Sandales", modifier: -0.15 },
    ],
  },
  {
    label: "Homme",
    items: [
      { id: "montante", label: "Chaussure Montante", modifier: 0.1 },
      { id: "ville", label: "Chaussure Ville", modifier: -0.05 },
    ],
  },
]

const conditions = [
  { id: "neuf", label: "Neuf", modifier: -0.3 },
  { id: "comme-neuf", label: "Comme neuf", modifier: -0.45 },
  { id: "bon-etat", label: "Bon état", modifier: -0.5 },
  { id: "satisfaisant", label: "Satisfaisant", modifier: -0.6 },
]

export function PriceCalculator() {
  const [brands, setBrands] = useState<Brand[]>([])
  const [selectedBrandId, setSelectedBrandId] = useState("")
  const [clothingType, setClothingType] = useState("")
  const [shoeType, setShoeType] = useState("")
  const [condition, setCondition] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchBrands() {
      const supabase = createClient()
      const { data, error } = await supabase.from("brands").select("*").order("name")

      if (error) {
        console.error("Erreur lors du chargement des marques :", error)
      } else {
        setBrands(data || [])
      }

      setLoading(false)
    }

    fetchBrands()
  }, [])

  const selectedBrand = brands.find((brand) => brand.id === selectedBrandId)

  const shoeModifier = useMemo(() => {
    if (!shoeType) return 0

    for (const group of shoeGroups) {
      const found = group.items.find((item) => item.id === shoeType)
      if (found) return found.modifier
    }

    return 0
  }, [shoeType])

  const finalPrice = useMemo(() => {
    if (!selectedBrand || !clothingType || !condition) return null
    if (clothingType === "chaussures" && !shoeType) return null

    const price = selectedBrand.base_price
    const step1 = price * 0.5
    const clothingMod = clothingTypes.find((item) => item.id === clothingType)?.modifier || 0
    const conditionMod = conditions.find((item) => item.id === condition)?.modifier || 0

    let step2 = step1 * (1 + clothingMod)

    if (clothingType === "chaussures") {
      step2 = step2 * (1 + shoeModifier)
    }

    return Math.round(step2 * (1 + conditionMod) * 100) / 100
  }, [selectedBrand, clothingType, shoeType, condition, shoeModifier])

  return (
    <Card className="overflow-hidden border border-[#e7dfd1] bg-white/95 shadow-[0_18px_50px_rgba(62,43,14,0.08)] backdrop-blur">
      <CardHeader className="border-b border-[#efe7da] bg-gradient-to-b from-[#fffdfa] to-[#f8f3ea] px-5 py-6 sm:px-8">
        <div className="mb-2 inline-flex w-fit rounded-full border border-[#dcc8a4] bg-[#fbf6ed] px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-[#8B5A2B]">
          Calculateur
        </div>
        <CardTitle className="font-display text-2xl text-[#8B5A2B] sm:text-3xl">
          Estimation du prix
        </CardTitle>
        <p className="text-sm leading-6 text-muted-foreground sm:text-base">
          Sélectionnez les critères de votre article pour obtenir une estimation rapide.
        </p>
      </CardHeader>

      <CardContent className="space-y-5 px-5 py-6 sm:px-8 sm:py-8">
        <div className="space-y-2">
          <Label htmlFor="brand" className="text-sm font-semibold text-foreground">
            Marque
          </Label>
          <Select value={selectedBrandId} onValueChange={setSelectedBrandId}>
            <SelectTrigger className="h-12 rounded-xl border-[#d9cfbf] bg-[#fffdfa] text-left text-base shadow-none">
              <SelectValue placeholder={loading ? "Chargement..." : "Sélectionnez une marque"} />
            </SelectTrigger>
            <SelectContent>
              {brands.map((brand) => (
                <SelectItem key={brand.id} value={brand.id}>
                  {brand.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="clothing-type" className="text-sm font-semibold text-foreground">
            Type de vêtement
          </Label>
          <Select
            value={clothingType}
            onValueChange={(value) => {
              setClothingType(value)
              setShoeType("")
            }}
          >
            <SelectTrigger className="h-12 rounded-xl border-[#d9cfbf] bg-[#fffdfa] text-left text-base shadow-none">
              <SelectValue placeholder="Sélectionnez un type" />
            </SelectTrigger>
            <SelectContent>
              {clothingTypes.map((type) => (
                <SelectItem key={type.id} value={type.id}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {clothingType === "chaussures" && (
          <div className="space-y-2">
            <Label htmlFor="shoe-type" className="text-sm font-semibold text-foreground">
              Type de chaussure
            </Label>
            <Select value={shoeType} onValueChange={setShoeType}>
              <SelectTrigger className="h-12 rounded-xl border-[#d9cfbf] bg-[#fffdfa] text-left text-base shadow-none">
                <SelectValue placeholder="Sélectionnez un type de chaussure" />
              </SelectTrigger>
              <SelectContent>
                <div className="px-2 pt-2 pb-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#8B5A2B]">
                  Mixte
                </div>
                {shoeGroups[0].items.map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.label}
                  </SelectItem>
                ))}

                <div className="px-2 pt-3 pb-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#8B5A2B]">
                  Femme
                </div>
                {shoeGroups[1].items.map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.label}
                  </SelectItem>
                ))}

                <div className="px-2 pt-3 pb-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#8B5A2B]">
                  Homme
                </div>
                {shoeGroups[2].items.map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="condition" className="text-sm font-semibold text-foreground">
            État
          </Label>
          <Select value={condition} onValueChange={setCondition}>
            <SelectTrigger className="h-12 rounded-xl border-[#d9cfbf] bg-[#fffdfa] text-left text-base shadow-none">
              <SelectValue placeholder="Sélectionnez un état" />
            </SelectTrigger>
            <SelectContent>
              {conditions.map((item) => (
                <SelectItem key={item.id} value={item.id}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="rounded-2xl border border-[#eadfcd] bg-[#fbf7f0] p-5 sm:p-6">
          {finalPrice !== null ? (
            <div className="text-center">
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#8B5A2B]/80">
                Prix estimé
              </p>
              <div className="mt-3 font-display text-4xl text-[#8B5A2B] sm:text-5xl">
                {finalPrice.toFixed(2)} €
              </div>
            </div>
          ) : (
            <div className="text-center text-sm leading-6 text-muted-foreground">
              Sélectionnez tous les paramètres pour afficher le prix estimé.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}