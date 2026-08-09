import { cookies } from "next/headers";
import { createServerClient } from "@techtimeline/database";
import { createTechnology, updateTechnology, deleteTechnology } from "./actions";

export default async function TechnologiesPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const cookieStore = await cookies();
  const supabase = createServerClient(cookieStore);
  const { data: items } = await supabase
    .from("technologies")
    .select("id, name, slug, description")
    .order("name");

  return (
    <main className="mx-auto max-w-2xl p-8">
      <h1 className="text-2xl font-semibold">Technologies</h1>

      {error && (
        <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {error === "forbidden"
            ? "Action non autorisée : rôle insuffisant (editor ou admin requis)."
            : error}
        </p>
      )}

      <form action={createTechnology} className="mt-6 flex gap-2">
        <input
          name="name"
          placeholder="Ex"
          required
          className="flex-1 rounded-md border border-neutral-300 px-3 py-2 text-sm"
        />
        <input
          name="description"
          placeholder="Description (optionnel)"
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
        {items?.length ? (
          items.map((item) => (
            <li key={item.id} className="flex items-center justify-between gap-3 px-4 py-3">
              <form
                action={updateTechnology.bind(null, item.id)}
                className="flex flex-1 items-center gap-2"
              >
                <input
                  name="name"
                  defaultValue={item.name}
                  className="w-40 rounded-md border border-neutral-200 px-2 py-1 text-sm"
                />
                <input
                  name="description"
                  defaultValue={item.description ?? ""}
                  className="flex-1 rounded-md border border-neutral-200 px-2 py-1 text-sm"
                />
                <span className="text-xs text-neutral-400">/{item.slug}</span>
                <button type="submit" className="text-sm text-neutral-600 hover:underline">
                  Enregistrer
                </button>
              </form>
              <form action={deleteTechnology.bind(null, item.id)}>
                <button type="submit" className="text-sm text-red-600 hover:underline">
                  Supprimer
                </button>
              </form>
            </li>
          ))
        ) : (
          <li className="px-4 py-6 text-sm text-neutral-500">Aucun élément.</li>
        )}
      </ul>
    </main>
  );
}
