import { cookies } from "next/headers";
import { createServerClient } from "@techtimeline/database";
import { createTag, deleteTag } from "./actions";

export default async function TagsPage() {
  const cookieStore = await cookies();
  const supabase = createServerClient(cookieStore);
  const { data: tags } = await supabase
    .from("tags")
    .select("id, name, slug")
    .order("name");

  return (
    <main className="mx-auto max-w-2xl p-8">
      <h1 className="text-2xl font-semibold">Tags</h1>

      <form action={createTag} className="mt-6 flex gap-2">
        <input
          name="name"
          placeholder="Ex: usb-c"
          required
          className="flex-1 rounded-md border border-neutral-300 px-3 py-2 text-sm"
        />
        <button
          type="submit"
          className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800"
        >
          Ajouter
        </button>
      </form>

      <ul className="mt-6 divide-y divide-neutral-200 rounded-lg border border-neutral-200 bg-white">
        {tags?.length ? (
          tags.map((c) => (
            <li key={c.id} className="flex items-center justify-between px-4 py-3">
              <span>
                {c.name} <span className="text-xs text-neutral-400">/{c.slug}</span>
              </span>
              <form action={deleteTag.bind(null, c.id)}>
                <button type="submit" className="text-sm text-red-600 hover:underline">
                  Supprimer
                </button>
              </form>
            </li>
          ))
        ) : (
          <li className="px-4 py-6 text-sm text-neutral-500">Aucun tag.</li>
        )}
      </ul>
    </main>
  );
}
