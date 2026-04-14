import { randomUUID } from "node:crypto";
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { query, withTransaction } from "../_lib/db";
import { methodNotAllowed, sendJson } from "../_lib/http";
import { fetchOrderWithItems, insertOrder } from "../_lib/order-queries";

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
) {
  if (req.method !== "POST") {
    return methodNotAllowed(res, ["POST"]);
  }

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

    const orderId = randomUUID();
    const orderNumber = `ORD-${Date.now()}`;

    await withTransaction(async (client) => {
      await insertOrder(client, {
        id: orderId,
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
          orderId,
          product.id,
          product.name ?? "",
          product.nameAr ?? "",
          product.imageUrl,
          String(Number(product.price)),
          itemQuantity,
          String(subtotal),
        ],
      );
    });

    const order = await fetchOrderWithItems(orderId);
    return sendJson(res, 201, order);
  } catch (error) {
    return sendJson(res, 500, {
      error: "internal_error",
      message: "Failed to create direct order",
    });
  }
}
