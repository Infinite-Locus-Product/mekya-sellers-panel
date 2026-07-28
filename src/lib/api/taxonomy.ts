import { authService } from "@/lib/auth/authService";

// ─── Types (mirrors backend TaxonomyManifestOut, src/application/taxonomy/schemas.py) ──

export interface TaxonomyGender {
  code: string;
  label: string;
  nav_tab: boolean;
}

export interface TaxonomyCategory {
  slug: string;
  name: string;
  genders: string[];
}

export interface TaxonomySubcategory {
  slug: string;
  name: string;
  category_slug: string;
  genders: string[];
}

export interface TaxonomyAttributeValue {
  slug: string;
  name: string;
}

export interface TaxonomyAttribute {
  slug: string;
  name: string;
  input_type: string;
  level: string;
  group: string;
  values: TaxonomyAttributeValue[];
}

export interface TaxonomyTag {
  slug: string;
  name: string;
  tag_group: string;
  saleor_attribute_slug: string;
}

export interface TaxonomyAttributeTemplate {
  required: string[];
  optional: string[];
}

export interface TaxonomySizeSystem {
  values: string[];
}

export interface TaxonomyManifest {
  schema_version: string;
  version: string;
  genders: TaxonomyGender[];
  categories: TaxonomyCategory[];
  subcategories: TaxonomySubcategory[];
  attributes: TaxonomyAttribute[];
  tags: TaxonomyTag[];
  templates: Record<string, TaxonomyAttributeTemplate>;
  size_systems: Record<string, TaxonomySizeSystem>;
}

// ─── Fetching ─────────────────────────────────────────────────────────────────
// The manifest changes rarely (backend caches it 300s server-side); fetch it
// once per page load and reuse the same in-flight/resolved promise everywhere
// rather than re-requesting per component.

let manifestPromise: Promise<TaxonomyManifest> | null = null;

export async function getTaxonomyManifest(): Promise<TaxonomyManifest> {
  if (!manifestPromise) {
    manifestPromise = authService.api
      .get<TaxonomyManifest>("/seller/taxonomy/manifest")
      .then((res) => res.data)
      .catch((err) => {
        manifestPromise = null;
        throw err;
      });
  }
  return manifestPromise;
}

export async function getSizeSystem(gender: string, categorySlug: string): Promise<string[]> {
  const res = await authService.api.get<TaxonomySizeSystem>(
    `/seller/taxonomy/size-system?gender=${encodeURIComponent(gender)}&category=${encodeURIComponent(categorySlug)}`,
  );
  return res.data.values;
}

// ─── Manifest helpers (pure, operate on an already-fetched manifest) ──────────

export function categoriesForGender(
  manifest: TaxonomyManifest,
  gender: string | undefined,
): TaxonomyCategory[] {
  if (!gender) return [];
  return manifest.categories.filter((c) => c.genders.includes(gender));
}

export function subcategoriesFor(
  manifest: TaxonomyManifest,
  categorySlug: string | undefined,
  gender: string | undefined,
): TaxonomySubcategory[] {
  if (!categorySlug || !gender) return [];
  return manifest.subcategories.filter(
    (s) => s.category_slug === categorySlug && s.genders.includes(gender),
  );
}

export function templateFor(
  manifest: TaxonomyManifest,
  subcategorySlug: string | undefined,
): TaxonomyAttributeTemplate {
  const fallback = manifest.templates.default ?? { required: [], optional: [] };
  if (!subcategorySlug) return fallback;
  return manifest.templates[subcategorySlug] ?? fallback;
}

export function attributeBySlug(
  manifest: TaxonomyManifest,
  slug: string,
): TaxonomyAttribute | undefined {
  return manifest.attributes.find((a) => a.slug === slug);
}

export function colorAttributeValues(manifest: TaxonomyManifest): TaxonomyAttributeValue[] {
  return attributeBySlug(manifest, "color")?.values ?? [];
}

export function tagsByGroup(manifest: TaxonomyManifest): Record<string, TaxonomyTag[]> {
  const grouped: Record<string, TaxonomyTag[]> = {};
  for (const tag of manifest.tags) {
    (grouped[tag.tag_group] ??= []).push(tag);
  }
  return grouped;
}
