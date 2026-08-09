import { cookies } from "next/headers";
import { createServerClient } from "@techtimeline/database";
import { ArticleForm } from "../ArticleForm";
import { createArticle } from "../actions";

export default async function NewArticlePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  const cookieStore = await cookies();
  const supabase = createServerClient(cookieStore);

  const [
    { data: categories },
    { data: brands },
    { data: tags },
    { data: timelines },
    { data: products },
    { data: technologies },
    { data: topics },
    { data: otherArticles },
  ] = await Promise.all([
    supabase.from("categories").select("id, name").order("name"),
    supabase.from("brands").select("id, name").order("name"),
    supabase.from("tags").select("id, name").order("name"),
    supabase.from("timelines").select("id, name").eq("status", "active").order("name"),
    supabase.from("products").select("id, name").order("name"),
    supabase.from("technologies").select("id, name").order("name"),
    supabase.from("topics").select("id, name").order("name"),
    supabase.from("articles").select("id, title").order("updated_at", { ascending: false }).limit(100),
  ]);

  return (
    <ArticleForm
      action={createArticle}
      error={error}
      categories={categories ?? []}
      brands={brands ?? []}
      tags={tags ?? []}
      timelines={timelines ?? []}
      products={products ?? []}
      technologies={technologies ?? []}
      topics={topics ?? []}
      otherArticles={(otherArticles ?? []).map((a) => ({ id: a.id, name: a.title }))}
    />
  );
}
