import type { MetadataRoute } from "next";
import { createServiceClient } from "@techtimeline/database";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://techtimeline.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Service client : lecture publique en dehors de toute requête
  // utilisateur, pas besoin de session. On filtre explicitement
  // status="published" (le service client bypasse les RLS).
  const supabase = createServiceClient();

  const [{ data: articles }, { data: brands }, { data: topics }, { data: products }] =
    await Promise.all([
      supabase.from("articles").select("slug, updated_at").eq("status", "published"),
      supabase.from("brands").select("slug"),
      supabase.from("topics").select("slug"),
      supabase.from("products").select("slug"),
    ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE_URL, changeFrequency: "daily", priority: 1 },
    { url: `${BASE_URL}/articles`, changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE_URL}/timelines`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE_URL}/brands`, changeFrequency: "weekly", priority: 0.6 },
    { url: `${BASE_URL}/topics`, changeFrequency: "weekly", priority: 0.6 },
  ];

  const articleRoutes: MetadataRoute.Sitemap = (articles ?? []).map((a) => ({
    url: `${BASE_URL}/articles/${a.slug}`,
    lastModified: a.updated_at ? new Date(a.updated_at) : undefined,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const brandRoutes: MetadataRoute.Sitemap = (brands ?? []).map((b) => ({
    url: `${BASE_URL}/brands/${b.slug}`,
    changeFrequency: "weekly",
    priority: 0.5,
  }));

  const topicRoutes: MetadataRoute.Sitemap = (topics ?? []).map((t) => ({
    url: `${BASE_URL}/topics/${t.slug}`,
    changeFrequency: "weekly",
    priority: 0.5,
  }));

  const productRoutes: MetadataRoute.Sitemap = (products ?? []).map((p) => ({
    url: `${BASE_URL}/products/${p.slug}`,
    changeFrequency: "monthly",
    priority: 0.4,
  }));

  // Les timelines du réseau pointent vers des domaines externes
  // (phonetimeline.com, etc.) — elles ne vont pas dans CE sitemap,
  // seulement /timelines (déjà listé ci-dessus) qui les référence.

  return [...staticRoutes, ...articleRoutes, ...brandRoutes, ...topicRoutes, ...productRoutes];
}
