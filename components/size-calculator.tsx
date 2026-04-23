"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createClient } from "@/lib/supabase/client"

type ProfilCode = "femme" | "homme"

type CodeMesure =
  | "poitrine"
  | "taille"
  | "hanches"
  | "dessous_poitrine"
  | "tour_cou"
  | "stature"

type Profil = {
  id: string | number
  code: ProfilCode
  libelle: string
}

type Categorie = {
  id: string | number
  profil_id: string | number
  code: string
  libelle: string
  mode_calcul: string
}

type MesureRequise = {
  id: string | number
  categorie_id: string | number
  code_mesure: CodeMesure
  libelle: string
  ordre_affichage: number
  obligatoire: boolean
}

type CorrespondanceTaille = {
  id: string | number
  categorie_id: string | number
  taille_affichee: string
  taille_secondaire: string | null
  code_interne: string | null
  min_poitrine: number | null
  max_poitrine: number | null
  min_taille: number | null
  max_taille: number | null
  min_hanches: number | null
  max_hanches: number | null
  min_dessous_poitrine: number | null
  max_dessous_poitrine: number | null
  min_tour_cou: number | null
  max_tour_cou: number | null
  min_stature: number | null
  max_stature: number | null
  meta?: {
    bonnet?: string
    bande?: string
    [key: string]: any
  } | null
}

type ValeursMesures = Partial<Record<CodeMesure, string>>

type ResultatTaille = {
  taille: string
  tailleSecondaire: string | null
  detail: string | null
}

const aidesMesures: Record<CodeMesure, string> = {
  poitrine: "En cm, au point le plus fort.",
  taille: "En cm, à l’endroit le plus fin.",
  hanches: "En cm, au point le plus large.",
  dessous_poitrine: "En cm, juste sous la poitrine.",
  tour_cou: "En cm, sans serrer.",
  stature: "En cm, hauteur totale.",
}

function convertirEnNombre(valeur: string) {
  const nombre = Number(valeur.replace(",", "."))
  return Number.isFinite(nombre) ? nombre : null
}

function estDansIntervalle(
  valeur: number | null,
  min?: number | null,
  max?: number | null,
) {
  if (valeur === null) return false
  if (min !== null && min !== undefined && valeur < min) return false
  if (max !== null && max !== undefined && valeur > max) return false
  return true
}

function trouverCorrespondanceParChamps(
  correspondances: CorrespondanceTaille[],
  valeurs: ValeursMesures,
  champs: CodeMesure[],
): ResultatTaille | null {
  const mesuresNumeriques = {
    poitrine: convertirEnNombre(valeurs.poitrine ?? ""),
    taille: convertirEnNombre(valeurs.taille ?? ""),
    hanches: convertirEnNombre(valeurs.hanches ?? ""),
    dessous_poitrine: convertirEnNombre(valeurs.dessous_poitrine ?? ""),
    tour_cou: convertirEnNombre(valeurs.tour_cou ?? ""),
    stature: convertirEnNombre(valeurs.stature ?? ""),
  }

  const ligne = correspondances.find((item) => {
    return champs.every((champ) => {
      switch (champ) {
        case "poitrine":
          return estDansIntervalle(
            mesuresNumeriques.poitrine,
            item.min_poitrine,
            item.max_poitrine,
          )

        case "taille":
          return estDansIntervalle(
            mesuresNumeriques.taille,
            item.min_taille,
            item.max_taille,
          )

        case "hanches":
          return estDansIntervalle(
            mesuresNumeriques.hanches,
            item.min_hanches,
            item.max_hanches,
          )

        case "dessous_poitrine":
          return estDansIntervalle(
            mesuresNumeriques.dessous_poitrine,
            item.min_dessous_poitrine,
            item.max_dessous_poitrine,
          )

        case "tour_cou":
          return estDansIntervalle(
            mesuresNumeriques.tour_cou,
            item.min_tour_cou,
            item.max_tour_cou,
          )

        case "stature":
          return estDansIntervalle(
            mesuresNumeriques.stature,
            item.min_stature,
            item.max_stature,
          )

        default:
          return false
      }
    })
  })

  if (!ligne) return null

  let detail: string | null = null

  if (ligne.meta?.bande && ligne.meta?.bonnet) {
    detail = `Bande ${ligne.meta.bande}, bonnet ${ligne.meta.bonnet}`
  } else if (ligne.code_interne) {
    detail = `Repère : ${ligne.code_interne}`
  }

  return {
    taille: ligne.taille_affichee,
    tailleSecondaire: ligne.taille_secondaire,
    detail,
  }
}

