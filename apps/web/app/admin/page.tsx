import Link from "next/link";

export default function DashboardHome() {
  return (
    <main className="mx-auto max-w-5xl p-8">
      <h1 className="text-2xl font-semibold">Tableau de bord</h1>
      <Link href="/admin/articles" className="mt-4 inline-block text-sm text-neutral-900 underline">
        Voir les articles →
      </Link>
    </main>
  );
}
