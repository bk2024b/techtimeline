import Link from "next/link";
import type { ComponentProps } from "react";

const BASE =
  "rounded-2xl border border-white/10 bg-surface transition hover:border-white/20";

export function Card({
  className = "",
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return <div className={`${BASE} ${className}`}>{children}</div>;
}

// Card cliquable (le cas le plus fréquent : article/product/brand card
// qui navigue vers la page de détail). translateY léger au hover, cf.
// section 7 "Motion & Interaction" du design system.
export function CardLink({
  className = "",
  children,
  ...props
}: { className?: string; children: React.ReactNode } & ComponentProps<typeof Link>) {
  return (
    <Link
      className={`block ${BASE} transition-transform hover:-translate-y-0.5 ${className}`}
      {...props}
    >
      {children}
    </Link>
  );
}
