"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { createServerClient } from "@techtimeline/database";
import { slugify } from "@techtimeline/lib";

export async function createTag(formData: FormData) {
  const name = formData.get("name") as string;
  const cookieStore = await cookies();
  const supabase = createServerClient(cookieStore);

  await supabase.from("tags").insert({ name, slug: slugify(name) });

  revalidatePath("/admin/tags");
}

export async function deleteTag(id: string) {
  const cookieStore = await cookies();
  const supabase = createServerClient(cookieStore);

  await supabase.from("tags").delete().eq("id", id);

  revalidatePath("/admin/tags");
}
