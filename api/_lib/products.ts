export const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function generateSlug(nameAr: string, id: string): string {
  const base = (nameAr || "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(
      /[^\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFFa-zA-Z0-9-]/g,
      "",
    )
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");

  return base ? `${base}-${id.slice(0, 8)}` : id;
}

export type ProductRow = {
  id: string;
  slug: string | null;
  name: string;
  nameAr: string;
  description: string | null;
  descriptionAr: string | null;
  price: string | number;
  compareAtPrice: string | number | null;
  priceQty2: string | number | null;
  priceQty3: string | number | null;
  imageUrl: string | null;
  images: string[] | null;
  categoryId: string | null;
  categoryName: string | null;
  stock: number;
  sku: string | null;
  featured: boolean;
  active: boolean;
  badge: string | null;
  rating: string | number | null;
  createdAt: string;
  updatedAt: string;
};

export function mapProduct(row: ProductRow) {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    nameAr: row.nameAr,
    description: row.description ?? "",
    descriptionAr: row.descriptionAr ?? "",
    price: Number(row.price ?? 0),
    compareAtPrice:
      row.compareAtPrice === null ? null : Number(row.compareAtPrice),
    priceQty2: row.priceQty2 === null ? null : Number(row.priceQty2),
    priceQty3: row.priceQty3 === null ? null : Number(row.priceQty3),
    imageUrl: row.imageUrl,
    images: Array.isArray(row.images) ? row.images : [],
    categoryId: row.categoryId,
    categoryName: row.categoryName,
    stock: Number(row.stock ?? 0),
    sku: row.sku,
    featured: Boolean(row.featured),
    active: Boolean(row.active),
    badge: row.badge,
    rating: row.rating === null ? 4.5 : Number(row.rating),
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}
