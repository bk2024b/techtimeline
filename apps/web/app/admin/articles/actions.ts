"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createServerClient } from "@techtimeline/database";
import { slugify, excerptFromMarkdown } from "@techtimeline/lib";
import { assertRole, ForbiddenError } from "@techtimeline/auth";
import type { ArticleStatus, ContentType } from "@techtimeline/types";

// Note : plus de champ "destinations" dans le formulaire (remplacé par
// les checkboxes timelines dès la Phase 5) — la colonne legacy
// articles.destinations, articles.category_slugs, articles.brand_slugs
// et articles.tag_slugs ont été supprimées en base (Phase 9,
// 0005_drop_denormalized_columns.sql). Plus aucune écriture ici.

type SupabaseClient = ReturnType<typeof createServerClient>;

async function syncRelations(
  supabase: SupabaseClient,
  articleId: string,
  categoryIds: string[],
  brandIds: string[],
  tagIds: string[]
) {
  await supabase.from("article_categories").delete().eq("article_id", articleId);
  await supabase.from("article_brands").delete().eq("article_id", articleId);
  await supabase.from("article_tags").delete().eq("article_id", articleId);

  if (categoryIds.length) {
    await supabase
      .from("article_categories")
      .insert(categoryIds.map((category_id) => ({ article_id: articleId, category_id })));
  }
  if (brandIds.length) {
    await supabase
      .from("article_brands")
      .insert(brandIds.map((brand_id) => ({ article_id: articleId, brand_id })));
  }
  if (tagIds.length) {
    await supabase
      .from("article_tags")
      .insert(tagIds.map((tag_id) => ({ article_id: articleId, tag_id })));
  }
}

// Même pattern delete+insert que syncRelations, pour les 3 nouvelles
// tables de jointure de la Phase 2 (pas de slugs dénormalisés ici,
// contrairement à category/brand/tag).
async function syncExtendedRelations(
  supabase: SupabaseClient,
  articleId: string,
  productIds: string[],
  technologyIds: string[],
  topicIds: string[],
  relatedIds: string[]
) {
  await supabase.from("article_products").delete().eq("article_id", articleId);
  await supabase.from("article_technologies").delete().eq("article_id", articleId);
  await supabase.from("article_topics").delete().eq("article_id", articleId);
  await supabase.from("article_relations").delete().eq("article_id", articleId);

  if (productIds.length) {
    await supabase
      .from("article_products")
      .insert(productIds.map((product_id) => ({ article_id: articleId, product_id })));
  }
  if (technologyIds.length) {
    await supabase
      .from("article_technologies")
      .insert(technologyIds.map((technology_id) => ({ article_id: articleId, technology_id })));
  }
  if (topicIds.length) {
    await supabase
      .from("article_topics")
      .insert(topicIds.map((topic_id) => ({ article_id: articleId, topic_id })));
  }
  // related_article_id = articleId serait rejeté par le check en base
  // (article_id <> related_article_id) — filtré ici pour éviter un
  // insert qui échouerait silencieusement sur cette seule ligne.
  const filteredRelated = relatedIds.filter((id) => id !== articleId);
  if (filteredRelated.length) {
    await supabase
      .from("article_relations")
      .insert(filteredRelated.map((related_article_id) => ({ article_id: articleId, related_article_id })));
  }
}

// Distribution vers les timelines actives, même logique que
// /admin/publications/actions.ts (dupliquée volontairement : contexte
// et cible de redirection différents, pas assez de logique partagée
// pour justifier un import croisé entre les deux dossiers d'actions).
async function syncPublicationsForArticle(
  supabase: SupabaseClient,
  articleId: string,
  timelineIds: string[]
) {
  const { data: activeTimelines } = await supabase
    .from("timelines")
    .select("id")
    .eq("status", "active");

  const checked = new Set(timelineIds);

  for (const t of activeTimelines ?? []) {
    const shouldBePublished = checked.has(t.id);

    const { data: existing } = await supabase
      .from("publications")
      .select("id, status")
      .eq("article_id", articleId)
      .eq("timeline_id", t.id)
      .maybeSingle();

    if (shouldBePublished) {
      if (existing) {
        if (existing.status !== "published") {
          await supabase
            .from("publications")
            .update({ status: "published", published_at: new Date().toISOString() })
            .eq("id", existing.id);
        }
      } else {
        await supabase.from("publications").insert({
          article_id: articleId,
          timeline_id: t.id,
          status: "published",
          published_at: new Date().toISOString(),
        });
      }
    } else if (existing && existing.status === "published") {
      await supabase.from("publications").update({ status: "archived" }).eq("id", existing.id);
    }
  }
}

