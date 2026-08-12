import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@techtimeline/database";
import { rateLimitOrNull } from "../_lib/rate-limit";

export const revalidate = 60;

// GET /api/search?q=iphone
// Recherche full-text (Postgres tsvector, cf. 0004_search.sql) sur
// articles/products/brands/topics, résultats groupés par type. Pas de
// pagination : limité à quelques résultats par catégorie, pensé pour
// une barre de recherche instantanée plutôt qu'une page de résultats
// exhaustive — à revoir si le besoin apparaît.
export async function GET(request: NextRequest) {
  const rateLimited = rateLimitOrNull(request);
  if (rateLimited) return rateLimited;

  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim();

  if (!q) {
    return NextResponse.json({ articles: [], products: [], brands: [], topics: [] });
  }

  const supabase = createServiceClient();

  const [
    { data: articles, error: articlesError },
    { data: products, error: productsError },
    { data: brands, error: brandsError },
    { data: topics, error: topicsError },
  ] = await Promise.all([
    supabase
      .from("articles")
      .select("id, title, slug, excerpt")
      .eq("status", "published")
      .textSearch("search_vector", q, { type: "websearch", config: "simple" })
      .limit(5),
    supabase
      .from("products")
      .select("id, name, slug")
      .textSearch("search_vector", q, { type: "websearch", config: "simple" })
      .limit(5),
    supabase
      .from("brands")
      .select("id, name, slug")
      .textSearch("search_vector", q, { type: "websearch", config: "simple" })
      .limit(5),
    supabase
      .from("topics")
      .select("id, name, slug")
      .textSearch("search_vector", q, { type: "websearch", config: "simple" })
      .limit(5),
  ]);

  const firstError = articlesError || productsError || brandsError || topicsError;
  if (firstError) {
    return NextResponse.json({ error: firstError.message }, { status: 500 });
  }

  return NextResponse.json({
    articles: articles ?? [],
    products: products ?? [],
    brands: brands ?? [],
    topics: topics ?? [],
  });
}
