import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@techtimeline/database";
import { rateLimitOrNull } from "../../_lib/rate-limit";

export const revalidate = 300;

// GET /api/topics/bluetooth
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const rateLimited = rateLimitOrNull(request);
  if (rateLimited) return rateLimited;

  const { slug } = await params;
  const supabase = createServiceClient();

  const { data: topic, error: topicError } = await supabase
    .from("topics")
    .select("id, name, slug, description")
    .eq("slug", slug)
    .single();

  if (topicError || !topic) {
    return NextResponse.json({ error: "Topic not found" }, { status: 404 });
  }

  // article_topics est une vraie table de jointure (pas de tag_slugs
  // dénormalisé pour les topics, contrairement à category/brand/tag) :
  // on passe par une jointure explicite plutôt que .contains().
  const { data: links } = await supabase
    .from("article_topics")
    .select("article_id")
    .eq("topic_id", topic.id);

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
    topic,
    articles: articles ?? [],
  });
}
