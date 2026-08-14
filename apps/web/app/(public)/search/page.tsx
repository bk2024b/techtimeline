import Link from "next/link";
import { cookies } from "next/headers";
import { createServerClient } from "@techtimeline/database";

export const metadata = {
  title: "Search — TechTimeline",
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = q?.trim();

  const cookieStore = await cookies();
  const supabase = createServerClient(cookieStore);

  let articles: { id: string; title: string; slug: string }[] = [];
  let products: { id: string; name: string; slug: string }[] = [];
  let brands: { id: string; name: string; slug: string }[] = [];
  let topics: { id: string; name: string; slug: string }[] = [];

  if (query) {
    const [articlesRes, productsRes, brandsRes, topicsRes] = await Promise.all([
      supabase
        .from("articles")
        .select("id, title, slug")
        .eq("status", "published")
        .textSearch("search_vector", query, { type: "websearch", config: "simple" })
        .limit(10),
      supabase
        .from("products")
        .select("id, name, slug")
        .textSearch("search_vector", query, { type: "websearch", config: "simple" })
        .limit(10),
      supabase
        .from("brands")
        .select("id, name, slug")
        .textSearch("search_vector", query, { type: "websearch", config: "simple" })
        .limit(10),
      supabase
        .from("topics")
        .select("id, name, slug")
        .textSearch("search_vector", query, { type: "websearch", config: "simple" })
        .limit(10),
    ]);

    articles = articlesRes.data ?? [];
    products = productsRes.data ?? [];
    brands = brandsRes.data ?? [];
    topics = topicsRes.data ?? [];
  }

  const hasResults = articles.length || products.length || brands.length || topics.length;

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="font-heading text-3xl font-semibold text-foreground">Search technology...</h1>

      <form action="/search" className="mt-6">
        <input
          type="text"
          name="q"
          defaultValue={query ?? ""}
          placeholder="iPhone 15, Bluetooth, Apple..."
          autoFocus
          className="w-full rounded-md border border-white/15 bg-surface text-foreground placeholder:text-muted px-4 py-3 text-sm"
        />
      </form>

      {query && !hasResults && (
        <p className="mt-8 text-sm text-muted">Aucun résultat pour « {query} ».</p>
      )}

      {articles.length > 0 && (
        <section className="mt-8">
          <h2 className="text-xs font-medium uppercase tracking-wide text-muted">
            Articles
          </h2>
          <ul className="mt-2 space-y-1">
            {articles.map((a) => (
              <li key={a.id}>
                <Link href={`/articles/${a.slug}`} className="text-sm hover:underline">
                  {a.title}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {products.length > 0 && (
        <section className="mt-6">
          <h2 className="text-xs font-medium uppercase tracking-wide text-muted">
            Products
          </h2>
          <ul className="mt-2 space-y-1">
            {products.map((p) => (
              <li key={p.id}>
                <Link href={`/products/${p.slug}`} className="text-sm hover:underline">
                  {p.name}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {brands.length > 0 && (
        <section className="mt-6">
          <h2 className="text-xs font-medium uppercase tracking-wide text-muted">Brands</h2>
          <ul className="mt-2 space-y-1">
            {brands.map((b) => (
              <li key={b.id}>
                <Link href={`/brands/${b.slug}`} className="text-sm hover:underline">
                  {b.name}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {topics.length > 0 && (
        <section className="mt-6">
          <h2 className="text-xs font-medium uppercase tracking-wide text-muted">Topics</h2>
          <ul className="mt-2 space-y-1">
            {topics.map((t) => (
              <li key={t.id}>
                <Link href={`/topics/${t.slug}`} className="text-sm hover:underline">
                  {t.name}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
