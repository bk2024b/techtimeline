import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@techtimeline/lib";

// À appeler en tête de chaque handler GET public. Retourne une réponse 429
// si la limite est dépassée, sinon null (le handler continue normalement).
export function rateLimitOrNull(request: NextRequest): NextResponse | null {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const { allowed, remaining } = checkRateLimit(ip);

  if (!allowed) {
    return NextResponse.json(
      { error: "Too many requests" },
      { status: 429, headers: { "Retry-After": "60" } }
    );
  }

  void remaining;
  return null;
}
