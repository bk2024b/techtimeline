import Link from "next/link";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { createServerClient } from "@techtimeline/database";

export const revalidate = 300;

async function getArticle(slug: string) {
  const cookieStore = await cookies();
  const supabase = createServerClient(cookieStore);

  const { data: article } = await supabase
    .from("articles")
    .select(
      "id, title, content, excerpt, cover_image, type, published_at, updated_at, seo_title, seo_meta_description, seo_canonical, seo_og_image"
    )
    .eq("slug", slug)
    .eq("status", "published")
    .single();

  return { supabase, article };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { article } = await getArticle(slug);
  if (!article) return {};

  const title = article.seo_title || article.title;
  const description = article.seo_meta_description || article.excerpt || undefined;
  const ogImage = article.seo_og_image || article.cover_image || undefined;

  return {
    title: `${title} — TechTimeline`,
    description,
    alternates: article.seo_canonical ? { canonical: article.seo_canonical } : undefined,
    openGraph: {
      title,
      description,
      images: ogImage ? [ogImage] : undefined,
    },
  };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { supabase, article } = await getArticle(slug);

  if (!article) notFound();

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.seo_meta_description || article.excerpt || undefined,
    image: article.seo_og_image || article.cover_image || undefined,
    datePublished: article.published_at || undefined,
    dateModified: article.updated_at || article.published_at || undefined,
  };

  const [
    { data: categories },
    { data: brands },
    { data: products },
    { data: technologies },
    { data: topics },
    { data: relations },
    { data: publications },
  ] = await Promise.all([
    supabase.from("article_categories").select("categories(name, slug)").eq("article_id", article.id),
    supabase.from("article_brands").select("brands(name, slug)").eq("article_id", article.id),
    supabase.from("article_products").select("products(name, slug)").eq("article_id", article.id),
    supabase
      .from("article_technologies")
      .select("technologies(name, slug)")
      .eq("article_id", article.id),
    supabase.from("article_topics").select("topics(name, slug)").eq("article_id", article.id),
    supabase
      .from("article_relations")
      .select("articles:related_article_id(title, slug)")
      .eq("article_id", article.id),
    supabase
      .from("publications")
      .select("timelines(name, slug, domain)")
      .eq("article_id", article.id)
      .eq("status", "published"),
  ]);

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <span className="text-xs uppercase text-neutral-400">{article.type}</span>
      <h1 className="mt-1 text-3xl font-semibold">{article.title}</h1>
      {article.published_at && (
        <p className="mt-2 text-sm text-neutral-400">
          {new Date(article.published_at).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      )}

      {article.cover_image && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={article.cover_image}
          alt=""
          className="mt-6 h-64 w-full rounded-lg object-cover"
        />
      )}

      {/* Rendu texte brut pour l'instant : pas de parseur markdown->HTML
          branché (ex: react-markdown). Le contenu est stocké en markdown
          mais affiché tel quel — à améliorer hors du périmètre de cette
          phase, qui porte sur l'architecture des pages plutôt que le
          rendu éditorial. */}
      <div className="prose prose-neutral mt-8 max-w-none whitespace-pre-wrap text-neutral-800">
        {article.content}
      </div>

      {(categories?.length || brands?.length || products?.length || technologies?.length || topics?.length) ? (
        <section className="mt-10 border-t border-neutral-200 pt-6">
          <h2 className="text-xs font-medium uppercase tracking-wide text-neutral-400">Related</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {categories?.map((c: any) =>
              c.categories ? (
                <Link
                  key={`cat-${c.categories.slug}`}
                  href={`/articles?category=${c.categories.slug}`}
                  className="rounded-full border border-neutral-200 bg-white px-3 py-1 text-xs text-neutral-600 hover:border-neutral-400"
                >
                  {c.categories.name}
                </Link>
              ) : null
            )}
            {brands?.map((b: any) =>
              b.brands ? (
                <Link
                  key={`brand-${b.brands.slug}`}
                  href={`/brands/${b.brands.slug}`}
                  className="rounded-full border border-neutral-200 bg-white px-3 py-1 text-xs text-neutral-600 hover:border-neutral-400"
                >
                  {b.brands.name}
                </Link>
              ) : null
            )}
            {products?.map((p: any) =>
              p.products ? (
                <Link
                  key={`product-${p.products.slug}`}
                  href={`/products/${p.products.slug}`}
                  className="rounded-full border border-neutral-200 bg-white px-3 py-1 text-xs text-neutral-600 hover:border-neutral-400"
                >
                  {p.products.name}
                </Link>
              ) : null
            )}
            {technologies?.map((t: any) =>
              t.technologies ? (
                <span
                  key={`tech-${t.technologies.slug}`}
                  className="rounded-full border border-neutral-200 bg-white px-3 py-1 text-xs text-neutral-600"
                >
                  {t.technologies.name}
                </span>
              ) : null
            )}
            {topics?.map((t: any) =>
              t.topics ? (
                <Link
                  key={`topic-${t.topics.slug}`}
                  href={`/topics/${t.topics.slug}`}
                  className="rounded-full border border-neutral-200 bg-white px-3 py-1 text-xs text-neutral-600 hover:border-neutral-400"
                >
                  {t.topics.name}
                </Link>
              ) : null
            )}
          </div>
        </section>
      ) : null}

      {publications?.length ? (
        <section className="mt-6">
          <h2 className="text-xs font-medium uppercase tracking-wide text-neutral-400">
            Also on
          </h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {publications.map((p: any) =>
              p.timelines ? (
                <a
                  key={p.timelines.slug}
                  href={p.timelines.domain ? `https://${p.timelines.domain}` : "#"}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full border border-neutral-200 bg-white px-3 py-1 text-xs text-neutral-600 hover:border-neutral-400"
                >
                  {p.timelines.name}
                </a>
              ) : null
            )}
          </div>
        </section>
      ) : null}

      {relations?.length ? (
        <section className="mt-10 border-t border-neutral-200 pt-6">
          <h2 className="text-xs font-medium uppercase tracking-wide text-neutral-400">
            Related articles
          </h2>
          <ul className="mt-3 space-y-2">
            {relations.map((r: any) =>
              r.articles ? (
                <li key={r.articles.slug}>
                  <Link
                    href={`/articles/${r.articles.slug}`}
                    className="text-sm text-neutral-700 hover:underline"
                  >
                    {r.articles.title}
                  </Link>
                </li>
              ) : null
            )}
          </ul>
        </section>
      ) : null}
    </main>
  );
}
