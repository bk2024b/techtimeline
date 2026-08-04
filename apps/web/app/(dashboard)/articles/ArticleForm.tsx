"use client";

import { useState } from "react";
import { uploadCoverImage } from "./actions";
import type { Article } from "@techtimeline/types";

type Option = { id: string; name: string };

type ArticleFormProps = {
  action: (formData: FormData) => void;
  article?: Partial<Article>;
  categories: Option[];
  brands: Option[];
  tags: Option[];
  selectedCategoryIds?: string[];
  selectedBrandIds?: string[];
  selectedTagIds?: string[];
  error?: string;
  saved?: boolean;
};

function CheckboxGroup({
  name,
  options,
  selected,
}: {
  name: string;
  options: Option[];
  selected: string[];
}) {
  if (options.length === 0) {
    return <p className="text-xs text-neutral-400">Aucune option — crée-les d'abord dans la page dédiée.</p>;
  }

  return (
    <div className="flex flex-wrap gap-3">
      {options.map((opt) => (
        <label key={opt.id} className="flex items-center gap-1.5 text-sm">
          <input
            type="checkbox"
            name={name}
            value={opt.id}
            defaultChecked={selected.includes(opt.id)}
            className="rounded border-neutral-300"
          />
          {opt.name}
        </label>
      ))}
    </div>
  );
}

export function ArticleForm({
  action,
  article,
  categories,
  brands,
  tags,
  selectedCategoryIds = [],
  selectedBrandIds = [],
  selectedTagIds = [],
  error,
  saved,
}: ArticleFormProps) {
  const [coverImage, setCoverImage] = useState<string | null>(article?.coverImage ?? null);
  const [uploading, setUploading] = useState(false);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const fd = new FormData();
    fd.set("file", file);
    const url = await uploadCoverImage(fd);
    if (url) setCoverImage(url);
    setUploading(false);
  }

  return (
    <form action={action} className="mx-auto max-w-2xl space-y-5 p-8">
      {error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
      {saved && <p className="rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700">Enregistré.</p>}

      <div className="space-y-1">
        <label className="text-sm font-medium">Titre</label>
        <input
          name="title"
          defaultValue={article?.title}
          required
          className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
        />
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium">Contenu (Markdown)</label>
        <textarea
          name="content"
          defaultValue={article?.content}
          rows={12}
          required
          className="w-full rounded-md border border-neutral-300 px-3 py-2 font-mono text-sm"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-sm font-medium">Type</label>
          <select
            name="type"
            defaultValue={article?.type ?? "article"}
            className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
          >
            <option value="article">Article</option>
            <option value="news">News</option>
            <option value="guide">Guide</option>
            <option value="comparatif">Comparatif</option>
            <option value="timeline">Timeline</option>
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium">Statut</label>
          <select
            name="status"
            defaultValue={article?.status ?? "draft"}
            className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
          >
            <option value="draft">Draft</option>
            <option value="scheduled">Scheduled</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium">Destinations (séparées par des virgules)</label>
        <input
          name="destinations"
          defaultValue={article?.destinations?.join(", ")}
          placeholder="phonetimeline, earbudstimeline"
          className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
        />
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium">Catégories</label>
        <CheckboxGroup name="category_ids" options={categories} selected={selectedCategoryIds} />
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium">Marques</label>
        <CheckboxGroup name="brand_ids" options={brands} selected={selectedBrandIds} />
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium">Tags</label>
        <CheckboxGroup name="tag_ids" options={tags} selected={selectedTagIds} />
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium">Image de couverture</label>
        <input type="file" accept="image/*" onChange={handleFileChange} className="text-sm" />
        {uploading && <p className="text-xs text-neutral-400">Upload en cours…</p>}
        {coverImage && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={coverImage} alt="" className="mt-2 h-32 rounded-md object-cover" />
        )}
        <input type="hidden" name="cover_image" value={coverImage ?? ""} />
      </div>

      <button
        type="submit"
        className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800"
      >
        Enregistrer
      </button>
    </form>
  );
}
