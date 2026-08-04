import { createServiceClient } from "@techtimeline/database";
import type { UserRole } from "@techtimeline/types";

const ROLE_RANK: Record<UserRole, number> = {
  writer: 1,
  editor: 2,
  admin: 3,
};

export function hasRole(userRole: UserRole, required: UserRole): boolean {
  return ROLE_RANK[userRole] >= ROLE_RANK[required];
}

export async function getProfileRole(userId: string): Promise<UserRole | null> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("users")
    .select("role")
    .eq("id", userId)
    .single();

  if (error || !data) return null;
  return data.role as UserRole;
}
