import Link from "next/link";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-neutral-50">
      <header className="border-b border-neutral-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Link href="/" className="text-lg font-semibold">
            TechTimeline
          </Link>
          <nav className="flex gap-5 text-sm text-neutral-600">
            <Link href="/articles" className="hover:text-neutral-900">
              Articles
            </Link>
            <Link href="/timelines" className="hover:text-neutral-900">
              Timelines
            </Link>
            <Link href="/brands" className="hover:text-neutral-900">
              Brands
            </Link>
            <Link href="/topics" className="hover:text-neutral-900">
              Topics
            </Link>
          </nav>
        </div>
      </header>

      <div className="flex-1">{children}</div>

      <footer className="border-t border-neutral-200 bg-white">
        <div className="mx-auto max-w-5xl px-6 py-6 text-xs text-neutral-400">
          TechTimeline — Explore the evolution of technology.
        </div>
      </footer>
    </div>
  );
}
