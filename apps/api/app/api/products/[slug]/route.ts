import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@techtimeline/database";
import { rateLimitOrNull } from "../../_lib/rate-limit";

export const revalidate = 300;

// GET /api/products/iphone-15-pro-max
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const rateLimited = rateLimitOrNull(request);
  if (rateLimited) return rateLimited;

  const { slug } = await params;
  const supabase = createServiceClient();

  const { data: product, error: productError } = await supabase
    .from("products")
    .select("id, name, slug, released_at, brand:brands(id, name, slug), category:categories(id, name, slug)")
    .eq("slug", slug)
    .single();

  if (productError || !product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  const { data: links } = await supabase
    .from("article_products")
    .select("article_id")
    .eq("product_id", product.id);

  const articleIds = (links ?? []).map((l) => l.article_id);

  const { data: articles } = articleIds.length
    ? await supabase
        .from("articles")
        .select("id, title, slug, excerpt, cover_image, published_at")
        .eq("status", "published")
        .in("id", articleIds)
        .order("published_at", { ascending: false })
    : { data: [] };

  return NextResponse.json({
    product,
    articles: articles ?? [],
  });
}
