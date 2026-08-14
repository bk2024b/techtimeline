import Link from "next/link";
import { cookies } from "next/headers";
import { createServerClient } from "@techtimeline/database";
import { LinkButton, CardLink, Badge } from "@techtimeline/ui";

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
      .select("id, title, slug, excerpt, cover_image, type, published_at")
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
      <section className="mx-auto max-w-4xl px-6 py-24 text-center">
        <h1 className="font-heading text-5xl font-bold tracking-tight text-foreground sm:text-6xl">
          The evolution of{" "}
          <span className="text-gradient-brand">technology</span>
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-lg text-muted">
          Explore. Compare. Discover. Technology, through time.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <LinkButton href="/timelines" variant="primary">
            Explore timelines →
          </LinkButton>
          <LinkButton href="/articles" variant="secondary">
            Latest articles
          </LinkButton>
        </div>
      </section>

      {categories?.length ? (
        <section className="mx-auto max-w-6xl px-6 pb-20">
          <h2 className="text-xs font-medium uppercase tracking-wide text-muted">
            Explore by category
          </h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {categories.map((c) => (
              <Link
                key={c.id}
                href={`/articles?category=${c.slug}`}
                className="rounded-full border border-white/10 bg-surface px-4 py-1.5 text-sm text-foreground hover:border-white/25"
              >
                {c.name}
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <section className="mx-auto max-w-6xl px-6 pb-20">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-medium uppercase tracking-wide text-muted">Latest</h2>
          <Link href="/articles" className="text-sm text-muted hover:text-foreground">
            View all →
          </Link>
        </div>

        {latestArticles?.length ? (
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {latestArticles.map((a) => (
              <CardLink key={a.id} href={`/articles/${a.slug}`} className="overflow-hidden">
                {a.cover_image && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={a.cover_image} alt="" className="h-40 w-full object-cover" />
                )}
                <div className="p-4">
                  <Badge tone="neutral">{a.type}</Badge>
                  <h3 className="mt-2 font-heading font-semibold text-foreground">{a.title}</h3>
                  {a.excerpt && (
                    <p className="mt-1 line-clamp-2 text-sm text-muted">{a.excerpt}</p>
                  )}
                </div>
              </CardLink>
            ))}
          </div>
        ) : (
          <p className="mt-4 text-sm text-muted">Aucun article publié pour l&apos;instant.</p>
        )}
      </section>

      {timelines?.length ? (
        <section className="mx-auto max-w-6xl px-6 pb-24">
          <h2 className="text-xs font-medium uppercase tracking-wide text-muted">
            Timeline Network
          </h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {timelines.map((t) => (
              <a
                key={t.id}
                href={t.domain ? `https://${t.domain}` : "#"}
                target="_blank"
                rel="noreferrer"
                className="block rounded-2xl border border-white/10 bg-surface p-5 transition hover:-translate-y-0.5 hover:border-white/20"
              >
                <h3 className="font-heading font-semibold text-foreground">{t.name}</h3>
                {t.description && <p className="mt-1 text-sm text-muted">{t.description}</p>}
                <span className="mt-3 inline-block text-sm text-blue">Explore →</span>
              </a>
            ))}
          </div>
        </section>
      ) : null}
    </main>
  );
}
