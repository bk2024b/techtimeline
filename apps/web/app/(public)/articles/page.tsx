import Link from "next/link";
import { cookies } from "next/headers";
import { createServerClient } from "@techtimeline/database";

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

  let query = supabase
    .from("articles")
    .select("id, title, slug, excerpt, cover_image, type, published_at")
    .eq("status", "published")
    .order("published_at", { ascending: false });

  if (category) query = query.contains("category_slugs", [category]);
  if (type) query = query.eq("type", type);

  const { data: articles } = await query;

  const types: { value: string; label: string }[] = [
    { value: "", label: "All" },
    { value: "news", label: "News" },
    { value: "guide", label: "Guides" },
    { value: "comparatif", label: "Comparisons" },
    { value: "timeline", label: "Timeline" },
  ];

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <h1 className="text-2xl font-semibold">
        {category ? `Articles — ${category}` : "Latest articles"}
      </h1>

      <div className="mt-4 flex gap-2">
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
              className={`rounded-full border px-3 py-1 text-sm ${
                active
                  ? "border-neutral-900 bg-neutral-900 text-white"
                  : "border-neutral-200 bg-white text-neutral-600 hover:border-neutral-400"
              }`}
            >
              {t.label}
            </Link>
          );
        })}
      </div>

      {category && (
        <Link href="/articles" className="mt-3 inline-block text-sm text-neutral-500 hover:underline">
          × retirer le filtre catégorie
        </Link>
      )}

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
              <span className="text-xs uppercase text-neutral-400">{a.type}</span>
              <h2 className="mt-1 font-medium">{a.title}</h2>
              {a.excerpt && <p className="mt-1 line-clamp-2 text-sm text-neutral-500">{a.excerpt}</p>}
            </Link>
          ))
        ) : (
          <p className="text-sm text-neutral-500">Aucun article ne correspond à ce filtre.</p>
        )}
      </div>
    </main>
  );
}
