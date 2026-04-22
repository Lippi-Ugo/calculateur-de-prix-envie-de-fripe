"use client"

import { useEffect, useMemo, useRef, useState } from "react"
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
  { id: "haut", label: "Haut", modifier: -0.2 },
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

  const [brandOpen, setBrandOpen] = useState(false)
  const [brandSearch, setBrandSearch] = useState("")
  const brandDropdownRef = useRef<HTMLDivElement | null>(null)

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

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        brandDropdownRef.current &&
        !brandDropdownRef.current.contains(event.target as Node)
      ) {
        setBrandOpen(false)
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setBrandOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    document.addEventListener("keydown", handleEscape)

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      document.removeEventListener("keydown", handleEscape)
    }
  }, [])

  const selectedBrand = brands.find((brand) => brand.id === selectedBrandId)

  const filteredBrands = useMemo(() => {
    const query = brandSearch.trim().toLowerCase()
    if (!query) return brands

    return brands.filter((brand) =>
      brand.name.toLowerCase().includes(query)
    )
  }, [brands, brandSearch])

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

    const calculatedPrice = step2 * (1 + conditionMod)

    return Math.ceil(calculatedPrice)
  }, [selectedBrand, clothingType, shoeType, condition, shoeModifier])

  return (
    <Card className="overflow-visible border border-[#e7dfd1] bg-white/95 shadow-[0_18px_50px_rgba(62,43,14,0.08)] backdrop-blur">
      <CardHeader className="border-b border-[#efe7da] bg-linear-to-b from-[#fffdfa] to-[#f8f3ea] px-5 py-6 sm:px-8">
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
          <Label htmlFor="brand-search" className="text-sm font-semibold text-foreground">
            Marque
          </Label>

          <div ref={brandDropdownRef} className="relative inline-block w-fit">
            <button
              type="button"
              onClick={() => setBrandOpen((prev) => !prev)}
              className="inline-flex h-10 w-fit items-center justify-between gap-2 rounded-xl border border-[#d9cfbf] bg-[#fffdfa] px-4 text-left text-sm shadow-none transition hover:border-[#8B5A2B] focus:outline-none focus:ring-2 focus:ring-[#8B5A2B]/20 whitespace-nowrap"
            >
              <span className={`${selectedBrand ? "text-foreground" : "text-muted-foreground"}`}>
                {selectedBrand
                  ? selectedBrand.name
                  : loading
                    ? "Chargement..."
                    : "Sélectionnez une marque"}
              </span>

              <svg
                className={`h-4 w-4 shrink-0 transition ${brandOpen ? "rotate-180" : ""}`}
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.168l3.71-3.938a.75.75 0 1 1 1.08 1.04l-4.25 4.51a.75.75 0 0 1-1.08 0l-4.25-4.51a.75.75 0 0 1 .02-1.06Z"
                  clipRule="evenodd"
                />
              </svg>
            </button>

            {brandOpen && (
              <div className="absolute left-0 top-[calc(100%+0.5rem)] z-20 w-[320px] overflow-hidden rounded-xl border border-[#e7dfd1] bg-white shadow-[0_18px_50px_rgba(62,43,14,0.12)]">
                <div className="border-b border-[#efe7da] p-3">
                  <div className="relative">
                    <svg
                      className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <circle cx="11" cy="11" r="7" />
                      <path d="m20 20-3.5-3.5" />
                    </svg>

                    <input
                      id="brand-search"
                      type="text"
                      value={brandSearch}
                      onChange={(e) => setBrandSearch(e.target.value)}
                      placeholder="Rechercher une marque..."
                      className="h-10 w-full rounded-lg border border-[#d9cfbf] bg-[#fffdfa] pl-10 pr-3 text-sm outline-none transition focus:border-[#8B5A2B]"
                      autoFocus
                    />
                  </div>
                </div>

                <div className="max-h-[240px] overflow-y-auto p-1">
                  {filteredBrands.length > 0 ? (
                    filteredBrands.map((brand) => (
                      <button
                        key={brand.id}
                        type="button"
                        onClick={() => {
                          setSelectedBrandId(brand.id)
                          setBrandOpen(false)
                          setBrandSearch("")
                        }}
                        className={`flex min-h-10 w-full items-center rounded-lg px-3 py-2 text-left text-sm transition hover:bg-[#f8f1e7] ${selectedBrandId === brand.id ? "bg-[#fbf4e6] text-[#8B5A2B]" : ""
                          }`}
                      >
                        <span className="truncate">{brand.name}</span>
                      </button>
                    ))
                  ) : (
                    <div className="px-3 py-4 text-sm text-muted-foreground">
                      Aucune marque trouvée.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
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
            <SelectTrigger className="h-10 rounded-xl border-[#d9cfbf] bg-[#fffdfa] text-sm shadow-none">
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
              <SelectTrigger className="h-10 rounded-xl border-[#d9cfbf] bg-[#fffdfa] text-sm shadow-none">
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
            <SelectTrigger className="h-10 rounded-xl border-[#d9cfbf] bg-[#fffdfa] text-sm shadow-none">
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