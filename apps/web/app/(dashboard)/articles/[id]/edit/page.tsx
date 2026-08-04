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

  const [
    { data: article },
    { data: categories },
    { data: brands },
    { data: tags },
    { data: articleCategories },
    { data: articleBrands },
    { data: articleTags },
  ] = await Promise.all([
    supabase
      .from("articles")
      .select("id, title, content, type, status, destinations, cover_image")
      .eq("id", id)
      .single(),
    supabase.from("categories").select("id, name").order("name"),
    supabase.from("brands").select("id, name").order("name"),
    supabase.from("tags").select("id, name").order("name"),
    supabase.from("article_categories").select("category_id").eq("article_id", id),
    supabase.from("article_brands").select("brand_id").eq("article_id", id),
    supabase.from("article_tags").select("tag_id").eq("article_id", id),
  ]);

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
        categories={categories ?? []}
        brands={brands ?? []}
        tags={tags ?? []}
        selectedCategoryIds={(articleCategories ?? []).map((r) => r.category_id)}
        selectedBrandIds={(articleBrands ?? []).map((r) => r.brand_id)}
        selectedTagIds={(articleTags ?? []).map((r) => r.tag_id)}
      />
      <form action={boundDelete} className="mx-auto max-w-2xl px-8 pb-8">
        <button type="submit" className="text-sm text-red-600 hover:underline">
          Supprimer cet article
        </button>
      </form>
    </div>
  );
}
