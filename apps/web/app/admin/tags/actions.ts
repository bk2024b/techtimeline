"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createServerClient } from "@techtimeline/database";
import { slugify } from "@techtimeline/lib";
import { assertRole, ForbiddenError } from "@techtimeline/auth";

async function currentUserId(supabase: ReturnType<typeof createServerClient>) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.id ?? null;
}

export async function createTag(formData: FormData) {
  const name = formData.get("name") as string;
  const cookieStore = await cookies();
  const supabase = createServerClient(cookieStore);

  const userId = await currentUserId(supabase);
  if (!userId) redirect("/login");

  try {
    await assertRole(userId, "editor");
  } catch (e) {
    if (e instanceof ForbiddenError) redirect("/admin/tags?error=forbidden");
    throw e;
  }

  const { error } = await supabase.from("tags").insert({ name, slug: slugify(name) });
  if (error) redirect(`/admin/tags?error=${encodeURIComponent(error.message)}`);

  revalidatePath("/admin/tags");
}

export async function updateTag(id: string, formData: FormData) {
  const name = formData.get("name") as string;
  const cookieStore = await cookies();
  const supabase = createServerClient(cookieStore);

  const userId = await currentUserId(supabase);
  if (!userId) redirect("/login");

  try {
    await assertRole(userId, "editor");
  } catch (e) {
    if (e instanceof ForbiddenError) redirect("/admin/tags?error=forbidden");
    throw e;
  }

  const { error } = await supabase
    .from("tags")
    .update({ name, slug: slugify(name) })
    .eq("id", id);
  if (error) redirect(`/admin/tags?error=${encodeURIComponent(error.message)}`);

  revalidatePath("/admin/tags");
}

export async function deleteTag(id: string) {
  const cookieStore = await cookies();
  const supabase = createServerClient(cookieStore);

  const userId = await currentUserId(supabase);
  if (!userId) redirect("/login");

  try {
    await assertRole(userId, "editor");
  } catch (e) {
    if (e instanceof ForbiddenError) redirect("/admin/tags?error=forbidden");
    throw e;
  }

  // Une tag liée à des articles a des lignes article_tags en
  // cascade (FK) — la suppression échoue proprement via la contrainte
  // plutôt que de laisser des articles avec une référence fantôme.
  const { error } = await supabase.from("tags").delete().eq("id", id);
  if (error) redirect(`/admin/tags?error=${encodeURIComponent(error.message)}`);

  revalidatePath("/admin/tags");
}
