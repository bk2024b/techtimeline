import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@techtimeline/database";
import { rateLimitOrNull } from "../_lib/rate-limit";

export const revalidate = 300;

// GET /api/articles?category=phones&destination=phonetimeline
//
// `destination` filtre maintenant via la table `publications` (timeline
// slug) plutôt que l'ancien array `articles.destinations` — celui-ci
// reste en base pour compat descendante mais n'est plus la source lue
// ici (cf. Phase 2/9 du plan de migration).
export async function GET(request: NextRequest) {
  const rateLimited = rateLimitOrNull(request);
  if (rateLimited) return rateLimited;

  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const destination = searchParams.get("destination");

  const supabase = createServiceClient();

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

    if (category) {
      query = query.contains("category_slugs", [category]);
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

  if (category) {
    query = query.contains("category_slugs", [category]);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
