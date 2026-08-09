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

// À appeler en tête des server actions de mutation sensibles (delete,
// publish, gestion des timelines/publications...). Complète les RLS
// (qui bloquent déjà l'écriture côté DB) par une vérification explicite
// côté application, avec un message d'erreur clair plutôt qu'un échec
// silencieux de l'insert/update.
export class ForbiddenError extends Error {
  constructor() {
    super("forbidden");
  }
}

export async function assertRole(userId: string, required: UserRole): Promise<void> {
  const role = await getProfileRole(userId);
  if (!role || !hasRole(role, required)) {
    throw new ForbiddenError();
  }
}
