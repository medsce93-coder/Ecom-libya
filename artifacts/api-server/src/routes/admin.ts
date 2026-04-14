import { Router } from "express";
import { db } from "@workspace/db";
import { ordersTable, orderItemsTable, productsTable } from "@workspace/db/schema";
import { eq, desc, sql, count, gte, lte, inArray } from "drizzle-orm";

const router = Router();

router.get("/admin/stats", async (req, res) => {
  try {
    const [
      totalOrdersResult,
      pendingOrdersResult,
      totalRevenueResult,
      totalProductsResult,
      lowStockResult,
      recentOrdersResult,
    ] = await Promise.all([
      db.select({ count: sql<number>`count(*)::int` }).from(ordersTable),
      db.select({ count: sql<number>`count(*)::int` }).from(ordersTable).where(eq(ordersTable.status, "pending")),
      db.select({ sum: sql<number>`coalesce(sum(total::numeric), 0)::float` }).from(ordersTable),
      db.select({ count: sql<number>`count(*)::int` }).from(productsTable).where(eq(productsTable.active, true)),
      db.select({ count: sql<number>`count(*)::int` }).from(productsTable).where(lte(productsTable.stock, 5)),
      db.select().from(ordersTable).orderBy(desc(ordersTable.createdAt)).limit(5),
    ]);

    const recentOrderIds = recentOrdersResult.map(o => o.id);
    const recentItems = recentOrderIds.length > 0
      ? await db.select().from(orderItemsTable).where(
          inArray(orderItemsTable.orderId, recentOrderIds)
        )
      : [];

    const topProductsResult = await db
      .select({
        productId: orderItemsTable.productId,
        productName: orderItemsTable.productNameAr,
        totalSold: sql<number>`sum(${orderItemsTable.quantity})::int`,
        revenue: sql<number>`sum(${orderItemsTable.subtotal}::numeric)::float`,
      })
      .from(orderItemsTable)
      .groupBy(orderItemsTable.productId, orderItemsTable.productNameAr)
      .orderBy(desc(sql`sum(${orderItemsTable.quantity})`))
      .limit(5);

    res.json({
      totalOrders: totalOrdersResult[0]?.count ?? 0,
      pendingOrders: pendingOrdersResult[0]?.count ?? 0,
      totalRevenue: totalRevenueResult[0]?.sum ?? 0,
      totalProducts: totalProductsResult[0]?.count ?? 0,
      lowStockProducts: lowStockResult[0]?.count ?? 0,
      recentOrders: recentOrdersResult.map(o => ({
        id: o.id,
        orderNumber: o.orderNumber,
        status: o.status,
        customerName: o.customerName,
        customerPhone: o.customerPhone,
        customerCity: o.customerCity,
        customerAddress: o.customerAddress,
        items: recentItems.filter(i => i.orderId === o.id).map(i => ({
          id: i.id,
          productId: i.productId,
          productName: i.productName,
          productNameAr: i.productNameAr,
          productImage: i.productImage ?? null,
          price: parseFloat(i.price),
          quantity: i.quantity,
          subtotal: parseFloat(i.subtotal),
        })),
        subtotal: parseFloat(o.subtotal),
        shippingFee: parseFloat(o.shippingFee),
        total: parseFloat(o.total),
        notes: o.notes ?? null,
        createdAt: o.createdAt,
        updatedAt: o.updatedAt,
      })),
      topProducts: topProductsResult.map(p => ({
        productId: p.productId,
        productName: p.productName,
        totalSold: p.totalSold ?? 0,
        revenue: p.revenue ?? 0,
      })),
    });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "internal_error", message: "Failed to fetch admin stats" });
  }
});

export default router;
