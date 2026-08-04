export type ArticleStatus = "draft" | "scheduled" | "published" | "archived";

export type UserRole = "admin" | "editor" | "writer";

export type ContentType = "article" | "news" | "guide" | "comparatif" | "timeline";

export interface SEOMeta {
  title: string;
  metaDescription: string;
  canonical?: string;
  ogImage?: string;
  twitterCard?: string;
  schemaOrg?: Record<string, unknown>;
}

export interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string; // Markdown
  coverImage?: string;
  authorId: string;
  status: ArticleStatus;
  type: ContentType;
  seo: SEOMeta;
  categoryIds: string[];
  brandIds: string[];
  tagIds: string[];
  destinations: string[]; // ex: ["phonetimeline", "earbudstimeline"]
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  logo?: string;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
}

export interface Profile {
  id: string;
  email: string;
  fullName?: string;
  role: UserRole;
}
