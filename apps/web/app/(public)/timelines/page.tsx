import { cookies } from "next/headers";
import { createServerClient } from "@techtimeline/database";

export const revalidate = 300;

export const metadata = {
  title: "Timelines — TechTimeline",
  description: "The network of specialized technology timelines.",
};

export default async function TimelinesPage() {
  const cookieStore = await cookies();
  const supabase = createServerClient(cookieStore);

  const { data: timelines } = await supabase
    .from("timelines")
    .select("id, name, slug, domain, description, category")
    .eq("status", "active")
    .order("name");

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <h1 className="text-2xl font-semibold">Technology Timelines</h1>
      <p className="mt-2 max-w-xl text-neutral-500">
        Explore the evolution of technology across the TechTimeline network.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {timelines?.length ? (
          timelines.map((t) => (
            <a
              key={t.id}
              href={t.domain ? `https://${t.domain}` : "#"}
              target="_blank"
              rel="noreferrer"
              className="block rounded-lg border border-neutral-200 bg-white p-5 hover:border-neutral-400"
            >
              {t.category && (
                <span className="text-xs uppercase text-neutral-400">{t.category}</span>
              )}
              <h2 className="mt-1 font-medium">{t.name}</h2>
              {t.description && <p className="mt-1 text-sm text-neutral-500">{t.description}</p>}
              <span className="mt-3 inline-block text-sm text-neutral-700">Explore →</span>
            </a>
          ))
        ) : (
          <p className="text-sm text-neutral-500">Aucune timeline active pour l&apos;instant.</p>
        )}
      </div>
    </main>
  );
}
