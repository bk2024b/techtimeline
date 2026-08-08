export const metadata = {
  title: "TechTimeline",
  description: "Explore the evolution of technology.",
};

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-3 bg-neutral-50 px-6 text-center">
      <h1 className="text-3xl font-semibold">TechTimeline</h1>
      <p className="max-w-md text-neutral-500">
        Le site public arrive. Cette page confirme que le split
        admin/public fonctionne : elle est accessible sans connexion,
        contrairement à <code>/admin</code>.
      </p>
    </main>
  );
}
