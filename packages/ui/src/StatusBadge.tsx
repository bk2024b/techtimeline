import type { ArticleStatus } from "@techtimeline/types";

const STYLES: Record<ArticleStatus, string> = {
  draft: "bg-neutral-200 text-neutral-700",
  scheduled: "bg-amber-100 text-amber-700",
  published: "bg-emerald-100 text-emerald-700",
  archived: "bg-neutral-100 text-neutral-400",
};

export function StatusBadge({ status }: { status: ArticleStatus }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${STYLES[status]}`}>
      {status}
    </span>
  );
}
