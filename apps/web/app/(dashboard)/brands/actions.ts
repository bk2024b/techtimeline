"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { createServerClient } from "@techtimeline/database";
import { slugify } from "@techtimeline/lib";

export async function createBrand(formData: FormData) {
  const name = formData.get("name") as string;
  const cookieStore = await cookies();
  const supabase = createServerClient(cookieStore);

  await supabase.from("brands").insert({ name, slug: slugify(name) });

  revalidatePath("/brands");
}

export async function deleteBrand(id: string) {
  const cookieStore = await cookies();
  const supabase = createServerClient(cookieStore);

  await supabase.from("brands").delete().eq("id", id);

  revalidatePath("/brands");
}
