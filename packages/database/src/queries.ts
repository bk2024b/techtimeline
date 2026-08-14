import type { SupabaseClient } from "@supabase/supabase-js";

// Remplace le filtrage sur articles.category_slugs (colonne dénormalisée
// supprimée en Phase 9, cf. 0005_drop_denormalized_columns.sql). Marche
// avec createServerClient (apps/web, RLS anon) comme avec
// createServiceClient (apps/api, bypass RLS) : accepte n'importe quel
// SupabaseClient plutôt qu'un type précis.
export async function getArticleIdsByCategorySlug(
  supabase: SupabaseClient,
  categorySlug: string
): Promise<string[]> {
  const { data: category } = await supabase
    .from("categories")
    .select("id")
    .eq("slug", categorySlug)
    .maybeSingle();

  if (!category) return [];

  const { data: links } = await supabase
    .from("article_categories")
    .select("article_id")
    .eq("category_id", category.id);

  return (links ?? []).map((l) => l.article_id as string);
}
