"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { createServerClient } from "@techtimeline/database";
import { slugify } from "@techtimeline/lib";

export async function createCategory(formData: FormData) {
  const name = formData.get("name") as string;
  const cookieStore = await cookies();
  const supabase = createServerClient(cookieStore);

  await supabase.from("categories").insert({ name, slug: slugify(name) });

  revalidatePath("/categories");
}

export async function deleteCategory(id: string) {
  const cookieStore = await cookies();
  const supabase = createServerClient(cookieStore);

  await supabase.from("categories").delete().eq("id", id);

  revalidatePath("/categories");
}
