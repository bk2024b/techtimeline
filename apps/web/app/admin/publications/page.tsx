import { cookies } from "next/headers";
import { createServerClient } from "@techtimeline/database";
import { syncPublications } from "./actions";

export default async function PublicationsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const cookieStore = await cookies();
  const supabase = createServerClient(cookieStore);

  const [{ data: articles }, { data: timelines }, { data: publications }] = await Promise.all([
    supabase
      .from("articles")
      .select("id, title, status")
      .order("updated_at", { ascending: false })
      .limit(50),
    supabase.from("timelines").select("id, name, slug").eq("status", "active").order("name"),
    supabase.from("publications").select("article_id, timeline_id, status"),
  ]);

  const publishedSet = new Set(
    (publications ?? [])
      .filter((p) => p.status === "published")
      .map((p) => `${p.article_id}:${p.timeline_id}`)
  );

  return (
    <main className="mx-auto max-w-5xl p-8">
      <h1 className="text-2xl font-semibold">Publications</h1>
      <p className="mt-1 text-sm text-neutral-500">
        Distribution des 50 articles les plus récemment modifiés vers les
        timelines actives. Décocher archive la publication (ne supprime
        rien).
      </p>

      {error && (
        <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {error === "forbidden"
            ? "Action non autorisée : rôle insuffisant (editor ou admin requis)."
            : error}
        </p>
      )}

      {!timelines?.length ? (
        <p className="mt-6 text-sm text-neutral-500">
          Aucune timeline active. Ajoute-en une depuis /admin/timelines.
        </p>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-lg border border-neutral-200 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-200 text-left text-xs uppercase text-neutral-400">
                <th className="px-4 py-2">Article</th>
                {timelines.map((t) => (
                  <th key={t.id} className="px-3 py-2 text-center">
                    {t.name}
                  </th>
                ))}
                <th className="px-3 py-2" />
              </tr>
            </thead>
            <tbody>
              {articles?.length ? (
                articles.map((a) => (
                  <tr key={a.id} className="border-b border-neutral-100 last:border-0">
                    <td colSpan={timelines.length + 2} className="p-0">
                      <form
                        action={syncPublications.bind(null, a.id)}
                        className="flex items-center px-4 py-2"
                      >
                        <span className="flex-1 truncate pr-4">
                          {a.title}{" "}
                          <span className="text-xs text-neutral-400">({a.status})</span>
                        </span>
                        {timelines.map((t) => (
                          <span key={t.id} className="w-[--col] px-3 text-center" style={{ width: 90 }}>
                            <input
                              type="checkbox"
                              name="timeline_ids"
                              value={t.id}
                              defaultChecked={publishedSet.has(`${a.id}:${t.id}`)}
                            />
                          </span>
                        ))}
                        <button
                          type="submit"
                          className="ml-3 shrink-0 text-sm text-neutral-600 hover:underline"
                        >
                          Enregistrer
                        </button>
                      </form>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="px-4 py-6 text-sm text-neutral-500">Aucun article.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
