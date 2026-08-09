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

export async function createTimeline(formData: FormData) {
  const name = formData.get("name") as string;
  const domain = (formData.get("domain") as string) || null;
  const description = (formData.get("description") as string) || null;
  const category = (formData.get("category") as string) || null;

  const cookieStore = await cookies();
  const supabase = createServerClient(cookieStore);

  const userId = await currentUserId(supabase);
  if (!userId) redirect("/login");

  try {
    await assertRole(userId, "editor");
  } catch (e) {
    if (e instanceof ForbiddenError) redirect("/admin/timelines?error=forbidden");
    throw e;
  }

  const { error } = await supabase
    .from("timelines")
    .insert({ name, slug: slugify(name), domain, description, category });
  if (error) redirect(`/admin/timelines?error=${encodeURIComponent(error.message)}`);

  revalidatePath("/admin/timelines");
}

export async function updateTimeline(id: string, formData: FormData) {
  const name = formData.get("name") as string;
  const domain = (formData.get("domain") as string) || null;
  const description = (formData.get("description") as string) || null;
  const category = (formData.get("category") as string) || null;
  const status = formData.get("status") as string;

  const cookieStore = await cookies();
  const supabase = createServerClient(cookieStore);

  const userId = await currentUserId(supabase);
  if (!userId) redirect("/login");

  try {
    await assertRole(userId, "editor");
  } catch (e) {
    if (e instanceof ForbiddenError) redirect("/admin/timelines?error=forbidden");
    throw e;
  }

  const { error } = await supabase
    .from("timelines")
    .update({ name, slug: slugify(name), domain, description, category, status })
    .eq("id", id);
  if (error) redirect(`/admin/timelines?error=${encodeURIComponent(error.message)}`);

  revalidatePath("/admin/timelines");
}

export async function deleteTimeline(id: string) {
  const cookieStore = await cookies();
  const supabase = createServerClient(cookieStore);

  const userId = await currentUserId(supabase);
  if (!userId) redirect("/login");

  try {
    // admin uniquement : supprimer une timeline supprime en cascade toutes
    // ses publications (FK on delete cascade posée en 0001_domain_v2.sql).
    await assertRole(userId, "admin");
  } catch (e) {
    if (e instanceof ForbiddenError) redirect("/admin/timelines?error=forbidden");
    throw e;
  }

  const { error } = await supabase.from("timelines").delete().eq("id", id);
  if (error) redirect(`/admin/timelines?error=${encodeURIComponent(error.message)}`);

  revalidatePath("/admin/timelines");
}
