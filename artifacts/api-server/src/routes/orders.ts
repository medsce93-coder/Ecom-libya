import { Router } from "express";
import { db } from "@workspace/db";
import { ordersTable, orderItemsTable, cartItemsTable, productsTable } from "@workspace/db/schema";
import { eq, and, desc, sql } from "drizzle-orm";
import { randomUUID } from "crypto";

const router = Router();

async function buildOrder(orderId: string) {
  const [order] = await db.select().from(ordersTable).where(eq(ordersTable.id, orderId));
  if (!order) return null;
  const items = await db.select().from(orderItemsTable).where(eq(orderItemsTable.orderId, orderId));
  return mapOrder(order, items);
}

function mapOrder(order: any, items: any[]) {
  return {
    id: order.id,
    orderNumber: order.orderNumber,
    status: order.status,
    customerName: order.customerName,
    customerPhone: order.customerPhone,
    customerCity: order.customerCity,
    customerAddress: order.customerAddress,
    items: items.map(i => ({
      id: i.id,
      productId: i.productId,
      productName: i.productName,
      productNameAr: i.productNameAr,
      productImage: i.productImage ?? null,
      price: parseFloat(i.price),
      quantity: i.quantity,
      subtotal: parseFloat(i.subtotal),
    })),
    subtotal: parseFloat(order.subtotal),
    shippingFee: parseFloat(order.shippingFee),
    total: parseFloat(order.total),
    notes: order.notes ?? null,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
  };
}

router.get("/orders", async (req, res) => {
  try {
    const { status, page = "1", limit = "100" } = req.query as Record<string, string>;
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(200, Math.max(1, parseInt(limit)));
    const offset = (pageNum - 1) * limitNum;

    const conditions = status ? [eq(ordersTable.status, status)] : [];
    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const [orders, countResult] = await Promise.all([
      db.select().from(ordersTable).where(where).orderBy(desc(ordersTable.createdAt)).limit(limitNum).offset(offset),
      db.select({ count: sql<number>`count(*)::int` }).from(ordersTable).where(where),
    ]);

    const orderIds = orders.map(o => o.id);
    const allItems = orderIds.length > 0
      ? await db.select().from(orderItemsTable).where(sql`${orderItemsTable.orderId} = ANY(ARRAY[${sql.raw(orderIds.map(id => `'${id}'`).join(","))}]::text[])`)
      : [];

    const total = countResult[0]?.count ?? 0;
    res.json({
      orders: orders.map(o => mapOrder(o, allItems.filter(i => i.orderId === o.id))),
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "internal_error", message: "Failed to fetch orders" });
  }
});

router.post("/orders", async (req, res) => {
  try {
    const { sessionId, customerName, customerPhone, customerCity, customerAddress = "", notes } = req.body;

    const cartItems = await db
      .select({
        id: cartItemsTable.id,
        productId: cartItemsTable.productId,
        quantity: cartItemsTable.quantity,
        name: productsTable.name,
        nameAr: productsTable.nameAr,
        imageUrl: productsTable.imageUrl,
        price: productsTable.price,
      })
      .from(cartItemsTable)
      .leftJoin(productsTable, eq(cartItemsTable.productId, productsTable.id))
      .where(eq(cartItemsTable.sessionId, sessionId));

    if (cartItems.length === 0) {
      return res.status(400).json({ error: "bad_request", message: "Cart is empty" });
    }

    const subtotal = cartItems.reduce((sum, i) => sum + parseFloat(String(i.price ?? 0)) * i.quantity, 0);
    const shippingFee = 0;
    const total = subtotal + shippingFee;
    const orderId = randomUUID();
    const orderNumber = `ORD-${Date.now()}`;

    await db.insert(ordersTable).values({
      id: orderId,
      orderNumber,
      status: "new",
      customerName,
      customerPhone,
      customerCity: customerCity || "ليبيا",
      customerAddress,
      subtotal: String(subtotal),
      shippingFee: String(shippingFee),
      total: String(total),
      notes: notes ?? null,
    });

    await db.insert(orderItemsTable).values(
      cartItems.map(item => ({
        id: randomUUID(),
        orderId,
        productId: item.productId,
        productName: item.name ?? "",
        productNameAr: item.nameAr ?? "",
        productImage: item.imageUrl ?? null,
        price: String(item.price ?? 0),
        quantity: item.quantity,
        subtotal: String(parseFloat(String(item.price ?? 0)) * item.quantity),
      }))
    );

    await db.delete(cartItemsTable).where(eq(cartItemsTable.sessionId, sessionId));

    const order = await buildOrder(orderId);
    res.status(201).json(order);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "internal_error", message: "Failed to create order" });
  }
});

