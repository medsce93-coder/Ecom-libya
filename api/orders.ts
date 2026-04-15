import { randomUUID } from "node:crypto";
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { requireAdmin } from "./_lib/auth.js";
import { query, withTransaction } from "./_lib/db.js";
import {
  getRouteParam,
  methodNotAllowed,
  parseIntParam,
  sendJson,
} from "./_lib/http.js";
import { fetchOrderWithItems, insertOrder } from "./_lib/order-queries.js";
import { mapOrder, type OrderItemRow, type OrderRow } from "./_lib/orders.js";

type CartCheckoutItem = {
  id?: string;
  productId?: string;
  name?: string;
  nameAr?: string;
  image?: string;
  imageUrl?: string;
  price?: number | string;
  quantity?: number;
};

async function listOrders(req: VercelRequest, res: VercelResponse) {
  const admin = await requireAdmin(req, res);
  if (!admin) return;

  try {
    const page = Math.max(1, parseIntParam(req.query.page, 1));
    const limit = Math.min(200, Math.max(1, parseIntParam(req.query.limit, 100)));
    const offset = (page - 1) * limit;
    const status = typeof req.query.status === "string" ? req.query.status : null;

    const values: unknown[] = [];
    const where = status
      ? (() => {
          values.push(status);
          return `WHERE status = $${values.length}`;
        })()
      : "";

    const pagingStart = values.length + 1;

    const orders = await query<OrderRow>(
      `
        SELECT
          id::text AS id,
          order_number AS "orderNumber",
          status,
          customer_name AS "customerName",
          customer_phone AS "customerPhone",
          customer_city AS "customerCity",
          customer_address AS "customerAddress",
          subtotal,
          shipping_fee AS "shippingFee",
          total,
          notes,
          created_at AS "createdAt",
          updated_at AS "updatedAt"
        FROM orders
        ${where}
        ORDER BY created_at DESC
        LIMIT $${pagingStart}
        OFFSET $${pagingStart + 1}
      `,
      [...values, limit, offset],
    );

    const [countRow] = await query<{ count: string }>(
      `SELECT COUNT(*)::text AS count FROM orders ${where}`,
      values,
    );

    const orderIds = orders.map((order) => order.id);
    const items =
      orderIds.length === 0
        ? []
        : await query<OrderItemRow>(
            `
              SELECT
                id,
                order_id AS "orderId",
                product_id AS "productId",
                product_name AS "productName",
                product_name_ar AS "productNameAr",
                product_image AS "productImage",
                price,
                quantity,
                subtotal
              FROM order_items
              WHERE order_id = ANY($1::text[])
            `,
            [orderIds],
          );

    const total = Number(countRow?.count ?? 0);
    const mapped = orders.map((order) =>
      mapOrder(
        order,
        items.filter((item) => item.orderId === order.id),
      ),
    );

    return sendJson(res, 200, {
      orders: mapped,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    return sendJson(res, 500, {
      error: "internal_error",
      message: "Failed to fetch orders",
    });
  }
}

async function getOrderById(
  req: VercelRequest,
  res: VercelResponse,
  idParam: string,
) {
  const admin = await requireAdmin(req, res);
  if (!admin) return;

  try {
    const [order] = await query<OrderRow>(
      `
        SELECT
          id::text AS id,
          order_number AS "orderNumber",
          status,
          customer_name AS "customerName",
          customer_phone AS "customerPhone",
          customer_city AS "customerCity",
          customer_address AS "customerAddress",
          subtotal,
          shipping_fee AS "shippingFee",
          total,
          notes,
          created_at AS "createdAt",
          updated_at AS "updatedAt"
        FROM orders
        WHERE id::text = $1
        LIMIT 1
      `,
      [idParam],
    );

    if (!order) {
      return sendJson(res, 404, {
        error: "not_found",
        message: "Order not found",
      });
    }

    const items = await query<OrderItemRow>(
      `
        SELECT
          id,
          order_id AS "orderId",
          product_id AS "productId",
          product_name AS "productName",
          product_name_ar AS "productNameAr",
          product_image AS "productImage",
          price,
          quantity,
          subtotal
        FROM order_items
        WHERE order_id = $1
      `,
      [order.id],
    );

    return sendJson(res, 200, mapOrder(order, items));
  } catch (error) {
    return sendJson(res, 500, {
      error: "internal_error",
      message: "Failed to fetch order",
    });
  }
}

async function createCartOrder(req: VercelRequest, res: VercelResponse) {
  try {
    const body = req.body ?? {};
    const customerName = String(body.customerName ?? "").trim();
    const customerPhone = String(body.customerPhone ?? "").trim();
    const customerCity = String(body.customerCity ?? "Libya").trim() || "Libya";
    const customerAddress = String(body.customerAddress ?? "").trim();
    const notes = body.notes ? String(body.notes) : null;
    const items = Array.isArray(body.items) ? (body.items as CartCheckoutItem[]) : [];

    if (!customerName || !customerPhone || items.length === 0) {
      return sendJson(res, 400, {
        error: "bad_request",
        message: "Missing required fields",
      });
    }

    const subtotal = items.reduce((sum, item) => {
      const price = Number(item.price ?? 0);
      const quantity = Math.max(1, Number(item.quantity ?? 1));
      return sum + price * quantity;
    }, 0);
    const shippingFee = 0;
    const total = subtotal + shippingFee;
    const orderNumber = `ORD-${Date.now()}`;

    const orderId = await withTransaction(async (client) => {
      let insertedOrderId: bigint;
      try {
        insertedOrderId = await insertOrder(client, {
          orderNumber,
          status: "new",
          customerName,
          customerPhone,
          customerCity,
          customerAddress,
          subtotal,
          shippingFee,
          total,
          notes,
        });
      } catch (error) {
        console.error("Failed to insert cart order row", {
          orderNumber,
          customerPhone,
          error,
        });
        throw error;
      }
      const orderIdText = insertedOrderId.toString();

      for (const item of items) {
        const quantity = Math.max(1, Number(item.quantity ?? 1));
        const price = Number(item.price ?? 0);
        const lineSubtotal = price * quantity;

        try {
          await client.query(
            `
              INSERT INTO order_items (
                id, order_id, product_id, product_name, product_name_ar,
                product_image, price, quantity, subtotal
              )
              VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            `,
            [
              randomUUID(),
              orderIdText,
              String(item.productId ?? item.id ?? ""),
              String(item.name ?? item.nameAr ?? ""),
              String(item.nameAr ?? item.name ?? ""),
              item.image ? String(item.image) : item.imageUrl ? String(item.imageUrl) : null,
              String(price),
              quantity,
              String(lineSubtotal),
            ],
          );
        } catch (error) {
          console.error("Failed to insert cart order item", {
            orderId: orderIdText,
            productId: String(item.productId ?? item.id ?? ""),
            quantity,
            error,
          });
          throw error;
        }
      }

      return orderIdText;
    });

    const order = await fetchOrderWithItems(orderId);
    return sendJson(res, 201, order);
  } catch (error) {
    console.error("Failed to create cart order", { error });
    return sendJson(res, 500, {
      error: "internal_error",
      message: "Failed to create order",
    });
  }
}

async function createDirectOrder(req: VercelRequest, res: VercelResponse) {
  try {
    const body = req.body ?? {};
    const productId = String(body.productId ?? "").trim();
    const quantity = Math.max(1, Number(body.quantity ?? 1));
    const qtyTier = body.qtyTier ? Math.max(1, Math.min(3, Number(body.qtyTier))) : null;
    const customerName = String(body.customerName ?? "").trim();
    const customerPhone = String(body.customerPhone ?? "").trim();
    const customerAddress = String(body.customerAddress ?? "").trim();
    const customerCity =
      String(body.customerCity ?? customerAddress ?? "Libya").trim() || "Libya";
    const notes = body.notes ? String(body.notes) : null;

    if (!productId || !customerName || !customerPhone) {
      return sendJson(res, 400, {
        error: "bad_request",
        message: "Missing required fields",
      });
    }

    const [product] = await query<{
      id: string;
      name: string;
      nameAr: string;
      imageUrl: string | null;
      price: string;
      priceQty2: string | null;
      priceQty3: string | null;
    }>(
      `
        SELECT
          id,
          name,
          name_ar AS "nameAr",
          image_url AS "imageUrl",
          price,
          price_qty_2 AS "priceQty2",
          price_qty_3 AS "priceQty3"
        FROM products
        WHERE id = $1
        LIMIT 1
      `,
      [productId],
    );

    if (!product) {
      return sendJson(res, 404, {
        error: "not_found",
        message: "Product not found",
      });
    }

    const tier = qtyTier ?? Math.max(1, Math.min(3, quantity));
    const itemQuantity = qtyTier ? tier : quantity;
    let subtotal = Number(product.price) * quantity;
    if (tier === 2 && product.priceQty2) subtotal = Number(product.priceQty2);
    if (tier === 3 && product.priceQty3) subtotal = Number(product.priceQty3);
    const shippingFee = 0;
    const total = subtotal + shippingFee;

    const orderNumber = `ORD-${Date.now()}`;

    const orderId = await withTransaction(async (client) => {
      let insertedOrderId: bigint;
      try {
        insertedOrderId = await insertOrder(client, {
          orderNumber,
          status: "new",
          customerName,
          customerPhone,
          customerCity,
          customerAddress,
          subtotal,
          shippingFee,
          total,
          notes,
        });
      } catch (error) {
        console.error("Failed to insert direct order row", {
          orderNumber,
          customerPhone,
          productId,
          error,
        });
        throw error;
      }
      const orderIdText = insertedOrderId.toString();

      try {
        await client.query(
          `
            INSERT INTO order_items (
              id, order_id, product_id, product_name, product_name_ar,
              product_image, price, quantity, subtotal
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
          `,
          [
            randomUUID(),
            orderIdText,
            product.id,
            product.name ?? "",
            product.nameAr ?? "",
            product.imageUrl,
            String(Number(product.price)),
            itemQuantity,
            String(subtotal),
          ],
        );
      } catch (error) {
        console.error("Failed to insert direct order item", {
          orderId: orderIdText,
          productId: product.id,
          quantity: itemQuantity,
          error,
        });
        throw error;
      }

      return orderIdText;
    });

    const order = await fetchOrderWithItems(orderId);
    return sendJson(res, 201, order);
  } catch (error) {
    console.error("Failed to create direct order", { error });
    return sendJson(res, 500, {
      error: "internal_error",
      message: "Failed to create direct order",
    });
  }
}

async function updateOrderStatus(
  req: VercelRequest,
  res: VercelResponse,
  idParam: string,
) {
  const admin = await requireAdmin(req, res);
  if (!admin) return;

  try {
    const status = String(req.body?.status ?? "").trim();
    if (!status) {
      return sendJson(res, 400, {
        error: "bad_request",
        message: "status is required",
      });
    }

    const [updated] = await query<OrderRow>(
      `
        UPDATE orders
        SET status = $1, updated_at = NOW()
        WHERE id::text = $2
        RETURNING
          id::text AS id,
          order_number AS "orderNumber",
          status,
          customer_name AS "customerName",
          customer_phone AS "customerPhone",
          customer_city AS "customerCity",
          customer_address AS "customerAddress",
          subtotal,
          shipping_fee AS "shippingFee",
          total,
          notes,
          created_at AS "createdAt",
          updated_at AS "updatedAt"
      `,
      [status, idParam],
    );

    if (!updated) {
      return sendJson(res, 404, {
        error: "not_found",
        message: "Order not found",
      });
    }

    const items = await query<OrderItemRow>(
      `
        SELECT
          id,
          order_id AS "orderId",
          product_id AS "productId",
          product_name AS "productName",
          product_name_ar AS "productNameAr",
          product_image AS "productImage",
          price,
          quantity,
          subtotal
        FROM order_items
        WHERE order_id = $1
      `,
      [updated.id],
    );

    return sendJson(res, 200, mapOrder(updated, items));
  } catch (error) {
    return sendJson(res, 500, {
      error: "internal_error",
      message: "Failed to update order",
    });
  }
}

async function deleteOrder(
  req: VercelRequest,
  res: VercelResponse,
  idParam: string,
) {
  const admin = await requireAdmin(req, res);
  if (!admin) return;

  try {
    await query("DELETE FROM order_items WHERE order_id = $1", [idParam]);
    const [deleted] = await query<{ id: string }>(
      `
        DELETE FROM orders
        WHERE id::text = $1
        RETURNING id::text AS id
      `,
      [idParam],
    );

    if (!deleted) {
      return sendJson(res, 404, {
        error: "not_found",
        message: "Order not found",
      });
    }

    return sendJson(res, 200, { success: true });
  } catch (error) {
    return sendJson(res, 500, {
      error: "internal_error",
      message: "Failed to delete order",
    });
  }
}

async function clearOrders(req: VercelRequest, res: VercelResponse) {
  const admin = await requireAdmin(req, res);
  if (!admin) return;

  try {
    await query("DELETE FROM order_items");
    await query("DELETE FROM orders");
    return sendJson(res, 200, { success: true });
  } catch (error) {
    return sendJson(res, 500, {
      error: "internal_error",
      message: "Failed to delete all orders",
    });
  }
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
) {
  const action = getRouteParam(req, "action");
  const idParam = getRouteParam(req, "id");

  if (req.method === "GET") {
    if (idParam) return getOrderById(req, res, idParam);
    return listOrders(req, res);
  }

  if (req.method === "POST") {
    if (action === "direct") return createDirectOrder(req, res);
    return createCartOrder(req, res);
  }

  if (req.method === "PUT") {
    if (!idParam) {
      return sendJson(res, 400, {
        error: "bad_request",
        message: "Missing order id",
      });
    }
    return updateOrderStatus(req, res, idParam);
  }

  if (req.method === "DELETE") {
    if (idParam) return deleteOrder(req, res, idParam);
    return clearOrders(req, res);
  }

  return methodNotAllowed(res, ["GET", "POST", "PUT", "DELETE"]);
}
