export type BadgeTone = "new" | "popular" | "updated" | "exclusive" | "neutral";

const TONE_STYLES: Record<BadgeTone, string> = {
  new: "bg-blue/15 text-blue",
  popular: "bg-magenta/15 text-magenta",
  updated: "bg-success/15 text-success",
  exclusive: "bg-purple/15 text-purple",
  neutral: "bg-white/5 text-muted",
};

export function Badge({
  tone = "neutral",
  children,
}: {
  tone?: BadgeTone;
  children: React.ReactNode;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${TONE_STYLES[tone]}`}
    >
      {children}
    </span>
  );
}