router.post("/orders/cart", async (req, res) => {
  try {
    const {
      customerName,
      customerPhone,
      customerCity = "ليبيا",
      customerAddress = "",
      notes,
      items,
    } = req.body;

    if (!customerName || !customerPhone || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "bad_request", message: "Missing required fields" });
    }

    const subtotal = items.reduce((sum: number, i: any) => sum + parseFloat(String(i.price ?? 0)) * (i.quantity ?? 1), 0);
    const shippingFee = 0;
    const total = subtotal + shippingFee;
    const orderId = randomUUID();
    const orderNumber = `ORD-${Date.now()}`;

    await db.insert(ordersTable).values({
      id: orderId,
      orderNumber,
      status: "new",
      customerName,
      customerPhone,
      customerCity,
      customerAddress,
      subtotal: String(subtotal),
      shippingFee: String(shippingFee),
      total: String(total),
      notes: notes ?? null,
    });

    await db.insert(orderItemsTable).values(
      items.map((item: any) => ({
        id: randomUUID(),
        orderId,
        productId: item.productId ?? item.id ?? null,
        productName: item.name ?? "",
        productNameAr: item.nameAr ?? item.name ?? "",
        productImage: item.image ?? item.imageUrl ?? null,
        price: String(item.price ?? 0),
        quantity: item.quantity ?? 1,
        subtotal: String(parseFloat(String(item.price ?? 0)) * (item.quantity ?? 1)),
      }))
    );

    const order = await buildOrder(orderId);
    res.status(201).json(order);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "internal_error", message: "Failed to create order" });
  }
});

router.post("/orders/direct", async (req, res) => {
  try {
    const { productId, quantity = 1, qtyTier, customerName, customerPhone, customerAddress = "", customerCity = "", notes } = req.body;

    if (!productId || !customerName || !customerPhone) {
      return res.status(400).json({ error: "bad_request", message: "Missing required fields" });
    }

    const [product] = await db
      .select({ id: productsTable.id, name: productsTable.name, nameAr: productsTable.nameAr, imageUrl: productsTable.imageUrl, price: productsTable.price, priceQty2: productsTable.priceQty2, priceQty3: productsTable.priceQty3 })
      .from(productsTable)
      .where(eq(productsTable.id, productId));

    if (!product) {
      return res.status(404).json({ error: "not_found", message: "Product not found" });
    }

    const tier = qtyTier ? Math.max(1, Math.min(3, parseInt(String(qtyTier)))) : Math.max(1, Math.min(3, parseInt(String(quantity))));
    const qty = tier;
    let totalPrice: number;
    if (tier === 3 && product.priceQty3) {
      totalPrice = parseFloat(String(product.priceQty3));
    } else if (tier === 2 && product.priceQty2) {
      totalPrice = parseFloat(String(product.priceQty2));
    } else {
      totalPrice = parseFloat(String(product.price)) * Math.max(1, parseInt(String(quantity)));
    }
    const subtotal = totalPrice;
    const shippingFee = 0;
    const total = subtotal + shippingFee;
    const orderId = randomUUID();
    const orderNumber = `ORD-${Date.now()}`;

    await db.insert(ordersTable).values({
      id: orderId,
      orderNumber,
      status: "new",
      customerName,
      customerPhone,
      customerCity,
      customerAddress,
      subtotal: String(subtotal),
      shippingFee: String(shippingFee),
      total: String(total),
      notes: notes ?? null,
    });

    await db.insert(orderItemsTable).values({
      id: randomUUID(),
      orderId,
      productId: product.id,
      productName: product.name ?? "",
      productNameAr: product.nameAr ?? "",
      productImage: product.imageUrl ?? null,
      price: String(parseFloat(String(product.price))),
      quantity: qty,
      subtotal: String(subtotal),
    });

    const order = await buildOrder(orderId);
    res.status(201).json(order);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "internal_error", message: "Failed to create direct order" });
  }
});

router.get("/orders/:id", async (req, res) => {
  try {
    const order = await buildOrder(req.params.id);
    if (!order) return res.status(404).json({ error: "not_found", message: "Order not found" });
    res.json(order);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "internal_error", message: "Failed to fetch order" });
  }
});

router.put("/orders/:id", async (req, res) => {
  try {
    const { status } = req.body;
    const [updated] = await db.update(ordersTable)
      .set({ status, updatedAt: new Date() })
      .where(eq(ordersTable.id, req.params.id))
      .returning();
    if (!updated) return res.status(404).json({ error: "not_found", message: "Order not found" });
    const order = await buildOrder(req.params.id);
    res.json(order);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "internal_error", message: "Failed to update order" });
  }
});

router.delete("/orders", async (req, res) => {
  try {
    await db.delete(orderItemsTable);
    await db.delete(ordersTable);
    res.json({ success: true });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "internal_error", message: "Failed to delete all orders" });
  }
});

router.delete("/orders/:id", async (req, res) => {
  try {
    await db.delete(orderItemsTable).where(eq(orderItemsTable.orderId, req.params.id));
    const [deleted] = await db.delete(ordersTable).where(eq(ordersTable.id, req.params.id)).returning();
    if (!deleted) return res.status(404).json({ error: "not_found", message: "Order not found" });
    res.json({ success: true });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "internal_error", message: "Failed to delete order" });
  }
});

export default router;
