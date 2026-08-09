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

export async function createBrand(formData: FormData) {
  const name = formData.get("name") as string;
  const logo = (formData.get("logo") as string) || null;
  const cookieStore = await cookies();
  const supabase = createServerClient(cookieStore);

  const userId = await currentUserId(supabase);
  if (!userId) redirect("/login");

  try {
    await assertRole(userId, "editor");
  } catch (e) {
    if (e instanceof ForbiddenError) redirect("/admin/brands?error=forbidden");
    throw e;
  }

  const { error } = await supabase.from("brands").insert({ name, slug: slugify(name), logo });
  if (error) redirect(`/admin/brands?error=${encodeURIComponent(error.message)}`);

  revalidatePath("/admin/brands");
}

export async function updateBrand(id: string, formData: FormData) {
  const name = formData.get("name") as string;
  const logo = (formData.get("logo") as string) || null;
  const cookieStore = await cookies();
  const supabase = createServerClient(cookieStore);

  const userId = await currentUserId(supabase);
  if (!userId) redirect("/login");

  try {
    await assertRole(userId, "editor");
  } catch (e) {
    if (e instanceof ForbiddenError) redirect("/admin/brands?error=forbidden");
    throw e;
  }

  const { error } = await supabase
    .from("brands")
    .update({ name, slug: slugify(name), logo })
    .eq("id", id);
  if (error) redirect(`/admin/brands?error=${encodeURIComponent(error.message)}`);

  revalidatePath("/admin/brands");
}

export async function deleteBrand(id: string) {
  const cookieStore = await cookies();
  const supabase = createServerClient(cookieStore);

  const userId = await currentUserId(supabase);
  if (!userId) redirect("/login");

  try {
    await assertRole(userId, "editor");
  } catch (e) {
    if (e instanceof ForbiddenError) redirect("/admin/brands?error=forbidden");
    throw e;
  }

  const { error } = await supabase.from("brands").delete().eq("id", id);
  if (error) redirect(`/admin/brands?error=${encodeURIComponent(error.message)}`);

  revalidatePath("/admin/brands");
}
