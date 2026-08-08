import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createServerClient } from "@techtimeline/database";
import { signOut } from "../login/actions";

export const metadata = {
  title: "TechTimeline — Admin",
  description: "Administration éditoriale de l'écosystème Timeline",
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const supabase = createServerClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("users")
    .select("full_name, email, role")
    .eq("id", user.id)
    .single();

  return (
    <div className="min-h-screen">
      <header className="flex items-center justify-between border-b border-neutral-200 bg-white px-6 py-3">
        <span className="font-semibold">TechTimeline</span>
        <div className="flex items-center gap-3 text-sm text-neutral-600">
          <span>
            {profile?.full_name ?? profile?.email} · <span className="uppercase text-neutral-400">{profile?.role}</span>
          </span>
          <form action={signOut}>
            <button type="submit" className="text-neutral-500 hover:text-neutral-900">
              Déconnexion
            </button>
          </form>
        </div>
      </header>
      <nav className="flex gap-4 border-b border-neutral-200 bg-white px-6 py-2 text-sm text-neutral-600">
        <Link href="/admin" className="hover:text-neutral-900">Tableau de bord</Link>
        <Link href="/admin/articles" className="hover:text-neutral-900">Articles</Link>
        <Link href="/admin/categories" className="hover:text-neutral-900">Catégories</Link>
        <Link href="/admin/brands" className="hover:text-neutral-900">Marques</Link>
        <Link href="/admin/tags" className="hover:text-neutral-900">Tags</Link>
      </nav>
      {children}
    </div>
  );
}
