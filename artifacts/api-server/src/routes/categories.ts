import { Router } from "express";
import { db } from "@workspace/db";
import { categoriesTable, productsTable } from "@workspace/db/schema";
import { eq, sql } from "drizzle-orm";
import { randomUUID } from "crypto";

const router = Router();

router.get("/categories", async (req, res) => {
  try {
    const categories = await db
      .select({
        id: categoriesTable.id,
        name: categoriesTable.name,
        nameAr: categoriesTable.nameAr,
        description: categoriesTable.description,
        imageUrl: categoriesTable.imageUrl,
        createdAt: categoriesTable.createdAt,
        productCount: sql<number>`count(${productsTable.id})::int`,
      })
      .from(categoriesTable)
      .leftJoin(productsTable, eq(productsTable.categoryId, categoriesTable.id))
      .groupBy(categoriesTable.id)
      .orderBy(categoriesTable.nameAr);

    res.json(categories.map(c => ({
      id: c.id,
      name: c.name,
      nameAr: c.nameAr,
      description: c.description ?? null,
      imageUrl: c.imageUrl ?? null,
      productCount: c.productCount ?? 0,
      createdAt: c.createdAt,
    })));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "internal_error", message: "Failed to fetch categories" });
  }
});

router.post("/categories", async (req, res) => {
  try {
    const { name, nameAr, description, imageUrl } = req.body;
    const id = randomUUID();
    const [category] = await db.insert(categoriesTable).values({
      id,
      name: name || nameAr,
      nameAr,
      description: description ?? null,
      imageUrl: imageUrl ?? null,
    }).returning();
    res.status(201).json({ ...category, productCount: 0 });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "internal_error", message: "Failed to create category" });
  }
});

export default router;
