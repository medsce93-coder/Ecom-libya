import { randomUUID } from "node:crypto";
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { withTransaction } from "../_lib/db";
import { methodNotAllowed, sendJson } from "../_lib/http";
import { fetchOrderWithItems, insertOrder } from "../_lib/order-queries";

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

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
) {
  if (req.method !== "POST") {
    return methodNotAllowed(res, ["POST"]);
  }

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

      for (const item of items) {
        const quantity = Math.max(1, Number(item.quantity ?? 1));
        const price = Number(item.price ?? 0);
        const lineSubtotal = price * quantity;

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
            String(item.productId ?? item.id ?? ""),
            String(item.name ?? item.nameAr ?? ""),
            String(item.nameAr ?? item.name ?? ""),
            item.image ? String(item.image) : item.imageUrl ? String(item.imageUrl) : null,
            String(price),
            quantity,
            String(lineSubtotal),
          ],
        );
      }
    });

    const order = await fetchOrderWithItems(orderId);
    return sendJson(res, 201, order);
  } catch (error) {
    return sendJson(res, 500, {
      error: "internal_error",
      message: "Failed to create order",
    });
  }
}
