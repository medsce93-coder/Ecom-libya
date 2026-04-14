import { Router } from "express";
import { db } from "@workspace/db";
import { landingPagesTable, productsTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";

const router = Router();

async function buildLandingPage(id: string) {
  const [row] = await db
    .select({
      id: landingPagesTable.id,
      productId: landingPagesTable.productId,
      slug: landingPagesTable.slug,
      headline: landingPagesTable.headline,
      subheadline: landingPagesTable.subheadline,
      mediaUrls: landingPagesTable.mediaUrls,
      features: landingPagesTable.features,
      boxContents: landingPagesTable.boxContents,
      urgencyText: landingPagesTable.urgencyText,
      createdAt: landingPagesTable.createdAt,
      updatedAt: landingPagesTable.updatedAt,
      product: {
        id: productsTable.id,
        name: productsTable.name,
        nameAr: productsTable.nameAr,
        price: productsTable.price,
        compareAtPrice: productsTable.compareAtPrice,
        priceQty2: productsTable.priceQty2,
        priceQty3: productsTable.priceQty3,
        imageUrl: productsTable.imageUrl,
        slug: productsTable.slug,
      },
    })
    .from(landingPagesTable)
    .innerJoin(productsTable, eq(landingPagesTable.productId, productsTable.id))
    .where(eq(landingPagesTable.id, id));
  return row ?? null;
}

router.get("/landing-pages", async (req, res) => {
  try {
    const rows = await db
      .select({
        id: landingPagesTable.id,
        productId: landingPagesTable.productId,
        slug: landingPagesTable.slug,
        headline: landingPagesTable.headline,
        subheadline: landingPagesTable.subheadline,
        mediaUrls: landingPagesTable.mediaUrls,
        features: landingPagesTable.features,
        boxContents: landingPagesTable.boxContents,
        urgencyText: landingPagesTable.urgencyText,
        createdAt: landingPagesTable.createdAt,
        updatedAt: landingPagesTable.updatedAt,
        productNameAr: productsTable.nameAr,
        productImageUrl: productsTable.imageUrl,
        productPrice: productsTable.price,
      })
      .from(landingPagesTable)
      .innerJoin(productsTable, eq(landingPagesTable.productId, productsTable.id))
      .orderBy(landingPagesTable.createdAt);
    res.json(rows);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "internal_error", message: "Failed to fetch landing pages" });
  }
});

router.get("/landing-pages/:slug", async (req, res) => {
  try {
    const [row] = await db
      .select({
        id: landingPagesTable.id,
        productId: landingPagesTable.productId,
        slug: landingPagesTable.slug,
        headline: landingPagesTable.headline,
        subheadline: landingPagesTable.subheadline,
        mediaUrls: landingPagesTable.mediaUrls,
        features: landingPagesTable.features,
        boxContents: landingPagesTable.boxContents,
        urgencyText: landingPagesTable.urgencyText,
        createdAt: landingPagesTable.createdAt,
        updatedAt: landingPagesTable.updatedAt,
        product: {
          id: productsTable.id,
          name: productsTable.name,
          nameAr: productsTable.nameAr,
          price: productsTable.price,
          compareAtPrice: productsTable.compareAtPrice,
          priceQty2: productsTable.priceQty2,
          priceQty3: productsTable.priceQty3,
          imageUrl: productsTable.imageUrl,
          slug: productsTable.slug,
        },
      })
      .from(landingPagesTable)
      .innerJoin(productsTable, eq(landingPagesTable.productId, productsTable.id))
      .where(eq(landingPagesTable.slug, req.params.slug));

    if (!row) return res.status(404).json({ error: "not_found", message: "Landing page not found" });
    res.json(row);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "internal_error", message: "Failed to fetch landing page" });
  }
});

router.post("/landing-pages", async (req, res) => {
  try {
    const { productId, slug, headline, subheadline, mediaUrls, features, boxContents, urgencyText } = req.body;

    if (!productId || !slug || !headline) {
      return res.status(400).json({ error: "bad_request", message: "productId, slug, and headline are required" });
    }

    const id = randomUUID();
    await db.insert(landingPagesTable).values({
      id,
      productId,
      slug: slug.trim().toLowerCase(),
      headline,
      subheadline: subheadline ?? "",
      mediaUrls: Array.isArray(mediaUrls) ? mediaUrls.filter(Boolean) : [],
      features: Array.isArray(features) ? features.filter(Boolean) : [],
      boxContents: boxContents ?? null,
      urgencyText: urgencyText ?? null,
    });

    const created = await buildLandingPage(id);
    res.status(201).json(created);
  } catch (err: any) {
    if (err?.code === "23505") {
      return res.status(409).json({ error: "conflict", message: "A landing page with this slug already exists" });
    }
    req.log.error(err);
    res.status(500).json({ error: "internal_error", message: "Failed to create landing page" });
  }
});

router.put("/landing-pages/:id", async (req, res) => {
  try {
    const { productId, slug, headline, subheadline, mediaUrls, features, boxContents, urgencyText } = req.body;

    const update: Record<string, unknown> = { updatedAt: new Date() };
    if (productId !== undefined) update.productId = productId;
    if (slug !== undefined) update.slug = slug.trim().toLowerCase();
    if (headline !== undefined) update.headline = headline;
    if (subheadline !== undefined) update.subheadline = subheadline;
    if (mediaUrls !== undefined) update.mediaUrls = Array.isArray(mediaUrls) ? mediaUrls.filter(Boolean) : [];
    if (features !== undefined) update.features = Array.isArray(features) ? features.filter(Boolean) : [];
    if (boxContents !== undefined) update.boxContents = boxContents || null;
    if (urgencyText !== undefined) update.urgencyText = urgencyText || null;

    const [updated] = await db
      .update(landingPagesTable)
      .set(update)
      .where(eq(landingPagesTable.id, req.params.id))
      .returning();

    if (!updated) return res.status(404).json({ error: "not_found", message: "Landing page not found" });

    const full = await buildLandingPage(updated.id);
    res.json(full);
  } catch (err: any) {
    if (err?.code === "23505") {
      return res.status(409).json({ error: "conflict", message: "A landing page with this slug already exists" });
    }
    req.log.error(err);
    res.status(500).json({ error: "internal_error", message: "Failed to update landing page" });
  }
});

router.delete("/landing-pages/:id", async (req, res) => {
  try {
    const [deleted] = await db
      .delete(landingPagesTable)
      .where(eq(landingPagesTable.id, req.params.id))
      .returning();

    if (!deleted) return res.status(404).json({ error: "not_found", message: "Landing page not found" });
    res.json({ success: true });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "internal_error", message: "Failed to delete landing page" });
  }
});

export default router;
