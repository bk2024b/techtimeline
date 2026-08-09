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

export async function createProduct(formData: FormData) {
  const name = formData.get("name") as string;
  const brandId = (formData.get("brand_id") as string) || null;
  const categoryId = (formData.get("category_id") as string) || null;
  const releasedAt = (formData.get("released_at") as string) || null;

  const cookieStore = await cookies();
  const supabase = createServerClient(cookieStore);

  const userId = await currentUserId(supabase);
  if (!userId) redirect("/login");

  try {
    await assertRole(userId, "editor");
  } catch (e) {
    if (e instanceof ForbiddenError) redirect("/admin/products?error=forbidden");
    throw e;
  }

  const { error } = await supabase.from("products").insert({
    name,
    slug: slugify(name),
    brand_id: brandId,
    category_id: categoryId,
    released_at: releasedAt,
  });
  if (error) redirect(`/admin/products?error=${encodeURIComponent(error.message)}`);

  revalidatePath("/admin/products");
}

export async function updateProduct(id: string, formData: FormData) {
  const name = formData.get("name") as string;
  const brandId = (formData.get("brand_id") as string) || null;
  const categoryId = (formData.get("category_id") as string) || null;
  const releasedAt = (formData.get("released_at") as string) || null;

  const cookieStore = await cookies();
  const supabase = createServerClient(cookieStore);

  const userId = await currentUserId(supabase);
  if (!userId) redirect("/login");

  try {
    await assertRole(userId, "editor");
  } catch (e) {
    if (e instanceof ForbiddenError) redirect("/admin/products?error=forbidden");
    throw e;
  }

  const { error } = await supabase
    .from("products")
    .update({
      name,
      slug: slugify(name),
      brand_id: brandId,
      category_id: categoryId,
      released_at: releasedAt,
    })
    .eq("id", id);
  if (error) redirect(`/admin/products?error=${encodeURIComponent(error.message)}`);

  revalidatePath("/admin/products");
}

export async function deleteProduct(id: string) {
  const cookieStore = await cookies();
  const supabase = createServerClient(cookieStore);

  const userId = await currentUserId(supabase);
  if (!userId) redirect("/login");

  try {
    await assertRole(userId, "editor");
  } catch (e) {
    if (e instanceof ForbiddenError) redirect("/admin/products?error=forbidden");
    throw e;
  }

  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) redirect(`/admin/products?error=${encodeURIComponent(error.message)}`);

  revalidatePath("/admin/products");
}
