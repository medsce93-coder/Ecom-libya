import { db } from "@workspace/db";
import { categoriesTable, productsTable } from "@workspace/db/schema";
import { count, eq, isNull } from "drizzle-orm";
import { logger } from "./logger";
import seedData from "../data/seed-data.json";

const imageMap: Record<string, string> = Object.fromEntries(
  seedData.products.map((p) => [p.id, p.imageUrl])
);

function generateSlug(nameAr: string, id: string): string {
  const base = (nameAr || "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFFa-zA-Z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
  return base ? `${base}-${id.substring(0, 8)}` : id;
}

export async function seedIfEmpty() {
  try {
    const [{ value }] = await db.select({ value: count() }).from(productsTable);

    if (Number(value) === 0) {
      logger.info("Database is empty, seeding categories and products...");

      for (const cat of seedData.categories) {
        await db
          .insert(categoriesTable)
          .values({
            id: cat.id,
            name: cat.name,
            nameAr: cat.nameAr,
            description: cat.description || "",
            imageUrl: cat.imageUrl || null,
          })
          .onConflictDoNothing();
      }
      logger.info({ count: seedData.categories.length }, "Categories seeded");

      for (const p of seedData.products) {
        await db
          .insert(productsTable)
          .values({
            id: p.id,
            slug: generateSlug(p.nameAr || p.name, p.id),
            name: p.name,
            nameAr: p.nameAr,
            description: p.description || "",
            descriptionAr: p.descriptionAr || "",
            price: p.price,
            compareAtPrice: p.compareAtPrice,
            imageUrl: p.imageUrl,
            images: p.images,
            categoryId: p.categoryId,
            stock: p.stock,
            featured: p.featured,
            active: true,
            badge: p.badge || null,
            rating: p.rating,
          })
          .onConflictDoNothing();
      }

      logger.info({ count: seedData.products.length }, "Products seeded successfully");
      return;
    }

    logger.info({ count: value }, "Database already has products, syncing image URLs...");

    const allProducts = await db
      .select({ id: productsTable.id, imageUrl: productsTable.imageUrl })
      .from(productsTable);

    const toUpdate = allProducts.filter(({ id, imageUrl }) => {
      const target = imageMap[id];
      return target && target !== imageUrl;
    });

    if (toUpdate.length === 0) {
      logger.info("All image URLs are up to date");
    } else {
      logger.info({ count: toUpdate.length }, "Syncing image URLs from seed data...");

      for (const { id } of toUpdate) {
        const newUrl = imageMap[id];
        await db
          .update(productsTable)
          .set({ imageUrl: newUrl, images: [newUrl] })
          .where(eq(productsTable.id, id));
      }

      logger.info({ fixed: toUpdate.length }, "Image URLs synced successfully");
    }
  } catch (err) {
    logger.error({ err }, "Failed to seed/fix database");
  }
}

export async function migrateNullSlugs() {
  try {
    const nullSlugProducts = await db
      .select({ id: productsTable.id, nameAr: productsTable.nameAr })
      .from(productsTable)
      .where(isNull(productsTable.slug));

    if (nullSlugProducts.length === 0) {
      logger.info("Slug migration: all products already have slugs");
      return;
    }

    logger.info({ count: nullSlugProducts.length }, "Slug migration: populating NULL slugs...");

    for (const product of nullSlugProducts) {
      const slug = generateSlug(product.nameAr, product.id);
      await db
        .update(productsTable)
        .set({ slug })
        .where(eq(productsTable.id, product.id));
    }

    logger.info({ count: nullSlugProducts.length }, "Slug migration: complete");
  } catch (err) {
    logger.error({ err }, "Slug migration failed");
  }
}
