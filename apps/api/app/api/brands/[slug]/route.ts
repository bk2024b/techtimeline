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

  const [{ data: articles }, { data: products }] = await Promise.all([
    supabase
      .from("articles")
      .select("id, title, slug, excerpt, cover_image, published_at")
      .eq("status", "published")
      .contains("brand_slugs", [slug])
      .order("published_at", { ascending: false }),
    supabase
      .from("products")
      .select("id, name, slug, released_at")
      .eq("brand_id", brand.id)
      .order("released_at", { ascending: false }),
  ]);

  return NextResponse.json({
    brand,
    articles: articles ?? [],
    products: products ?? [],
  });
}
