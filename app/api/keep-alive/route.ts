import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"

export async function GET() {
  const supabase = await createClient()
  const { error } = await supabase.from("brands").select("id").limit(1)

  if (error) {
    return NextResponse.json(
      { ok: false, error: "Supabase keep-alive query failed" },
      { status: 503 }
    )
  }

  return NextResponse.json({ ok: true })
}
