import { ArticleForm } from "../ArticleForm";
import { createArticle } from "../actions";

export default async function NewArticlePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  return <ArticleForm action={createArticle} error={error} />;
}
