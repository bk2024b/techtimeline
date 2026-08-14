import Link from "next/link";
import { cookies } from "next/headers";
import { createServerClient, getArticleIdsByCategorySlug } from "@techtimeline/database";
import { CardLink, Badge } from "@techtimeline/ui";

export const revalidate = 300;

export const metadata = {
  title: "Articles — TechTimeline",
};

export default async function ArticlesPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; type?: string }>;
}) {
  const { category, type } = await searchParams;

  const cookieStore = await cookies();
  const supabase = createServerClient(cookieStore);

  type ArticleRow = {
    id: string;
    title: string;
    slug: string;
    excerpt: string | null;
    cover_image: string | null;
    type: string;
    published_at: string | null;
  };

  let articles: ArticleRow[] = [];

  if (category) {
    const ids = await getArticleIdsByCategorySlug(supabase, category);
    if (ids.length > 0) {
      let query = supabase
        .from("articles")
        .select("id, title, slug, excerpt, cover_image, type, published_at")
        .eq("status", "published")
        .in("id", ids)
        .order("published_at", { ascending: false });
      if (type) query = query.eq("type", type);
      const { data } = await query;
      articles = data ?? [];
    }
  } else {
    let query = supabase
      .from("articles")
      .select("id, title, slug, excerpt, cover_image, type, published_at")
      .eq("status", "published")
      .order("published_at", { ascending: false });
    if (type) query = query.eq("type", type);
    const { data } = await query;
    articles = data ?? [];
  }

  const types: { value: string; label: string }[] = [
    { value: "", label: "All" },
    { value: "news", label: "News" },
    { value: "guide", label: "Guides" },
    { value: "comparatif", label: "Comparisons" },
    { value: "timeline", label: "Timeline" },
  ];

  return (
    <main className="mx-auto max-w-6xl px-6 py-16">
      <h1 className="font-heading text-3xl font-semibold text-foreground">
        {category ? `Articles — ${category}` : "Latest articles"}
      </h1>

      <div className="mt-5 flex flex-wrap gap-2">
        {types.map((t) => {
          const params = new URLSearchParams();
          if (category) params.set("category", category);
          if (t.value) params.set("type", t.value);
          const href = params.toString() ? `/articles?${params}` : "/articles";
          const active = (type ?? "") === t.value;
          return (
            <Link
              key={t.value || "all"}
              href={href}
              className={`rounded-full border px-3 py-1 text-sm transition ${
                active
                  ? "border-transparent bg-gradient-brand text-white"
                  : "border-white/10 bg-surface text-muted hover:border-white/25 hover:text-foreground"
              }`}
            >
              {t.label}
            </Link>
          );
        })}
      </div>

      {category && (
        <Link href="/articles" className="mt-3 inline-block text-sm text-muted hover:text-foreground">
          × remove category filter
        </Link>
      )}

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {articles.length ? (
          articles.map((a) => (
            <CardLink key={a.id} href={`/articles/${a.slug}`} className="overflow-hidden">
              {a.cover_image && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={a.cover_image} alt="" className="h-40 w-full object-cover" />
              )}
              <div className="p-4">
                <Badge tone="neutral">{a.type}</Badge>
                <h2 className="mt-2 font-heading font-semibold text-foreground">{a.title}</h2>
                {a.excerpt && <p className="mt-1 line-clamp-2 text-sm text-muted">{a.excerpt}</p>}
              </div>
            </CardLink>
          ))
        ) : (
          <p className="text-sm text-muted">No article matches this filter.</p>
        )}
      </div>
    </main>
  );
}
