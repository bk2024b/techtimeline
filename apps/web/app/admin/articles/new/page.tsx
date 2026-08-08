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

  const [{ data: categories }, { data: brands }, { data: tags }] = await Promise.all([
    supabase.from("categories").select("id, name").order("name"),
    supabase.from("brands").select("id, name").order("name"),
    supabase.from("tags").select("id, name").order("name"),
  ]);

  return (
    <ArticleForm
      action={createArticle}
      error={error}
      categories={categories ?? []}
      brands={brands ?? []}
      tags={tags ?? []}
    />
  );
}
