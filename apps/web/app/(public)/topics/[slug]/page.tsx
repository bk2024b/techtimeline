import Link from "next/link";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { createServerClient } from "@techtimeline/database";

export const revalidate = 300;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return { title: `${slug} — TechTimeline` };
}

export default async function TopicPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const cookieStore = await cookies();
  const supabase = createServerClient(cookieStore);

  const { data: topic } = await supabase
    .from("topics")
    .select("id, name, slug, description")
    .eq("slug", slug)
    .single();

  if (!topic) notFound();

  const { data: articleLinks } = await supabase
    .from("article_topics")
    .select("article_id")
    .eq("topic_id", topic.id);

  const articleIds = (articleLinks ?? []).map((r) => r.article_id);

  const { data: articles } = articleIds.length
    ? await supabase
        .from("articles")
        .select("id, title, slug, excerpt, cover_image, published_at")
        .in("id", articleIds)
        .eq("status", "published")
        .order("published_at", { ascending: false })
    : { data: [] };

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <h1 className="text-2xl font-semibold">{topic.name}</h1>
      {topic.description && <p className="mt-2 max-w-xl text-neutral-500">{topic.description}</p>}

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {articles?.length ? (
          articles.map((a) => (
            <Link
              key={a.id}
              href={`/articles/${a.slug}`}
              className="block rounded-lg border border-neutral-200 bg-white p-4 hover:border-neutral-400"
            >
              {a.cover_image && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={a.cover_image}
                  alt=""
                  className="mb-3 h-32 w-full rounded-md object-cover"
                />
              )}
              <h3 className="font-medium">{a.title}</h3>
              {a.excerpt && <p className="mt-1 line-clamp-2 text-sm text-neutral-500">{a.excerpt}</p>}
            </Link>
          ))
        ) : (
          <p className="text-sm text-neutral-500">Aucun article pour ce topic.</p>
        )}
      </div>
    </main>
  );
}
