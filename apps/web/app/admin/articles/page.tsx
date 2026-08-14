import Link from "next/link";
import { cookies } from "next/headers";
import { createServerClient } from "@techtimeline/database";
import { StatusBadge } from "@techtimeline/ui";

export default async function ArticlesListPage() {
  const cookieStore = await cookies();
  const supabase = createServerClient(cookieStore);

  const { data: articles } = await supabase
    .from("articles")
    .select("id, title, status, type, updated_at")
    .order("updated_at", { ascending: false });

  const articleIds = (articles ?? []).map((a) => a.id);

  // Remplace l'ancien article.destinations?.join(", ") (colonne supprimée
  // en Phase 9) : une requête groupée sur publications plutôt qu'une
  // requête par article dans la boucle de rendu (évite un N+1).
  const { data: pubs } = articleIds.length
    ? await supabase
        .from("publications")
        .select("article_id, timeline:timelines(name)")
        .in("article_id", articleIds)
        .eq("status", "published")
    : { data: [] };

  const timelineNamesByArticle = new Map<string, string[]>();
  for (const p of pubs ?? []) {
    const timeline = Array.isArray(p.timeline) ? p.timeline[0] : p.timeline;
    if (!timeline?.name) continue;
    const list = timelineNamesByArticle.get(p.article_id) ?? [];
    list.push(timeline.name);
    timelineNamesByArticle.set(p.article_id, list);
  }

  return (
    <main className="mx-auto max-w-5xl p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Articles</h1>
        <Link
          href="/admin/articles/new"
          className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800"
        >
          Nouvel article
        </Link>
      </div>

      <div className="mt-6 divide-y divide-neutral-200 rounded-lg border border-neutral-200 bg-white">
        {articles?.length ? (
          articles.map((article) => (
            <Link
              key={article.id}
              href={`/admin/articles/${article.id}/edit`}
              className="flex items-center justify-between px-4 py-3 hover:bg-neutral-50"
            >
              <div>
                <p className="font-medium">{article.title}</p>
                <p className="text-xs text-neutral-400">
                  {article.type} ·{" "}
                  {(timelineNamesByArticle.get(article.id) ?? []).join(", ") || "non publié"}
                </p>
              </div>
              <StatusBadge status={article.status} />
            </Link>
          ))
        ) : (
          <p className="px-4 py-6 text-sm text-neutral-500">Aucun article pour le moment.</p>
        )}
      </div>
    </main>
  );
}
