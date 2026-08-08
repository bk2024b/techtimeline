"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createServerClient } from "@techtimeline/database";
import { slugify, excerptFromMarkdown } from "@techtimeline/lib";
import type { ArticleStatus, ContentType } from "@techtimeline/types";

function parseDestinations(raw: string): string[] {
  return raw
    .split(",")
    .map((d) => d.trim().toLowerCase())
    .filter(Boolean);
}

type SupabaseClient = ReturnType<typeof createServerClient>;

async function slugsFor(
  supabase: SupabaseClient,
  table: "categories" | "brands" | "tags",
  ids: string[]
): Promise<string[]> {
  if (ids.length === 0) return [];
  const { data } = await supabase.from(table).select("slug").in("id", ids);
  return (data ?? []).map((row) => row.slug as string);
}

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
  const destinations = parseDestinations(formData.get("destinations") as string);
  const coverImage = (formData.get("cover_image") as string) || null;

  const seoTitle = (formData.get("seo_title") as string) || null;
  const seoMetaDescription = (formData.get("seo_meta_description") as string) || null;
  const seoCanonical = (formData.get("seo_canonical") as string) || null;
  const seoOgImage = (formData.get("seo_og_image") as string) || null;

  const categoryIds = formData.getAll("category_ids") as string[];
  const brandIds = formData.getAll("brand_ids") as string[];
  const tagIds = formData.getAll("tag_ids") as string[];

  const [categorySlugs, brandSlugs, tagSlugs] = await Promise.all([
    slugsFor(supabase, "categories", categoryIds),
    slugsFor(supabase, "brands", brandIds),
    slugsFor(supabase, "tags", tagIds),
  ]);

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
      destinations,
      cover_image: coverImage,
      seo_title: seoTitle,
      seo_meta_description: seoMetaDescription,
      seo_canonical: seoCanonical,
      seo_og_image: seoOgImage,
      category_slugs: categorySlugs,
      brand_slugs: brandSlugs,
      tag_slugs: tagSlugs,
      published_at: status === "published" ? new Date().toISOString() : null,
    })
    .select("id")
    .single();

  if (error) {
    redirect(`/admin/articles/new?error=${encodeURIComponent(error.message)}`);
  }

  await syncRelations(supabase, data.id, categoryIds, brandIds, tagIds);

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
  const destinations = parseDestinations(formData.get("destinations") as string);
  const coverImage = (formData.get("cover_image") as string) || null;

  const seoTitle = (formData.get("seo_title") as string) || null;
  const seoMetaDescription = (formData.get("seo_meta_description") as string) || null;
  const seoCanonical = (formData.get("seo_canonical") as string) || null;
  const seoOgImage = (formData.get("seo_og_image") as string) || null;

  const categoryIds = formData.getAll("category_ids") as string[];
  const brandIds = formData.getAll("brand_ids") as string[];
  const tagIds = formData.getAll("tag_ids") as string[];

  const [categorySlugs, brandSlugs, tagSlugs] = await Promise.all([
    slugsFor(supabase, "categories", categoryIds),
    slugsFor(supabase, "brands", brandIds),
    slugsFor(supabase, "tags", tagIds),
  ]);

  const { error } = await supabase
    .from("articles")
    .update({
      title,
      slug: slugify(title),
      content,
      excerpt: excerptFromMarkdown(content),
      type,
      status,
      destinations,
      cover_image: coverImage,
      seo_title: seoTitle,
      seo_meta_description: seoMetaDescription,
      seo_canonical: seoCanonical,
      seo_og_image: seoOgImage,
      category_slugs: categorySlugs,
      brand_slugs: brandSlugs,
      tag_slugs: tagSlugs,
      published_at: status === "published" ? new Date().toISOString() : null,
    })
    .eq("id", articleId);

  if (error) {
    redirect(`/admin/articles/${articleId}/edit?error=${encodeURIComponent(error.message)}`);
  }

  await syncRelations(supabase, articleId, categoryIds, brandIds, tagIds);

  revalidatePath("/admin/articles");
  redirect(`/admin/articles/${articleId}/edit?saved=1`);
}

export async function deleteArticle(articleId: string) {
  const cookieStore = await cookies();
  const supabase = createServerClient(cookieStore);

  await supabase.from("articles").delete().eq("id", articleId);

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
