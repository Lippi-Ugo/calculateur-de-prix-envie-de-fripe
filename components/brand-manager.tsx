"use client"

import { useState, useEffect } from "react"
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

  const supabase = createClient()

  async function fetchBrands() {
    const { data, error } = await supabase
      .from("brands")
      .select("*")
      .order("name")
    
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

  async function addBrand() {
    if (!newBrandName.trim() || !newBrandPrice) return

    const { error } = await supabase
      .from("brands")
      .insert({ name: newBrandName.trim(), base_price: parseFloat(newBrandPrice) })

    if (error) {
      console.error("Erreur ajout:", error)
    } else {
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
    const { error } = await supabase
      .from("brands")
      .delete()
      .eq("id", id)

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
    <div className="w-full max-w-4xl mx-auto">
      <div className="text-center mb-10">
        <h1 className="font-display text-4xl md:text-5xl text-foreground mb-3 tracking-wide">
          GESTION DES MARQUES
        </h1>
        <p className="text-muted-foreground text-lg">
          Ajoutez et modifiez les marques et leurs prix
        </p>
      </div>

      {/* Ajouter une marque */}
      <Card className="border-2 border-border shadow-lg mb-8">
        <CardHeader className="pb-4">
          <CardTitle className="font-display text-2xl text-[#8B5A2B]">
            AJOUTER UNE MARQUE
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 space-y-2">
              <Label htmlFor="brand-name">Nom de la marque</Label>
              <Input
                id="brand-name"
                value={newBrandName}
                onChange={(e) => setNewBrandName(e.target.value)}
                placeholder="Ex: Balenciaga"
                className="h-12 border-2"
              />
            </div>
            <div className="w-full md:w-40 space-y-2">
              <Label htmlFor="brand-price">Prix de base (€)</Label>
              <Input
                id="brand-price"
                type="number"
                value={newBrandPrice}
                onChange={(e) => setNewBrandPrice(e.target.value)}
                placeholder="0.00"
                className="h-12 border-2"
              />
            </div>
            <div className="flex items-end">
              <Button 
                onClick={addBrand}
                className="h-12 px-6 bg-[#8B5A2B] hover:bg-[#6B4423] text-white"
              >
                Ajouter
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Liste des marques */}
      <Card className="border-2 border-border shadow-lg">
        <CardHeader className="pb-4">
          <CardTitle className="font-display text-2xl text-[#8B5A2B]">
            MARQUES ({brands.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center text-muted-foreground py-8">Chargement...</p>
          ) : brands.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">Aucune marque</p>
          ) : (
            <div className="space-y-2">
              {brands.map((brand) => (
                <div
                  key={brand.id}
                  className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg"
                >
                  <span className="font-medium text-foreground">{brand.name}</span>
                  
                  {editingId === brand.id ? (
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        value={editPrice}
                        onChange={(e) => setEditPrice(e.target.value)}
                        className="w-24 h-10 border-2"
                      />
                      <span className="text-muted-foreground">€</span>
                      <Button
                        size="sm"
                        onClick={() => updateBrand(brand.id)}
                        className="bg-[#B8860B] hover:bg-[#8B5A2B] text-white"
                      >
                        OK
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditingId(null)}
                      >
                        Annuler
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-4">
                      <span className="text-[#8B5A2B] font-semibold">
                        {brand.base_price.toFixed(2)}€
                      </span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => startEdit(brand)}
                        className="border-[#B8860B] text-[#8B5A2B] hover:bg-[#B8860B]/10"
                      >
                        Modifier
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => deleteBrand(brand.id)}
                        className="border-destructive text-destructive hover:bg-destructive/10"
                      >
                        Supprimer
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
