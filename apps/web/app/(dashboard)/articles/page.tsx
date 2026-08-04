import Link from "next/link";
import { cookies } from "next/headers";
import { createServerClient } from "@techtimeline/database";
import { StatusBadge } from "@techtimeline/ui";

export default async function ArticlesListPage() {
  const cookieStore = await cookies();
  const supabase = createServerClient(cookieStore);

  const { data: articles } = await supabase
    .from("articles")
    .select("id, title, status, type, destinations, updated_at")
    .order("updated_at", { ascending: false });

  return (
    <main className="mx-auto max-w-5xl p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Articles</h1>
        <Link
          href="/articles/new"
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
              href={`/articles/${article.id}/edit`}
              className="flex items-center justify-between px-4 py-3 hover:bg-neutral-50"
            >
              <div>
                <p className="font-medium">{article.title}</p>
                <p className="text-xs text-neutral-400">
                  {article.type} · {article.destinations?.join(", ") || "aucune destination"}
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
