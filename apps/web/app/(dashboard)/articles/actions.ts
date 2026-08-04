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
      published_at: status === "published" ? new Date().toISOString() : null,
    })
    .select("id")
    .single();

  if (error) {
    redirect(`/articles/new?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/articles");
  redirect(`/articles/${data.id}/edit`);
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
      published_at: status === "published" ? new Date().toISOString() : null,
    })
    .eq("id", articleId);

  if (error) {
    redirect(`/articles/${articleId}/edit?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/articles");
  redirect(`/articles/${articleId}/edit?saved=1`);
}

export async function deleteArticle(articleId: string) {
  const cookieStore = await cookies();
  const supabase = createServerClient(cookieStore);

  await supabase.from("articles").delete().eq("id", articleId);

  revalidatePath("/articles");
  redirect("/articles");
}

// Upload d'une image vers le bucket Storage "media" (à créer dans Supabase, public)
export async function uploadCoverImage(formData: FormData): Promise<string | null> {
  const cookieStore = await cookies();
  const supabase = createServerClient(cookieStore);

  const file = formData.get("file") as File;
  if (!file || file.size === 0) return null;

  const path = `articles/${Date.now()}-${slugify(file.name)}`;
  const { error } = await supabase.storage.from("media").upload(path, file, {
    contentType: file.type,
  });

  if (error) return null;

  const { data } = supabase.storage.from("media").getPublicUrl(path);
  return data.publicUrl;
}
