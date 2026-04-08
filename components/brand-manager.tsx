"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"

interface Brand {
  id: string
  name: string
  base_price: number
}

export function BrandManager() {
  const [brands, setBrands] = useState<Brand[]>([])
  const [loading, setLoading] = useState(true)
  const [newBrandName, setNewBrandName] = useState("")
  const [newBrandPrice, setNewBrandPrice] = useState("")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editPrice, setEditPrice] = useState("")
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const supabase = createClient()

  async function fetchBrands() {
    const { data, error } = await supabase.from("brands").select("*").order("name")

    if (error) {
      console.error("Erreur:", error)
    } else {
      setBrands(data || [])
    }

    setLoading(false)
  }

  useEffect(() => {
    fetchBrands()
  }, [])

  useEffect(() => {
    if (errorMessage || successMessage) {
      const timer = setTimeout(() => {
        setErrorMessage(null)
        setSuccessMessage(null)
      }, 4000)

      return () => clearTimeout(timer)
    }
  }, [errorMessage, successMessage])

  async function addBrand() {
    if (!newBrandName.trim() || !newBrandPrice) return

    setErrorMessage(null)
    setSuccessMessage(null)

    const brandExists = brands.some(
      (brand) => brand.name.toLowerCase() === newBrandName.trim().toLowerCase()
    )

    if (brandExists) {
      setErrorMessage(`La marque "${newBrandName.trim()}" existe déjà.`)
      return
    }

    const { error } = await supabase.from("brands").insert({
      name: newBrandName.trim(),
      base_price: parseFloat(newBrandPrice),
    })

    if (error) {
      if (error.code === "23505") {
        setErrorMessage(`La marque "${newBrandName.trim()}" existe déjà.`)
      } else {
        setErrorMessage("Une erreur est survenue lors de l'ajout.")
      }
    } else {
      setSuccessMessage(`La marque "${newBrandName.trim()}" a été ajoutée.`)
      setNewBrandName("")
      setNewBrandPrice("")
      fetchBrands()
    }
  }

  async function updateBrand(id: string) {
    if (!editPrice) return

    const { error } = await supabase
      .from("brands")
      .update({ base_price: parseFloat(editPrice) })
      .eq("id", id)

    if (error) {
      console.error("Erreur mise à jour:", error)
    } else {
      setEditingId(null)
      setEditPrice("")
      fetchBrands()
    }
  }

  async function deleteBrand(id: string) {
    const { error } = await supabase.from("brands").delete().eq("id", id)

    if (error) {
      console.error("Erreur suppression:", error)
    } else {
      fetchBrands()
    }
  }

  function startEdit(brand: Brand) {
    setEditingId(brand.id)
    setEditPrice(brand.base_price.toString())
  }

  return (
    <div className="mx-auto w-full max-w-5xl">
      <div className="mb-10 text-center">
        <p className="mb-3 text-sm font-medium uppercase tracking-[0.22em] text-[#8B5A2B]">
          Administration
        </p>
        <h1 className="font-display text-4xl text-foreground sm:text-5xl">
          Gestion des marques
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-muted-foreground">
          Ajoute, modifie ou supprime les marques et leurs prix de base dans une
          interface simple, claire et cohérente avec l’univers En&apos;vie de Frip.
        </p>
      </div>

      <div className="grid items-start gap-6 xl:grid-cols-[380px_1fr]">
        <Card className="self-start border border-[#e7dfd1] bg-white/95 shadow-[0_18px_50px_rgba(62,43,14,0.08)]">
          <CardHeader className="border-b border-[#efe7da] bg-gradient-to-b from-[#fffdfa] to-[#f8f3ea]">
            <CardTitle className="font-display text-2xl text-[#8B5A2B]">
              Ajouter une marque
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-5 p-6">
            {errorMessage && (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3">
                <p className="text-sm font-medium text-red-700">{errorMessage}</p>
              </div>
            )}

            {successMessage && (
              <div className="rounded-2xl border border-green-200 bg-green-50 px-4 py-3">
                <p className="text-sm font-medium text-green-700">{successMessage}</p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="brand-name" className="text-sm font-semibold">
                Nom de la marque
              </Label>
              <Input
                id="brand-name"
                value={newBrandName}
                onChange={(e) => setNewBrandName(e.target.value)}
                placeholder="Ex : Balenciaga"
                className="h-12 rounded-xl border-[#d9cfbf] bg-[#fffdfa]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="brand-price" className="text-sm font-semibold">
                Prix de base (€)
              </Label>
              <Input
                id="brand-price"
                type="number"
                value={newBrandPrice}
                onChange={(e) => setNewBrandPrice(e.target.value)}
                placeholder="0.00"
                className="h-12 rounded-xl border-[#d9cfbf] bg-[#fffdfa]"
              />
            </div>

            <Button
              onClick={addBrand}
              className="h-12 w-full rounded-xl bg-[#8B5A2B] text-white hover:bg-[#6B4423]"
            >
              Ajouter la marque
            </Button>
          </CardContent>
        </Card>

        <Card className="border border-[#e7dfd1] bg-white/95 shadow-[0_18px_50px_rgba(62,43,14,0.08)]">
          <CardHeader className="border-b border-[#efe7da] bg-gradient-to-b from-[#fffdfa] to-[#f8f3ea]">
            <CardTitle className="font-display text-2xl text-[#8B5A2B]">
              Marques enregistrées ({brands.length})
            </CardTitle>
          </CardHeader>

          <CardContent className="p-4 sm:p-6">
            {loading ? (
              <p className="py-10 text-center text-muted-foreground">Chargement...</p>
            ) : brands.length === 0 ? (
              <p className="py-10 text-center text-muted-foreground">Aucune marque enregistrée.</p>
            ) : (
              <div className="space-y-3">
                {brands.map((brand) => (
                  <div
                    key={brand.id}
                    className="rounded-2xl border border-[#ece2d3] bg-[#fcfaf6] p-4"
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                      <div>
                        <p className="text-lg font-semibold text-foreground">{brand.name}</p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          Prix de base actuel
                        </p>
                      </div>

                      {editingId === brand.id ? (
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                          <Input
                            type="number"
                            value={editPrice}
                            onChange={(e) => setEditPrice(e.target.value)}
                            className="h-11 w-full rounded-xl border-[#d9cfbf] bg-white sm:w-32"
                          />
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => updateBrand(brand.id)}
                              className="bg-[#B8860B] text-white hover:bg-[#8B5A2B]"
                            >
                              Enregistrer
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setEditingId(null)
                                setEditPrice("")
                              }}
                              className="border-[#d6c3a3] text-[#8B5A2B] hover:bg-[#fbf4e6]"
                            >
                              Annuler
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
                          <span className="text-xl font-semibold text-[#8B5A2B]">
                            {brand.base_price.toFixed(2)} €
                          </span>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => startEdit(brand)}
                              className="border-[#d6c3a3] text-[#8B5A2B] hover:bg-[#fbf4e6]"
                            >
                              Modifier
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => deleteBrand(brand.id)}
                              className="border-red-300 text-red-600 hover:bg-red-50"
                            >
                              Supprimer
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}