import { cookies } from "next/headers";
import { createServerClient } from "@techtimeline/database";
import { createCategory, updateCategory, deleteCategory } from "./actions";

export default async function CategoriesPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const cookieStore = await cookies();
  const supabase = createServerClient(cookieStore);
  const { data: categories } = await supabase
    .from("categories")
    .select("id, name, slug")
    .order("name");

  return (
    <main className="mx-auto max-w-2xl p-8">
      <h1 className="text-2xl font-semibold">Catégories</h1>

      {error && (
        <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {error === "forbidden"
            ? "Action non autorisée : rôle insuffisant (editor ou admin requis)."
            : error}
        </p>
      )}

      <form action={createCategory} className="mt-6 flex gap-2">
        <input
          name="name"
          placeholder="Ex: Phones"
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
        {categories?.length ? (
          categories.map((c) => (
            <li key={c.id} className="flex items-center justify-between gap-3 px-4 py-3">
              <form
                action={updateCategory.bind(null, c.id)}
                className="flex flex-1 items-center gap-2"
              >
                <input
                  name="name"
                  defaultValue={c.name}
                  className="flex-1 rounded-md border border-neutral-200 px-2 py-1 text-sm"
                />
                <span className="text-xs text-neutral-400">/{c.slug}</span>
                <button type="submit" className="text-sm text-neutral-600 hover:underline">
                  Renommer
                </button>
              </form>
              <form action={deleteCategory.bind(null, c.id)}>
                <button type="submit" className="text-sm text-red-600 hover:underline">
                  Supprimer
                </button>
              </form>
            </li>
          ))
        ) : (
          <li className="px-4 py-6 text-sm text-neutral-500">Aucune catégorie.</li>
        )}
      </ul>
    </main>
  );
}
