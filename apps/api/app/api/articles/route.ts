import { NextRequest, NextResponse } from "next/server";
import { createServiceClient, getArticleIdsByCategorySlug } from "@techtimeline/database";
import { rateLimitOrNull } from "../_lib/rate-limit";

export const revalidate = 300;

// GET /api/articles?category=phones&destination=phonetimeline
//
// `destination` filtre via la table `publications` (timeline slug).
// `category` filtre via article_categories (jointure) — la colonne
// dénormalisée articles.category_slugs a été supprimée en Phase 9
// (0005_drop_denormalized_columns.sql).
export async function GET(request: NextRequest) {
  const rateLimited = rateLimitOrNull(request);
  if (rateLimited) return rateLimited;

  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const destination = searchParams.get("destination");

  const supabase = createServiceClient();

  const categoryArticleIds = category
    ? await getArticleIdsByCategorySlug(supabase, category)
    : null;

  // Catégorie demandée mais aucun article ne correspond : court-circuite
  // plutôt que de laisser un .in([]) ambigu (Supabase le traiterait
  // comme "pas de filtre" et retournerait tout, ce qui serait faux ici).
  if (categoryArticleIds && categoryArticleIds.length === 0) {
    return NextResponse.json([]);
  }

  if (destination) {
    // Jointure via publications -> timelines, restreinte aux publications
    // effectivement publiées (le service role bypass RLS, donc on filtre
    // le statut nous-mêmes ici).
    let query = supabase
      .from("articles")
      .select(
        "id, title, slug, excerpt, cover_image, published_at, publications!inner(status, timeline:timelines!inner(slug))"
      )
      .eq("status", "published")
      .eq("publications.status", "published")
      .eq("publications.timeline.slug", destination)
      .order("published_at", { ascending: false });

    if (categoryArticleIds) {
      query = query.in("id", categoryArticleIds);
    }

    const { data, error } = await query;
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const articles = (data ?? []).map(({ publications, ...article }) => article);
    return NextResponse.json(articles);
  }

  let query = supabase
    .from("articles")
    .select("id, title, slug, excerpt, cover_image, published_at")
    .eq("status", "published")
    .order("published_at", { ascending: false });

  if (categoryArticleIds) {
    query = query.in("id", categoryArticleIds);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
