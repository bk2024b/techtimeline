import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@techtimeline/database";

// GET /api/articles?category=phones&destination=phonetimeline
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const destination = searchParams.get("destination");

  const supabase = createServiceClient();
  let query = supabase
    .from("articles")
    .select("id, title, slug, excerpt, cover_image, published_at")
    .eq("status", "published")
    .order("published_at", { ascending: false });

  if (category) {
    query = query.contains("category_slugs", [category]);
  }
  if (destination) {
    query = query.contains("destinations", [destination]);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
