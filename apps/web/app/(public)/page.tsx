import Link from "next/link";
import { cookies } from "next/headers";
import { createServerClient } from "@techtimeline/database";

export const revalidate = 300;

export const metadata = {
  title: "TechTimeline",
  description: "Explore the evolution of technology.",
};

export default async function HomePage() {
  const cookieStore = await cookies();
  const supabase = createServerClient(cookieStore);

  const [{ data: latestArticles }, { data: categories }, { data: timelines }] = await Promise.all([
    supabase
      .from("articles")
      .select("id, title, slug, excerpt, cover_image, published_at")
      .eq("status", "published")
      .order("published_at", { ascending: false })
      .limit(6),
    supabase.from("categories").select("id, name, slug").order("name").limit(8),
    supabase
      .from("timelines")
      .select("id, name, slug, domain, description")
      .eq("status", "active")
      .order("name"),
  ]);

  return (
    <main>
      <section className="mx-auto max-w-5xl px-6 py-16 text-center">
        <h1 className="text-4xl font-semibold tracking-tight">TechTimeline</h1>
        <p className="mx-auto mt-3 max-w-xl text-neutral-500">
          Explore the evolution of technology.
        </p>
        <Link
          href="/timelines"
          className="mt-6 inline-block rounded-md bg-neutral-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-neutral-800"
        >
          Explore timelines
        </Link>
      </section>

      {categories?.length ? (
        <section className="mx-auto max-w-5xl px-6 pb-16">
          <h2 className="text-sm font-medium uppercase tracking-wide text-neutral-400">
            Explore by category
          </h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {categories.map((c) => (
              <Link
                key={c.id}
                href={`/articles?category=${c.slug}`}
                className="rounded-full border border-neutral-200 bg-white px-4 py-1.5 text-sm text-neutral-700 hover:border-neutral-400"
              >
                {c.name}
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <section className="mx-auto max-w-5xl px-6 pb-16">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium uppercase tracking-wide text-neutral-400">Latest</h2>
          <Link href="/articles" className="text-sm text-neutral-500 hover:text-neutral-900">
            View all →
          </Link>
        </div>

        {latestArticles?.length ? (
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {latestArticles.map((a) => (
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
          <p className="mt-4 text-sm text-neutral-500">Aucun article publié pour l&apos;instant.</p>
        )}
      </section>

      {timelines?.length ? (
        <section className="mx-auto max-w-5xl px-6 pb-16">
          <h2 className="text-sm font-medium uppercase tracking-wide text-neutral-400">
            Timeline Network
          </h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {timelines.map((t) => (
              <a
                key={t.id}
                href={t.domain ? `https://${t.domain}` : "#"}
                target="_blank"
                rel="noreferrer"
                className="block rounded-lg border border-neutral-200 bg-white p-4 hover:border-neutral-400"
              >
                <h3 className="font-medium">{t.name}</h3>
                {t.description && (
                  <p className="mt-1 text-sm text-neutral-500">{t.description}</p>
                )}
              </a>
            ))}
          </div>
        </section>
      ) : null}
    </main>
  );
}
