"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createServerClient } from "@techtimeline/database";
import { assertRole, ForbiddenError } from "@techtimeline/auth";

async function currentUserId(supabase: ReturnType<typeof createServerClient>) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.id ?? null;
}

// Une checkbox cochée par timeline active dans le formulaire de la ligne
// "article". Cochée -> publication "published". Décochée alors qu'une
// publication existait -> passée à "archived" (jamais supprimée : on
// garde la trace plutôt que de perdre canonical_url/historique).
export async function syncPublications(articleId: string, formData: FormData) {
  const cookieStore = await cookies();
  const supabase = createServerClient(cookieStore);

  const userId = await currentUserId(supabase);
  if (!userId) redirect("/login");

  try {
    await assertRole(userId, "editor");
  } catch (e) {
    if (e instanceof ForbiddenError) redirect("/admin/publications?error=forbidden");
    throw e;
  }

  const { data: activeTimelines } = await supabase
    .from("timelines")
    .select("id")
    .eq("status", "active");

  const checkedTimelineIds = new Set(formData.getAll("timeline_ids") as string[]);

  for (const t of activeTimelines ?? []) {
    const shouldBePublished = checkedTimelineIds.has(t.id);

    const { data: existing } = await supabase
      .from("publications")
      .select("id, status")
      .eq("article_id", articleId)
      .eq("timeline_id", t.id)
      .maybeSingle();

    if (shouldBePublished) {
      if (existing) {
        if (existing.status !== "published") {
          await supabase
            .from("publications")
            .update({ status: "published", published_at: new Date().toISOString() })
            .eq("id", existing.id);
        }
      } else {
        await supabase.from("publications").insert({
          article_id: articleId,
          timeline_id: t.id,
          status: "published",
          published_at: new Date().toISOString(),
        });
      }
    } else if (existing && existing.status === "published") {
      await supabase.from("publications").update({ status: "archived" }).eq("id", existing.id);
    }
  }

  revalidatePath("/admin/publications");
}