function calculerResultatDepuisCategorie(
  categorieCode: string,
  correspondances: CorrespondanceTaille[],
  valeurs: ValeursMesures,
): ResultatTaille | null {
  switch (categorieCode) {
    case "robes_hauts":
      return trouverCorrespondanceParChamps(correspondances, valeurs, [
        "taille",
        "poitrine",
        "hanches",
      ])

    case "pantalons_jupes":
      return trouverCorrespondanceParChamps(correspondances, valeurs, [
        "taille",
        "hanches",
      ])

    case "gaines_panties":
      return trouverCorrespondanceParChamps(correspondances, valeurs, [
        "taille",
        "hanches",
      ])

    case "bas_collants":
      return trouverCorrespondanceParChamps(correspondances, valeurs, [
        "stature",
        "hanches",
      ])

    case "soutien_gorge":
      return trouverCorrespondanceParChamps(correspondances, valeurs, [
        "dessous_poitrine",
        "poitrine",
      ])

    case "sous_vetements_homme":
      return trouverCorrespondanceParChamps(correspondances, valeurs, ["taille"])

    case "chemises_homme":
      return trouverCorrespondanceParChamps(correspondances, valeurs, ["tour_cou"])

    case "vestes_homme":
      return trouverCorrespondanceParChamps(correspondances, valeurs, ["poitrine"])

    case "survetements_homme":
      return trouverCorrespondanceParChamps(correspondances, valeurs, ["stature"])

    case "pantalons_homme":
      return trouverCorrespondanceParChamps(correspondances, valeurs, [
        "taille",
        "hanches",
      ])

    default:
      return null
  }
}