export async function createArticle(formData: FormData) {
  const cookieStore = await cookies();
  const supabase = createServerClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const title = formData.get("title") as string;
  const content = formData.get("content") as string;
  const type = formData.get("type") as ContentType;
  const status = formData.get("status") as ArticleStatus;
  const coverImage = (formData.get("cover_image") as string) || null;

  const seoTitle = (formData.get("seo_title") as string) || null;
  const seoMetaDescription = (formData.get("seo_meta_description") as string) || null;
  const seoCanonical = (formData.get("seo_canonical") as string) || null;
  const seoOgImage = (formData.get("seo_og_image") as string) || null;

  const categoryIds = formData.getAll("category_ids") as string[];
  const brandIds = formData.getAll("brand_ids") as string[];
  const tagIds = formData.getAll("tag_ids") as string[];
  const timelineIds = formData.getAll("timeline_ids") as string[];
  const productIds = formData.getAll("product_ids") as string[];
  const technologyIds = formData.getAll("technology_ids") as string[];
  const topicIds = formData.getAll("topic_ids") as string[];
  const relatedIds = formData.getAll("related_ids") as string[];

  const { data, error } = await supabase
    .from("articles")
    .insert({
      title,
      slug: slugify(title),
      content,
      excerpt: excerptFromMarkdown(content),
      type,
      status,
      author_id: user.id,
      cover_image: coverImage,
      seo_title: seoTitle,
      seo_meta_description: seoMetaDescription,
      seo_canonical: seoCanonical,
      seo_og_image: seoOgImage,
      published_at: status === "published" ? new Date().toISOString() : null,
    })
    .select("id")
    .single();

  if (error) {
    redirect(`/admin/articles/new?error=${encodeURIComponent(error.message)}`);
  }

  await syncRelations(supabase, data.id, categoryIds, brandIds, tagIds);
  await syncExtendedRelations(supabase, data.id, productIds, technologyIds, topicIds, relatedIds);
  await syncPublicationsForArticle(supabase, data.id, timelineIds);

  revalidatePath("/admin/articles");
  redirect(`/admin/articles/${data.id}/edit`);
}

export async function updateArticle(articleId: string, formData: FormData) {
  const cookieStore = await cookies();
  const supabase = createServerClient(cookieStore);

  const title = formData.get("title") as string;
  const content = formData.get("content") as string;
  const type = formData.get("type") as ContentType;
  const status = formData.get("status") as ArticleStatus;
  const coverImage = (formData.get("cover_image") as string) || null;

  const seoTitle = (formData.get("seo_title") as string) || null;
  const seoMetaDescription = (formData.get("seo_meta_description") as string) || null;
  const seoCanonical = (formData.get("seo_canonical") as string) || null;
  const seoOgImage = (formData.get("seo_og_image") as string) || null;

  const categoryIds = formData.getAll("category_ids") as string[];
  const brandIds = formData.getAll("brand_ids") as string[];
  const tagIds = formData.getAll("tag_ids") as string[];
  const timelineIds = formData.getAll("timeline_ids") as string[];
  const productIds = formData.getAll("product_ids") as string[];
  const technologyIds = formData.getAll("technology_ids") as string[];
  const topicIds = formData.getAll("topic_ids") as string[];
  const relatedIds = formData.getAll("related_ids") as string[];

  const { error } = await supabase
    .from("articles")
    .update({
      title,
      slug: slugify(title),
      content,
      excerpt: excerptFromMarkdown(content),
      type,
      status,
      cover_image: coverImage,
      seo_title: seoTitle,
      seo_meta_description: seoMetaDescription,
      seo_canonical: seoCanonical,
      seo_og_image: seoOgImage,
      published_at: status === "published" ? new Date().toISOString() : null,
    })
    .eq("id", articleId);

  if (error) {
    redirect(`/admin/articles/${articleId}/edit?error=${encodeURIComponent(error.message)}`);
  }

  await syncRelations(supabase, articleId, categoryIds, brandIds, tagIds);
  await syncExtendedRelations(supabase, articleId, productIds, technologyIds, topicIds, relatedIds);
  await syncPublicationsForArticle(supabase, articleId, timelineIds);

  revalidatePath("/admin/articles");
  redirect(`/admin/articles/${articleId}/edit?saved=1`);
}

export async function deleteArticle(articleId: string) {
  const cookieStore = await cookies();
  const supabase = createServerClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  try {
    // Les RLS (articles_staff_delete) l'exigeaient déjà côté DB, mais un
    // writer qui cliquait "Supprimer" n'avait aucun retour : l'insert
    // échouait silencieusement (erreur jamais vérifiée). Ici on prévient
    // avant, avec un message clair.
    await assertRole(user.id, "editor");
  } catch (e) {
    if (e instanceof ForbiddenError) {
      redirect(`/admin/articles/${articleId}/edit?error=forbidden`);
    }
    throw e;
  }

  const { error } = await supabase.from("articles").delete().eq("id", articleId);
  if (error) {
    redirect(`/admin/articles/${articleId}/edit?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/admin/articles");
  redirect("/admin/articles");
}

// Upload d'une image vers le bucket Storage "media" (déjà créé dans Supabase, public)
export async function uploadCoverImage(formData: FormData): Promise<string | null> {
  const cookieStore = await cookies();
  const supabase = createServerClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const file = formData.get("file") as File;
  if (!file || file.size === 0) return null;

  const path = `articles/${Date.now()}-${slugify(file.name)}`;
  const { error: uploadError } = await supabase.storage.from("media").upload(path, file, {
    contentType: file.type,
  });

  if (uploadError) return null;

  const { data: publicUrlData } = supabase.storage.from("media").getPublicUrl(path);
  const publicUrl = publicUrlData.publicUrl;

  // Trace l'upload dans la table `media` (RLS: insert autorisé seulement
  // si uploaded_by = auth.uid()). Non bloquant si ça échoue : le fichier
  // est déjà en Storage, on ne veut pas faire perdre l'image à l'auteur
  // pour une erreur de traçabilité.
  const { error: mediaError } = await supabase.from("media").insert({
    url: publicUrl,
    alt: slugify(file.name),
    uploaded_by: user.id,
    folder: "articles",
  });

  if (mediaError) {
    console.error("media insert failed (fichier uploadé quand même):", mediaError.message);
  }

  return publicUrl;
}
