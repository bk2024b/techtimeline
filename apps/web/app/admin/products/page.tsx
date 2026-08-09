import { cookies } from "next/headers";
import { createServerClient } from "@techtimeline/database";
import { createProduct, updateProduct, deleteProduct } from "./actions";

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const cookieStore = await cookies();
  const supabase = createServerClient(cookieStore);

  const [{ data: products }, { data: brands }, { data: categories }] = await Promise.all([
    supabase
      .from("products")
      .select("id, name, slug, released_at, brand_id, category_id")
      .order("name"),
    supabase.from("brands").select("id, name").order("name"),
    supabase.from("categories").select("id, name").order("name"),
  ]);

  return (
    <main className="mx-auto max-w-3xl p-8">
      <h1 className="text-2xl font-semibold">Produits</h1>

      {error && (
        <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {error === "forbidden"
            ? "Action non autorisée : rôle insuffisant (editor ou admin requis)."
            : error}
        </p>
      )}

      <form
        action={createProduct}
        className="mt-6 grid grid-cols-2 gap-2 rounded-lg border border-neutral-200 bg-white p-4"
      >
        <input
          name="name"
          placeholder="Ex: iPhone 15 Pro Max"
          required
          className="rounded-md border border-neutral-300 px-3 py-2 text-sm"
        />
        <input
          name="released_at"
          type="date"
          className="rounded-md border border-neutral-300 px-3 py-2 text-sm"
        />
        <select name="brand_id" className="rounded-md border border-neutral-300 px-3 py-2 text-sm">
          <option value="">Marque…</option>
          {brands?.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>
        <select
          name="category_id"
          className="rounded-md border border-neutral-300 px-3 py-2 text-sm"
        >
          <option value="">Catégorie…</option>
          {categories?.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="col-span-2 rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800"
        >
          Ajouter
        </button>
      </form>

      <ul className="mt-6 space-y-3">
        {products?.length ? (
          products.map((p) => (
            <li key={p.id} className="rounded-lg border border-neutral-200 bg-white p-4">
              <form action={updateProduct.bind(null, p.id)} className="grid grid-cols-2 gap-2">
                <input
                  name="name"
                  defaultValue={p.name}
                  className="rounded-md border border-neutral-200 px-2 py-1 text-sm"
                />
                <input
                  name="released_at"
                  type="date"
                  defaultValue={p.released_at ?? ""}
                  className="rounded-md border border-neutral-200 px-2 py-1 text-sm"
                />
                <select
                  name="brand_id"
                  defaultValue={p.brand_id ?? ""}
                  className="rounded-md border border-neutral-200 px-2 py-1 text-sm"
                >
                  <option value="">Marque…</option>
                  {brands?.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
                <select
                  name="category_id"
                  defaultValue={p.category_id ?? ""}
                  className="rounded-md border border-neutral-200 px-2 py-1 text-sm"
                >
                  <option value="">Catégorie…</option>
                  {categories?.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
                <div className="col-span-2 flex items-center justify-between">
                  <span className="text-xs text-neutral-400">/{p.slug}</span>
                  <button type="submit" className="text-sm text-neutral-600 hover:underline">
                    Enregistrer
                  </button>
                </div>
              </form>
              <form action={deleteProduct.bind(null, p.id)} className="mt-2 text-right">
                <button type="submit" className="text-sm text-red-600 hover:underline">
                  Supprimer
                </button>
              </form>
            </li>
          ))
        ) : (
          <li className="rounded-lg border border-neutral-200 bg-white px-4 py-6 text-sm text-neutral-500">
            Aucun produit.
          </li>
        )}
      </ul>
    </main>
  );
}
