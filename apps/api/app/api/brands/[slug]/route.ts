import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@techtimeline/database";
import { rateLimitOrNull } from "../../_lib/rate-limit";

export const revalidate = 300;

// GET /api/brands/apple
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const rateLimited = rateLimitOrNull(request);
  if (rateLimited) return rateLimited;

  const { slug } = await params;
  const supabase = createServiceClient();

  const { data: brand, error: brandError } = await supabase
    .from("brands")
    .select("id, name, slug, logo")
    .eq("slug", slug)
    .single();

  if (brandError || !brand) {
    return NextResponse.json({ error: "Brand not found" }, { status: 404 });
  }

  const [{ data: articleLinks }, { data: products }] = await Promise.all([
    supabase.from("article_brands").select("article_id").eq("brand_id", brand.id),
    supabase
      .from("products")
      .select("id, name, slug, released_at")
      .eq("brand_id", brand.id)
      .order("released_at", { ascending: false }),
  ]);

  const articleIds = (articleLinks ?? []).map((r) => r.article_id);

  const { data: articles } = articleIds.length
    ? await supabase
        .from("articles")
        .select("id, title, slug, excerpt, cover_image, published_at")
        .in("id", articleIds)
        .eq("status", "published")
        .order("published_at", { ascending: false })
    : { data: [] };

  return NextResponse.json({
    brand,
    articles: articles ?? [],
    products: products ?? [],
  });
}