export function SizeCalculator() {
  const supabase = createClient()

  const [profils, setProfils] = useState<Profil[]>([])
  const [categories, setCategories] = useState<Categorie[]>([])
  const [mesuresRequises, setMesuresRequises] = useState<MesureRequise[]>([])
  const [correspondances, setCorrespondances] = useState<CorrespondanceTaille[]>([])

  const [profilSelectionne, setProfilSelectionne] = useState("")
  const [categorieSelectionnee, setCategorieSelectionnee] = useState("")
  const [valeursMesures, setValeursMesures] = useState<ValeursMesures>({})

  const [chargementProfils, setChargementProfils] = useState(true)
  const [chargementCategories, setChargementCategories] = useState(false)
  const [chargementDetails, setChargementDetails] = useState(false)
  const [erreur, setErreur] = useState("")

  useEffect(() => {
    async function chargerProfils() {
      setChargementProfils(true)
      setErreur("")

      const { data, error } = await supabase
        .from("profils")
        .select("*")
        .order("libelle", { ascending: true })

      if (error) {
        console.error("Erreur profils :", error)
        setErreur("Impossible de charger les profils.")
        setProfils([])
      } else {
        setProfils((data as Profil[]) || [])
      }

      setChargementProfils(false)
    }

    chargerProfils()
  }, [supabase])

  useEffect(() => {
    async function chargerCategories() {
      if (!profilSelectionne) {
        setCategories([])
        setCategorieSelectionnee("")
        setMesuresRequises([])
        setCorrespondances([])
        setValeursMesures({})
        return
      }

      setChargementCategories(true)
      setErreur("")

      const profil = profils.find((item) => item.code === profilSelectionne)

      if (!profil) {
        setCategories([])
        setChargementCategories(false)
        return
      }

      const { data, error } = await supabase
        .from("categories_tailles")
        .select("*")
        .eq("profil_id", profil.id)
        .order("libelle", { ascending: true })

      if (error) {
        console.error("Erreur catégories :", error)
        setErreur("Impossible de charger les catégories.")
        setCategories([])
      } else {
        setCategories((data as Categorie[]) || [])
      }

      setCategorieSelectionnee("")
      setMesuresRequises([])
      setCorrespondances([])
      setValeursMesures({})
      setChargementCategories(false)
    }

    chargerCategories()
  }, [profilSelectionne, profils, supabase])

  useEffect(() => {
    async function chargerDetailsCategorie() {
      if (!categorieSelectionnee) {
        setMesuresRequises([])
        setCorrespondances([])
        return
      }

      setChargementDetails(true)
      setErreur("")

      const categorie = categories.find(
        (item) => String(item.id) === categorieSelectionnee,
      )

      if (!categorie) {
        setChargementDetails(false)
        return
      }

      const [
        { data: mesuresData, error: mesuresError },
        { data: correspondancesData, error: correspondancesError },
      ] = await Promise.all([
        supabase
          .from("mesures_requises")
          .select("*")
          .eq("categorie_id", categorie.id)
          .order("ordre_affichage", { ascending: true }),
        supabase
          .from("correspondances_tailles")
          .select("*")
          .eq("categorie_id", categorie.id)
          .order("taille_affichee", { ascending: true }),
      ])

      if (mesuresError || correspondancesError) {
        console.error("Erreur détails :", {
          mesuresError,
          correspondancesError,
        })
        setErreur("Impossible de charger les détails.")
        setMesuresRequises([])
        setCorrespondances([])
      } else {
        setMesuresRequises((mesuresData as MesureRequise[]) || [])
        setCorrespondances((correspondancesData as CorrespondanceTaille[]) || [])
      }

      setValeursMesures({})
      setChargementDetails(false)
    }

    chargerDetailsCategorie()
  }, [categorieSelectionnee, categories, supabase])

  const categorieActive = useMemo(() => {
    return categories.find((item) => String(item.id) === categorieSelectionnee) || null
  }, [categories, categorieSelectionnee])

  const tousLesChampsRenseignes = useMemo(() => {
    if (!mesuresRequises.length) return false

    return mesuresRequises.every((mesure) => {
      if (!mesure.obligatoire) return true
      return (valeursMesures[mesure.code_mesure] ?? "").trim() !== ""
    })
  }, [mesuresRequises, valeursMesures])

  const resultat = useMemo(() => {
    if (!categorieActive || !tousLesChampsRenseignes) return null

    return calculerResultatDepuisCategorie(
      categorieActive.code,
      correspondances,
      valeursMesures,
    )
  }, [categorieActive, tousLesChampsRenseignes, correspondances, valeursMesures])

  function modifierMesure(codeMesure: CodeMesure, valeur: string) {
    setValeursMesures((precedent) => ({
      ...precedent,
      [codeMesure]: valeur,
    }))
  }

  return (
    <Card className="overflow-visible border border-[#e7dfd1] bg-white/95 shadow-[0_18px_50px_rgba(62,43,14,0.08)] backdrop-blur">
      <CardHeader className="border-b border-[#efe7da] bg-linear-to-b from-[#fffdfa] to-[#f8f3ea] px-5 py-6 sm:px-8">
        <div className="mb-2 inline-flex w-fit rounded-full border border-[#dcc8a4] bg-[#fbf6ed] px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-[#8B5A2B]">
          Guide
        </div>
        <CardTitle className="font-display text-2xl text-[#8B5A2B] sm:text-3xl">
          Calculateur de taille
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-5 px-5 py-6 sm:px-8 sm:py-8">
        <div className="space-y-2">
          <Label>Profil</Label>
          <Select
            value={profilSelectionne}
            onValueChange={setProfilSelectionne}
            disabled={chargementProfils}
          >
            <SelectTrigger className="h-10 rounded-xl border-[#d9cfbf] bg-[#fffdfa] text-sm shadow-none">
              <SelectValue
                placeholder={chargementProfils ? "Chargement..." : "Sélectionnez un profil"}
              />
            </SelectTrigger>
            <SelectContent>
              {profils.map((profil) => (
                <SelectItem key={String(profil.id)} value={profil.code}>
                  {profil.libelle}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Catégorie</Label>
          <Select
            value={categorieSelectionnee}
            onValueChange={setCategorieSelectionnee}
            disabled={!profilSelectionne || chargementCategories}
          >
            <SelectTrigger className="h-10 rounded-xl border-[#d9cfbf] bg-[#fffdfa] text-sm shadow-none">
              <SelectValue
                placeholder={chargementCategories ? "Chargement..." : "Sélectionnez une catégorie"}
              />
            </SelectTrigger>
            <SelectContent>
              {categories.map((categorie) => (
                <SelectItem key={String(categorie.id)} value={String(categorie.id)}>
                  {categorie.libelle}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {erreur && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {erreur}
          </div>
        )}

        {chargementDetails && (
          <div className="rounded-xl border border-[#eadfcd] bg-[#fbf7f0] px-4 py-3 text-sm text-muted-foreground">
            Chargement des mesures…
          </div>
        )}

        {!!mesuresRequises.length && (
          <div className="grid gap-4 md:grid-cols-2">
            {mesuresRequises.map((mesure) => (
              <div key={String(mesure.id)} className="space-y-2">
                <Label htmlFor={mesure.code_mesure}>{mesure.libelle}</Label>
                <Input
                  id={mesure.code_mesure}
                  type="number"
                  inputMode="decimal"
                  value={valeursMesures[mesure.code_mesure] ?? ""}
                  onChange={(event) => modifierMesure(mesure.code_mesure, event.target.value)}
                  placeholder={
                    mesure.code_mesure === "tour_cou"
                      ? "Ex. 40"
                      : mesure.code_mesure === "stature"
                        ? "Ex. 168"
                        : "Ex. 92"
                  }
                  className="h-10 rounded-xl border-[#d9cfbf] bg-[#fffdfa] text-sm shadow-none"
                />
                <p className="text-xs text-muted-foreground">
                  {aidesMesures[mesure.code_mesure]}
                </p>
              </div>
            ))}
          </div>
        )}

        <div className="rounded-2xl border border-[#eadfcd] bg-[#fbf7f0] p-5 sm:p-6">
          {!profilSelectionne ? (
            <div className="text-center text-sm text-muted-foreground">
              Sélectionnez un profil.
            </div>
          ) : !categorieSelectionnee ? (
            <div className="text-center text-sm text-muted-foreground">
              Sélectionnez une catégorie.
            </div>
          ) : !tousLesChampsRenseignes ? (
            <div className="text-center text-sm text-muted-foreground">
              Renseignez toutes les mensurations.
            </div>
          ) : resultat ? (
            <div className="text-center">
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#8B5A2B]/80">
                Taille conseillée
              </p>
              <div className="mt-3 font-display text-4xl text-[#8B5A2B] sm:text-5xl">
                {resultat.taille}
              </div>

              {resultat.tailleSecondaire && (
                <p className="mt-3 text-sm text-muted-foreground">
                  Équivalent : {resultat.tailleSecondaire}
                </p>
              )}

              {resultat.detail && (
                <p className="mt-3 text-sm text-muted-foreground">
                  {resultat.detail}
                </p>
              )}
            </div>
          ) : (
            <div className="text-center text-sm text-muted-foreground">
              Aucune correspondance trouvée.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}