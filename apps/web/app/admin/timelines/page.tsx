import { cookies } from "next/headers";
import { createServerClient } from "@techtimeline/database";
import { createTimeline, updateTimeline, deleteTimeline } from "./actions";

export default async function TimelinesPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const cookieStore = await cookies();
  const supabase = createServerClient(cookieStore);
  const { data: timelines } = await supabase
    .from("timelines")
    .select("id, name, slug, domain, description, category, status")
    .order("name");

  return (
    <main className="mx-auto max-w-3xl p-8">
      <h1 className="text-2xl font-semibold">Timelines</h1>
      <p className="mt-1 text-sm text-neutral-500">
        Le réseau de sites spécialisés (PhoneTimeline, EarbudsTimeline...).
        Les entrées créées automatiquement depuis d&apos;anciennes
        destinations ont un nom générique à corriger ici.
      </p>

      {error && (
        <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {error === "forbidden"
            ? "Action non autorisée : rôle insuffisant."
            : error}
        </p>
      )}

      <form
        action={createTimeline}
        className="mt-6 grid grid-cols-2 gap-2 rounded-lg border border-neutral-200 bg-white p-4"
      >
        <input
          name="name"
          placeholder="Nom (ex: PhoneTimeline)"
          required
          className="rounded-md border border-neutral-300 px-3 py-2 text-sm"
        />
        <input
          name="domain"
          placeholder="Domaine (ex: phonetimeline.com)"
          className="rounded-md border border-neutral-300 px-3 py-2 text-sm"
        />
        <input
          name="category"
          placeholder="Catégorie (ex: mobile)"
          className="rounded-md border border-neutral-300 px-3 py-2 text-sm"
        />
        <input
          name="description"
          placeholder="Description courte"
          className="rounded-md border border-neutral-300 px-3 py-2 text-sm"
        />
        <button
          type="submit"
          className="col-span-2 rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800"
        >
          Ajouter une timeline
        </button>
      </form>

      <ul className="mt-6 space-y-3">
        {timelines?.length ? (
          timelines.map((t) => (
            <li key={t.id} className="rounded-lg border border-neutral-200 bg-white p-4">
              <form action={updateTimeline.bind(null, t.id)} className="grid grid-cols-2 gap-2">
                <input
                  name="name"
                  defaultValue={t.name}
                  className="rounded-md border border-neutral-200 px-2 py-1 text-sm"
                />
                <input
                  name="domain"
                  defaultValue={t.domain ?? ""}
                  placeholder="Domaine"
                  className="rounded-md border border-neutral-200 px-2 py-1 text-sm"
                />
                <input
                  name="category"
                  defaultValue={t.category ?? ""}
                  placeholder="Catégorie"
                  className="rounded-md border border-neutral-200 px-2 py-1 text-sm"
                />
                <select
                  name="status"
                  defaultValue={t.status}
                  className="rounded-md border border-neutral-200 px-2 py-1 text-sm"
                >
                  <option value="active">active</option>
                  <option value="inactive">inactive</option>
                </select>
                <input
                  name="description"
                  defaultValue={t.description ?? ""}
                  placeholder="Description"
                  className="col-span-2 rounded-md border border-neutral-200 px-2 py-1 text-sm"
                />
                <div className="col-span-2 flex items-center justify-between">
                  <span className="text-xs text-neutral-400">/{t.slug}</span>
                  <div className="flex gap-3">
                    <button type="submit" className="text-sm text-neutral-600 hover:underline">
                      Enregistrer
                    </button>
                  </div>
                </div>
              </form>
              <form action={deleteTimeline.bind(null, t.id)} className="mt-2 text-right">
                <button type="submit" className="text-sm text-red-600 hover:underline">
                  Supprimer (admin uniquement)
                </button>
              </form>
            </li>
          ))
        ) : (
          <li className="rounded-lg border border-neutral-200 bg-white px-4 py-6 text-sm text-neutral-500">
            Aucune timeline.
          </li>
        )}
      </ul>
    </main>
  );
}
