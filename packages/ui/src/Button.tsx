import Link from "next/link";
import type { ComponentProps } from "react";

export type ButtonVariant = "primary" | "secondary" | "ghost";

const VARIANT_STYLES: Record<ButtonVariant, string> = {
  primary: "bg-gradient-brand text-white hover:opacity-90",
  secondary: "border border-white/15 bg-surface text-foreground hover:border-white/30",
  ghost: "text-muted hover:text-foreground",
};

const BASE =
  "inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium transition disabled:opacity-40 disabled:pointer-events-none";

type CommonProps = {
  variant?: ButtonVariant;
  className?: string;
  children: React.ReactNode;
};

// Bouton natif <button> (soumission de formulaire, action côté client).
export function Button({
  variant = "primary",
  className = "",
  children,
  ...props
}: CommonProps & ComponentProps<"button">) {
  return (
    <button className={`${BASE} ${VARIANT_STYLES[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}

// Même styles, mais rendu <Link> (navigation) — les deux variantes du
// design system ("Primary" / "Secondary") n'ont de sens que si elles
// couvrent aussi bien les actions que la navigation.
export function LinkButton({
  variant = "primary",
  className = "",
  children,
  ...props
}: CommonProps & ComponentProps<typeof Link>) {
  return (
    <Link className={`${BASE} ${VARIANT_STYLES[variant]} ${className}`} {...props}>
      {children}
    </Link>
  );
}
