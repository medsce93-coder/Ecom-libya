import { Router } from "express";
import { db } from "@workspace/db";
import { cartItemsTable, productsTable } from "@workspace/db/schema";
import { eq, and } from "drizzle-orm";
import { randomUUID } from "crypto";

const router = Router();

async function buildCart(sessionId: string) {
  const items = await db
    .select({
      id: cartItemsTable.id,
      sessionId: cartItemsTable.sessionId,
      productId: cartItemsTable.productId,
      quantity: cartItemsTable.quantity,
      productName: productsTable.name,
      productNameAr: productsTable.nameAr,
      productImage: productsTable.imageUrl,
      price: productsTable.price,
    })
    .from(cartItemsTable)
    .leftJoin(productsTable, eq(cartItemsTable.productId, productsTable.id))
    .where(eq(cartItemsTable.sessionId, sessionId));

  const cartItems = items.map(item => ({
    id: item.id,
    productId: item.productId,
    productName: item.productName ?? "",
    productNameAr: item.productNameAr ?? "",
    productImage: item.productImage ?? null,
    price: parseFloat(String(item.price ?? 0)),
    quantity: item.quantity,
    subtotal: parseFloat(String(item.price ?? 0)) * item.quantity,
  }));

  const total = cartItems.reduce((sum, i) => sum + i.subtotal, 0);
  const itemCount = cartItems.reduce((sum, i) => sum + i.quantity, 0);

  return { sessionId, items: cartItems, total, itemCount };
}

router.get("/cart", async (req, res) => {
  try {
    const { sessionId } = req.query as { sessionId: string };
    if (!sessionId) return res.status(400).json({ error: "bad_request", message: "sessionId is required" });
    res.json(await buildCart(sessionId));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "internal_error", message: "Failed to fetch cart" });
  }
});

router.post("/cart", async (req, res) => {
  try {
    const { sessionId, productId, quantity } = req.body;
    if (!sessionId || !productId || !quantity) {
      return res.status(400).json({ error: "bad_request", message: "sessionId, productId, and quantity are required" });
    }

    const existing = await db.select().from(cartItemsTable)
      .where(and(eq(cartItemsTable.sessionId, sessionId), eq(cartItemsTable.productId, productId)));

    if (existing.length > 0) {
      await db.update(cartItemsTable)
        .set({ quantity: existing[0].quantity + quantity, updatedAt: new Date() })
        .where(eq(cartItemsTable.id, existing[0].id));
    } else {
      await db.insert(cartItemsTable).values({
        id: randomUUID(),
        sessionId,
        productId,
        quantity,
      });
    }

    res.json(await buildCart(sessionId));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "internal_error", message: "Failed to add to cart" });
  }
});

router.put("/cart/item/:itemId", async (req, res) => {
  try {
    const { quantity } = req.body;
    const [item] = await db.update(cartItemsTable)
      .set({ quantity, updatedAt: new Date() })
      .where(eq(cartItemsTable.id, req.params.itemId))
      .returning();
    if (!item) return res.status(404).json({ error: "not_found", message: "Cart item not found" });
    res.json(await buildCart(item.sessionId));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "internal_error", message: "Failed to update cart item" });
  }
});

router.delete("/cart/item/:itemId", async (req, res) => {
  try {
    const [item] = await db.delete(cartItemsTable).where(eq(cartItemsTable.id, req.params.itemId)).returning();
    if (!item) return res.status(404).json({ error: "not_found", message: "Cart item not found" });
    res.json(await buildCart(item.sessionId));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "internal_error", message: "Failed to remove cart item" });
  }
});

export default router;
