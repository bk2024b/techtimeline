import Image from "next/image";
import Link from "next/link";
import { LinkButton } from "@techtimeline/ui";

const NAV_LINKS = [
  { href: "/articles", label: "Articles" },
  { href: "/timelines", label: "Timelines" },
  { href: "/brands", label: "Brands" },
  { href: "/topics", label: "Topics" },
];

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 border-b border-white/10 bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2.5">
            <Image src="/logo.png" alt="" width={28} height={28} className="h-7 w-7" />
            <span className="font-heading text-lg font-semibold text-gradient-brand">
              TechTimeline
            </span>
          </Link>

          <nav className="hidden items-center gap-6 text-sm text-muted sm:flex">
            {NAV_LINKS.map((link) => (
              <Link key={link.href} href={link.href} className="hover:text-foreground">
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/search"
              className="hidden rounded-lg border border-white/10 bg-surface px-3 py-1.5 text-sm text-muted hover:border-white/20 hover:text-foreground sm:block"
            >
              Search…
            </Link>
            <LinkButton href="/timelines" variant="primary" className="hidden sm:inline-flex">
              Explore
            </LinkButton>
          </div>
        </div>
      </header>

      <div className="flex-1">{children}</div>

      <footer className="border-t border-white/10">
        <div className="mx-auto grid max-w-6xl gap-8 px-6 py-12 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="flex items-center gap-2">
              <Image src="/logo.png" alt="" width={22} height={22} className="h-5 w-5" />
              <span className="font-heading text-sm font-semibold text-foreground">
                TechTimeline
              </span>
            </div>
            <p className="mt-3 max-w-xs text-sm text-muted">
              Explore the evolution of technology through data, stories and timelines.
            </p>
          </div>

          <div>
            <h3 className="text-xs font-medium uppercase tracking-wide text-muted">Explore</h3>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <Link href="/timelines" className="text-muted hover:text-foreground">
                  Timelines
                </Link>
              </li>
              <li>
                <Link href="/brands" className="text-muted hover:text-foreground">
                  Brands
                </Link>
              </li>
              <li>
                <Link href="/topics" className="text-muted hover:text-foreground">
                  Topics
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-medium uppercase tracking-wide text-muted">Resources</h3>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <Link href="/articles" className="text-muted hover:text-foreground">
                  Articles
                </Link>
              </li>
              <li>
                <Link href="/search" className="text-muted hover:text-foreground">
                  Search
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 px-6 py-6 text-center text-xs text-muted">
          © 2026 TechTimeline. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
