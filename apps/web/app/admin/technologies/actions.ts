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

export async function createTechnology(formData: FormData) {
  const name = formData.get("name") as string;
  const description = (formData.get("description") as string) || null;
  const cookieStore = await cookies();
  const supabase = createServerClient(cookieStore);

  const userId = await currentUserId(supabase);
  if (!userId) redirect("/login");

  try {
    await assertRole(userId, "editor");
  } catch (e) {
    if (e instanceof ForbiddenError) redirect("/admin/technologies?error=forbidden");
    throw e;
  }

  const { error } = await supabase.from("technologies").insert({ name, slug: slugify(name), description });
  if (error) redirect(`/admin/technologies?error=${encodeURIComponent(error.message)}`);

  revalidatePath("/admin/technologies");
}

export async function updateTechnology(id: string, formData: FormData) {
  const name = formData.get("name") as string;
  const description = (formData.get("description") as string) || null;
  const cookieStore = await cookies();
  const supabase = createServerClient(cookieStore);

  const userId = await currentUserId(supabase);
  if (!userId) redirect("/login");

  try {
    await assertRole(userId, "editor");
  } catch (e) {
    if (e instanceof ForbiddenError) redirect("/admin/technologies?error=forbidden");
    throw e;
  }

  const { error } = await supabase
    .from("technologies")
    .update({ name, slug: slugify(name), description })
    .eq("id", id);
  if (error) redirect(`/admin/technologies?error=${encodeURIComponent(error.message)}`);

  revalidatePath("/admin/technologies");
}

export async function deleteTechnology(id: string) {
  const cookieStore = await cookies();
  const supabase = createServerClient(cookieStore);

  const userId = await currentUserId(supabase);
  if (!userId) redirect("/login");

  try {
    await assertRole(userId, "editor");
  } catch (e) {
    if (e instanceof ForbiddenError) redirect("/admin/technologies?error=forbidden");
    throw e;
  }

  const { error } = await supabase.from("technologies").delete().eq("id", id);
  if (error) redirect(`/admin/technologies?error=${encodeURIComponent(error.message)}`);

  revalidatePath("/admin/technologies");
}
