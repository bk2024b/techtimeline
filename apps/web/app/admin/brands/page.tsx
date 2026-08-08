import { cookies } from "next/headers";
import { createServerClient } from "@techtimeline/database";
import { createBrand, deleteBrand } from "./actions";

export default async function BrandsPage() {
  const cookieStore = await cookies();
  const supabase = createServerClient(cookieStore);
  const { data: brands } = await supabase
    .from("brands")
    .select("id, name, slug")
    .order("name");

  return (
    <main className="mx-auto max-w-2xl p-8">
      <h1 className="text-2xl font-semibold">Marques</h1>

      <form action={createBrand} className="mt-6 flex gap-2">
        <input
          name="name"
          placeholder="Ex: Apple"
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
        {brands?.length ? (
          brands.map((c) => (
            <li key={c.id} className="flex items-center justify-between px-4 py-3">
              <span>
                {c.name} <span className="text-xs text-neutral-400">/{c.slug}</span>
              </span>
              <form action={deleteBrand.bind(null, c.id)}>
                <button type="submit" className="text-sm text-red-600 hover:underline">
                  Supprimer
                </button>
              </form>
            </li>
          ))
        ) : (
          <li className="px-4 py-6 text-sm text-neutral-500">Aucune marque.</li>
        )}
      </ul>
    </main>
  );
}
