import Link from "next/link";
import { cookies } from "next/headers";
import { createServerClient } from "@techtimeline/database";

export const revalidate = 300;

export const metadata = {
  title: "Topics — TechTimeline",
};

export default async function TopicsPage() {
  const cookieStore = await cookies();
  const supabase = createServerClient(cookieStore);

  const { data: topics } = await supabase
    .from("topics")
    .select("id, name, slug, description")
    .order("name");

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <h1 className="font-heading text-3xl font-semibold text-foreground">Topics</h1>

      <div className="mt-8 flex flex-wrap gap-2">
        {topics?.length ? (
          topics.map((t) => (
            <Link
              key={t.id}
              href={`/topics/${t.slug}`}
              className="rounded-full border border-white/10 bg-surface px-4 py-1.5 text-sm text-foreground hover:border-white/25"
            >
              {t.name}
            </Link>
          ))
        ) : (
          <p className="text-sm text-muted">Aucun topic pour l&apos;instant.</p>
        )}
      </div>
    </main>
  );
}
