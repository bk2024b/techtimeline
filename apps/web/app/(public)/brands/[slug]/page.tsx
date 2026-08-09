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

export default async function BrandPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const cookieStore = await cookies();
  const supabase = createServerClient(cookieStore);

  const { data: brand } = await supabase
    .from("brands")
    .select("id, name, slug, logo")
    .eq("slug", slug)
    .single();

  if (!brand) notFound();

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

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <div className="flex items-center gap-4">
        {brand.logo && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={brand.logo} alt="" className="h-12 w-12 object-contain" />
        )}
        <h1 className="text-2xl font-semibold">{brand.name}</h1>
      </div>

      {products?.length ? (
        <section className="mt-8">
          <h2 className="text-sm font-medium uppercase tracking-wide text-neutral-400">
            Products
          </h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {products.map((p) => (
              <Link
                key={p.id}
                href={`/products/${p.slug}`}
                className="rounded-full border border-neutral-200 bg-white px-3 py-1 text-sm text-neutral-700 hover:border-neutral-400"
              >
                {p.name}
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <section className="mt-10">
        <h2 className="text-sm font-medium uppercase tracking-wide text-neutral-400">
          Latest articles
        </h2>
        {articles?.length ? (
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {articles.map((a) => (
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
                {a.excerpt && (
                  <p className="mt-1 line-clamp-2 text-sm text-neutral-500">{a.excerpt}</p>
                )}
              </Link>
            ))}
          </div>
        ) : (
          <p className="mt-3 text-sm text-neutral-500">Aucun article pour cette marque.</p>
        )}
      </section>
    </main>
  );
}
