import Link from "next/link";
import { cookies } from "next/headers";
import { createServerClient } from "@techtimeline/database";

export const revalidate = 300;

export const metadata = {
  title: "Brands — TechTimeline",
};

export default async function BrandsPage() {
  const cookieStore = await cookies();
  const supabase = createServerClient(cookieStore);

  const { data: brands } = await supabase.from("brands").select("id, name, slug, logo").order("name");

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <h1 className="font-heading text-3xl font-semibold text-foreground">Brands</h1>

      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {brands?.length ? (
          brands.map((b) => (
            <Link
              key={b.id}
              href={`/brands/${b.slug}`}
              className="flex flex-col items-center gap-2 rounded-lg border border-white/10 bg-surface p-4 text-center transition hover:-translate-y-0.5 hover:border-white/20"
            >
              {b.logo && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={b.logo} alt={b.name} className="h-10 w-10 object-contain" />
              )}
              <span className="text-sm font-medium">{b.name}</span>
            </Link>
          ))
        ) : (
          <p className="text-sm text-muted">Aucune marque pour l&apos;instant.</p>
        )}
      </div>
    </main>
  );
}
