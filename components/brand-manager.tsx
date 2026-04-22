"use client"

import { FormEvent, useEffect, useMemo, useRef, useState } from "react"
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
  const [searchTerm, setSearchTerm] = useState("")

  const nameInputRef = useRef<HTMLInputElement | null>(null)
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

  const filteredBrands = useMemo(() => {
    if (!searchTerm.trim()) return brands

    return brands.filter((brand) =>
      brand.name.toLowerCase().includes(searchTerm.toLowerCase().trim())
    )
  }, [brands, searchTerm])

  async function addBrand() {
    if (!newBrandName.trim() || !newBrandPrice) return

    setErrorMessage(null)
    setSuccessMessage(null)

    const normalizedName = newBrandName.trim()

    const brandExists = brands.some(
      (brand) => brand.name.toLowerCase() === normalizedName.toLowerCase()
    )

    if (brandExists) {
      setErrorMessage(`La marque "${normalizedName}" existe déjà.`)
      setNewBrandName("")
      setNewBrandPrice("")
      nameInputRef.current?.focus()
      return
    }

    const { error } = await supabase.from("brands").insert({
      name: normalizedName,
      base_price: parseFloat(newBrandPrice),
    })

    if (error) {
      if (error.code === "23505") {
        setErrorMessage(`La marque "${normalizedName}" existe déjà.`)
        setNewBrandName("")
        setNewBrandPrice("")
        nameInputRef.current?.focus()
      } else {
        setErrorMessage("Une erreur est survenue lors de l'ajout.")
      }
    } else {
      setSuccessMessage(`La marque "${normalizedName}" a été ajoutée.`)
      setNewBrandName("")
      setNewBrandPrice("")
      fetchBrands()
      nameInputRef.current?.focus()
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    addBrand()
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
          interface simple, claire et cohérente avec l'univers En&apos;vie de Frip.
        </p>
      </div>

      <div className="grid items-start gap-6 xl:grid-cols-[380px_1fr]">
        <Card className="self-start border border-[#e7dfd1] bg-white/95 shadow-[0_18px_50px_rgba(62,43,14,0.08)]">
          <CardHeader className="border-b border-[#efe7da] bg-gradient-to-b from-[#fffdfa] to-[#f8f3ea]">
            <CardTitle className="font-display text-2xl text-[#8B5A2B]">
              Ajouter une marque
            </CardTitle>
          </CardHeader>

          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-5">
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
                  ref={nameInputRef}
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
                type="submit"
                className="h-12 w-full rounded-xl bg-[#8B5A2B] text-white hover:bg-[#6B4423]"
              >
                Ajouter la marque
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="border border-[#e7dfd1] bg-white/95 shadow-[0_18px_50px_rgba(62,43,14,0.08)]">
          <CardHeader className="border-b border-[#efe7da] bg-gradient-to-b from-[#fffdfa] to-[#f8f3ea] p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <CardTitle className="flex-1 font-display text-2xl text-[#8B5A2B]">
                Marques enregistrées ({filteredBrands.length})
              </CardTitle>

              <div className="relative w-full sm:w-64">
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Rechercher une marque..."
                  className="h-11 rounded-xl border-[#d9cfbf] bg-[#fffdfa] pl-11 pr-4"
                />
                <svg
                  className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {loading ? (
              <p className="py-10 text-center text-muted-foreground">Chargement...</p>
            ) : filteredBrands.length === 0 ? (
              <div className="py-12 text-center">
                <p className="mb-4 text-muted-foreground">
                  {searchTerm ? "Aucune marque trouvée." : "Aucune marque enregistrée."}
                </p>
                {searchTerm && (
                  <Button
                    variant="outline"
                    onClick={() => setSearchTerm("")}
                    className="border-[#d6c3a3] text-[#8B5A2B]"
                  >
                    Effacer la recherche
                  </Button>
                )}
              </div>
            ) : (
              <div
                className="max-h-[calc(100vh-300px)] overflow-y-auto"
                style={{ scrollbarWidth: "thin", scrollbarColor: "#d9cfbf transparent" }}
              >
                <div className="space-y-3 p-4 sm:p-6">
                  {filteredBrands.map((brand) => (
                    <div
                      key={brand.id}
                      className="rounded-2xl border border-[#ece2d3] bg-[#fcfaf6] p-4 transition-all hover:shadow-md"
                    >
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div className="min-w-0 flex-1">
                          <p className="break-words text-lg font-semibold text-foreground">
                            {brand.name}
                          </p>
                          <p className="mt-1 text-sm text-muted-foreground">
                            Prix de base actuel
                          </p>
                        </div>

                        {editingId === brand.id ? (
                          <form
                            onSubmit={(e) => {
                              e.preventDefault()
                              updateBrand(brand.id)
                            }}
                            className="flex flex-col gap-3 sm:flex-row sm:items-center"
                          >
                            <Input
                              type="number"
                              value={editPrice}
                              onChange={(e) => setEditPrice(e.target.value)}
                              className="h-11 w-full rounded-xl border-[#d9cfbf] bg-white sm:w-32"
                              autoFocus
                            />
                            <div className="flex gap-2">
                              <Button
                                type="submit"
                                size="sm"
                                className="bg-[#B8860B] text-white hover:bg-[#8B5A2B]"
                              >
                                Enregistrer
                              </Button>
                              <Button
                                type="button"
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
                          </form>
                        ) : (
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
                            <span className="whitespace-nowrap text-xl font-semibold text-[#8B5A2B]">
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
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}