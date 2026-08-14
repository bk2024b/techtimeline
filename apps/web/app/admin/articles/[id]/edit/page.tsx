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
    { data: timelines },
    { data: products },
    { data: technologies },
    { data: topics },
    { data: otherArticlesRaw },
    { data: articleCategories },
    { data: articleBrands },
    { data: articleTags },
    { data: articleProducts },
    { data: articleTechnologies },
    { data: articleTopics },
    { data: articleRelations },
    { data: articlePublications },
  ] = await Promise.all([
    supabase
      .from("articles")
      .select(
        "id, title, content, type, status, cover_image, seo_title, seo_meta_description, seo_canonical, seo_og_image"
      )
      .eq("id", id)
      .single(),
    supabase.from("categories").select("id, name").order("name"),
    supabase.from("brands").select("id, name").order("name"),
    supabase.from("tags").select("id, name").order("name"),
    supabase.from("timelines").select("id, name").eq("status", "active").order("name"),
    supabase.from("products").select("id, name").order("name"),
    supabase.from("technologies").select("id, name").order("name"),
    supabase.from("topics").select("id, name").order("name"),
    supabase
      .from("articles")
      .select("id, title")
      .neq("id", id)
      .order("updated_at", { ascending: false })
      .limit(100),
    supabase.from("article_categories").select("category_id").eq("article_id", id),
    supabase.from("article_brands").select("brand_id").eq("article_id", id),
    supabase.from("article_tags").select("tag_id").eq("article_id", id),
    supabase.from("article_products").select("product_id").eq("article_id", id),
    supabase.from("article_technologies").select("technology_id").eq("article_id", id),
    supabase.from("article_topics").select("topic_id").eq("article_id", id),
    supabase.from("article_relations").select("related_article_id").eq("article_id", id),
    supabase.from("publications").select("timeline_id, status").eq("article_id", id),
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
          coverImage: article.cover_image,
          seo: {
            title: article.seo_title ?? "",
            metaDescription: article.seo_meta_description ?? "",
            canonical: article.seo_canonical ?? "",
            ogImage: article.seo_og_image ?? "",
          },
        }}
        error={error}
        saved={saved === "1"}
        categories={categories ?? []}
        brands={brands ?? []}
        tags={tags ?? []}
        timelines={timelines ?? []}
        products={products ?? []}
        technologies={technologies ?? []}
        topics={topics ?? []}
        otherArticles={(otherArticlesRaw ?? []).map((a) => ({ id: a.id, name: a.title }))}
        selectedCategoryIds={(articleCategories ?? []).map((r) => r.category_id)}
        selectedBrandIds={(articleBrands ?? []).map((r) => r.brand_id)}
        selectedTagIds={(articleTags ?? []).map((r) => r.tag_id)}
        selectedProductIds={(articleProducts ?? []).map((r) => r.product_id)}
        selectedTechnologyIds={(articleTechnologies ?? []).map((r) => r.technology_id)}
        selectedTopicIds={(articleTopics ?? []).map((r) => r.topic_id)}
        selectedRelatedIds={(articleRelations ?? []).map((r) => r.related_article_id)}
        selectedTimelineIds={(articlePublications ?? [])
          .filter((p) => p.status === "published")
          .map((p) => p.timeline_id)}
      />
      <form action={boundDelete} className="mx-auto max-w-2xl px-8 pb-8">
        <button type="submit" className="text-sm text-red-600 hover:underline">
          Supprimer cet article
        </button>
      </form>
    </div>
  );
}
