import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { createServerClient } from "@techtimeline/database";
import { ArticleForm } from "../../ArticleForm";
import { updateArticle, deleteArticle } from "../../actions";

export default async function EditArticlePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string; saved?: string }>;
}) {
  const { id } = await params;
  const { error, saved } = await searchParams;

  const cookieStore = await cookies();
  const supabase = createServerClient(cookieStore);

  const { data: article } = await supabase
    .from("articles")
    .select("id, title, content, type, status, destinations, cover_image")
    .eq("id", id)
    .single();

  if (!article) notFound();

  const boundUpdate = updateArticle.bind(null, id);
  const boundDelete = deleteArticle.bind(null, id);

  return (
    <div>
      <ArticleForm
        action={boundUpdate}
        article={{
          title: article.title,
          content: article.content,
          type: article.type,
          status: article.status,
          destinations: article.destinations,
          coverImage: article.cover_image,
        }}
        error={error}
        saved={saved === "1"}
      />
      <form action={boundDelete} className="mx-auto max-w-2xl px-8 pb-8">
        <button type="submit" className="text-sm text-red-600 hover:underline">
          Supprimer cet article
        </button>
      </form>
    </div>
  );
}
