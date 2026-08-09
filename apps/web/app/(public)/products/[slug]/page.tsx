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

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const cookieStore = await cookies();
  const supabase = createServerClient(cookieStore);

  const { data: product } = await supabase
    .from("products")
    .select("id, name, slug, released_at, brands(name, slug), categories(name, slug)")
    .eq("slug", slug)
    .single();

  if (!product) notFound();

  const { data: articleLinks } = await supabase
    .from("article_products")
    .select("article_id")
    .eq("product_id", product.id);

  const articleIds = (articleLinks ?? []).map((r) => r.article_id);

  const { data: articles } = articleIds.length
    ? await supabase
        .from("articles")
        .select("id, title, slug, excerpt, cover_image, published_at")
        .in("id", articleIds)
        .eq("status", "published")
        .order("published_at", { ascending: false })
    : { data: [] };

  const brand = Array.isArray(product.brands) ? product.brands[0] : product.brands;
  const category = Array.isArray(product.categories) ? product.categories[0] : product.categories;

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <div className="flex flex-wrap gap-2 text-sm">
        {brand && (
          <Link href={`/brands/${brand.slug}`} className="text-neutral-500 hover:underline">
            {brand.name}
          </Link>
        )}
        {category && <span className="text-neutral-300">·</span>}
        {category && <span className="text-neutral-500">{category.name}</span>}
      </div>

      <h1 className="mt-1 text-3xl font-semibold">{product.name}</h1>
      {product.released_at && (
        <p className="mt-2 text-sm text-neutral-400">
          Released{" "}
          {new Date(product.released_at).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      )}

      <section className="mt-10">
        <h2 className="text-sm font-medium uppercase tracking-wide text-neutral-400">Articles</h2>
        {articles?.length ? (
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {articles.map((a) => (
              <Link
                key={a.id}
                href={`/articles/${a.slug}`}
                className="block rounded-lg border border-neutral-200 bg-white p-4 hover:border-neutral-400"
              >
                <h3 className="font-medium">{a.title}</h3>
                {a.excerpt && (
                  <p className="mt-1 line-clamp-2 text-sm text-neutral-500">{a.excerpt}</p>
                )}
              </Link>
            ))}
          </div>
        ) : (
          <p className="mt-3 text-sm text-neutral-500">Aucun article pour ce produit.</p>
        )}
      </section>
    </main>
  );
}
