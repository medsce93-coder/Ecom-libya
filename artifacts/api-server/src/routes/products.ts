import { Router } from "express";
import { db } from "@workspace/db";
import { productsTable, categoriesTable } from "@workspace/db/schema";
import { eq, and, gte, lte, desc, sql, ilike } from "drizzle-orm";
import { randomUUID } from "crypto";

const router = Router();

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function generateSlug(nameAr: string, id: string): string {
  const base = nameAr
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFFa-zA-Z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
  return base ? `${base}-${id.substring(0, 8)}` : id;
}

const SELECT_FIELDS = {
  id: productsTable.id,
  slug: productsTable.slug,
  name: productsTable.name,
  nameAr: productsTable.nameAr,
  description: productsTable.description,
  descriptionAr: productsTable.descriptionAr,
  price: productsTable.price,
  compareAtPrice: productsTable.compareAtPrice,
  priceQty2: productsTable.priceQty2,
  priceQty3: productsTable.priceQty3,
  imageUrl: productsTable.imageUrl,
  images: productsTable.images,
  categoryId: productsTable.categoryId,
  categoryName: categoriesTable.nameAr,
  stock: productsTable.stock,
  sku: productsTable.sku,
  featured: productsTable.featured,
  active: productsTable.active,
  badge: productsTable.badge,
  rating: productsTable.rating,
  createdAt: productsTable.createdAt,
  updatedAt: productsTable.updatedAt,
};

router.get("/products/featured", async (req, res) => {
  try {
    const products = await db
      .select(SELECT_FIELDS)
      .from(productsTable)
      .leftJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id))
      .where(and(eq(productsTable.featured, true), eq(productsTable.active, true)))
      .orderBy(desc(productsTable.createdAt))
      .limit(12);
    res.json(products.map(mapProduct));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "internal_error", message: "Failed to fetch featured products" });
  }
});

router.get("/products", async (req, res) => {
  try {
    const { categoryId, search, minPrice, maxPrice, inStock, page = "1", limit = "20" } = req.query as Record<string, string>;
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const offset = (pageNum - 1) * limitNum;

    const conditions = [eq(productsTable.active, true)];
    if (categoryId) conditions.push(eq(productsTable.categoryId, categoryId));
    if (search) conditions.push(ilike(productsTable.nameAr, `%${search}%`));
    if (minPrice) conditions.push(gte(productsTable.price, minPrice));
    if (maxPrice) conditions.push(lte(productsTable.price, maxPrice));
    if (inStock === "true") conditions.push(gte(productsTable.stock, 1));

    const where = and(...conditions);

    const [products, countResult] = await Promise.all([
      db.select(SELECT_FIELDS)
        .from(productsTable)
        .leftJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id))
        .where(where)
        .orderBy(desc(productsTable.createdAt))
        .limit(limitNum)
        .offset(offset),
      db.select({ count: sql<number>`count(*)::int` }).from(productsTable).where(where),
    ]);

    const total = countResult[0]?.count ?? 0;
    res.json({
      products: products.map(mapProduct),
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "internal_error", message: "Failed to fetch products" });
  }
});

router.get("/products/:id", async (req, res) => {
  try {
    const param = decodeURIComponent(req.params.id);
    const isUuid = UUID_RE.test(param);

    let product;

    if (isUuid) {
      [product] = await db
        .select(SELECT_FIELDS)
        .from(productsTable)
        .leftJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id))
        .where(eq(productsTable.id, param));
    } else {
      [product] = await db
        .select(SELECT_FIELDS)
        .from(productsTable)
        .leftJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id))
        .where(eq(productsTable.slug, param));
    }

    if (!product) return res.status(404).json({ error: "not_found", message: "Product not found" });
    res.json(mapProduct(product));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "internal_error", message: "Failed to fetch product" });
  }
});

router.post("/products", async (req, res) => {
  try {
    const { name, nameAr, description, descriptionAr, price, compareAtPrice, priceQty2, priceQty3, imageUrl, images, categoryId, stock, sku, featured, active, badge } = req.body;
    const id = randomUUID();
    const slug = generateSlug(nameAr || name || "", id);
    const [product] = await db.insert(productsTable).values({
      id,
      slug,
      name: name || nameAr,
      nameAr,
      description: description || "",
      descriptionAr: descriptionAr || "",
      price: String(price),
      compareAtPrice: compareAtPrice ? String(compareAtPrice) : null,
      priceQty2: priceQty2 ? String(priceQty2) : null,
      priceQty3: priceQty3 ? String(priceQty3) : null,
      imageUrl: imageUrl || null,
      images: images || [],
      categoryId: categoryId || null,
      stock: stock || 0,
      sku: sku || null,
      featured: featured ?? false,
      active: active ?? true,
      badge: badge || null,
    }).returning();
    res.status(201).json(mapProduct(product as any));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "internal_error", message: "Failed to create product" });
  }
});

router.put("/products/:id", async (req, res) => {
  try {
    const updates: Record<string, any> = {};
    const allowed = ["name", "nameAr", "description", "descriptionAr", "price", "compareAtPrice", "priceQty2", "priceQty3", "imageUrl", "images", "categoryId", "stock", "sku", "featured", "active", "badge"];
    for (const key of allowed) {
      if (req.body[key] !== undefined) {
        if (["price", "compareAtPrice", "priceQty2", "priceQty3"].includes(key))
          updates[key] = req.body[key] !== null && req.body[key] !== "" ? String(req.body[key]) : null;
        else updates[key] = req.body[key];
      }
    }
    if (req.body.nameAr) {
      updates.slug = generateSlug(req.body.nameAr, req.params.id);
    }
    updates.updatedAt = new Date();
    const [product] = await db.update(productsTable).set(updates).where(eq(productsTable.id, req.params.id)).returning();
    if (!product) return res.status(404).json({ error: "not_found", message: "Product not found" });
    res.json(mapProduct(product as any));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "internal_error", message: "Failed to update product" });
  }
});

router.delete("/products/:id", async (req, res) => {
  try {
    await db.delete(productsTable).where(eq(productsTable.id, req.params.id));
    res.status(204).end();
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "internal_error", message: "Failed to delete product" });
  }
});

function mapProduct(p: any) {
  return {
    id: p.id,
    slug: p.slug ?? null,
    name: p.name,
    nameAr: p.nameAr,
    description: p.description,
    descriptionAr: p.descriptionAr,
    price: parseFloat(p.price),
    compareAtPrice: p.compareAtPrice ? parseFloat(p.compareAtPrice) : null,
    priceQty2: p.priceQty2 ? parseFloat(p.priceQty2) : null,
    priceQty3: p.priceQty3 ? parseFloat(p.priceQty3) : null,
    imageUrl: p.imageUrl ?? null,
    images: p.images ?? [],
    categoryId: p.categoryId ?? null,
    categoryName: p.categoryName ?? null,
    stock: p.stock,
    sku: p.sku ?? null,
    featured: p.featured,
    active: p.active,
    badge: p.badge ?? null,
    rating: p.rating ? parseFloat(p.rating) : 4.5,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
  };
}

export default router;
