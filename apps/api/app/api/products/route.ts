import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@techtimeline/database";
import { rateLimitOrNull } from "../_lib/rate-limit";

export const revalidate = 300;

// GET /api/products?brand=apple&category=phones
export async function GET(request: NextRequest) {
  const rateLimited = rateLimitOrNull(request);
  if (rateLimited) return rateLimited;

  const { searchParams } = new URL(request.url);
  const brand = searchParams.get("brand");
  const category = searchParams.get("category");

  const supabase = createServiceClient();

  // !inner est nécessaire pour que .eq() sur une colonne de la relation
  // jointe restreigne réellement les lignes de products (sans lui, la
  // relation est juste embarquée mais ne filtre rien côté PostgREST).
  const brandJoin = brand ? "brand:brands!inner(id, name, slug)" : "brand:brands(id, name, slug)";
  const categoryJoin = category
    ? "category:categories!inner(id, name, slug)"
    : "category:categories(id, name, slug)";

  let query = supabase
    .from("products")
    .select(`id, name, slug, released_at, ${brandJoin}, ${categoryJoin}`)
    .order("released_at", { ascending: false });

  if (brand) {
    query = query.eq("brand.slug", brand);
  }
  if (category) {
    query = query.eq("category.slug", category);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
