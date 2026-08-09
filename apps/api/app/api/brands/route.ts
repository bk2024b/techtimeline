import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@techtimeline/database";
import { rateLimitOrNull } from "../_lib/rate-limit";

export const revalidate = 300;

// GET /api/brands
export async function GET(request: NextRequest) {
  const rateLimited = rateLimitOrNull(request);
  if (rateLimited) return rateLimited;

  const supabase = createServiceClient();

  const { data, error } = await supabase
    .from("brands")
    .select("id, name, slug, logo")
    .order("name");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
