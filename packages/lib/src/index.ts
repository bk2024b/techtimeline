export function slugify(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export function excerptFromMarkdown(markdown: string, maxLength = 160): string {
  const plain = markdown
    .replace(/[#*_`>[\]()]/g, "")
    .replace(/\n+/g, " ")
    .trim();
  return plain.length > maxLength ? `${plain.slice(0, maxLength).trim()}…` : plain;
}

// Rate limiting très basique par IP, en mémoire.
// LIMITE CONNUE : ne fonctionne que par instance serverless (pas de state
// partagé entre lambdas). Suffisant comme garde-fou contre un abus isolé
// vu le trafic actuel (CORS ouvert sur apps/api), mais à remplacer par un
// store partagé (Upstash Redis, etc.) si le trafic ou les abus augmentent.
const requestLog = new Map<string, number[]>();

export function checkRateLimit(
  key: string,
  limit = 60,
  windowMs = 60_000
): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const timestamps = (requestLog.get(key) ?? []).filter((t) => now - t < windowMs);

  if (timestamps.length >= limit) {
    requestLog.set(key, timestamps);
    return { allowed: false, remaining: 0 };
  }

  timestamps.push(now);
  requestLog.set(key, timestamps);
  return { allowed: true, remaining: limit - timestamps.length };
}
