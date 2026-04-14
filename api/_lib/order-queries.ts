import type { PoolClient } from "pg";
import { query } from "./db";
import { mapOrder, type OrderItemRow, type OrderRow } from "./orders";

export async function fetchOrderWithItems(orderId: string) {
  const [order] = await query<OrderRow>(
    `
      SELECT
        id,
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
      WHERE id = $1
      LIMIT 1
    `,
    [orderId],
  );
  if (!order) return null;

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
    [orderId],
  );

  return mapOrder(order, items);
}

export async function insertOrder(
  client: PoolClient,
  payload: {
    id: string;
    orderNumber: string;
    status: string;
    customerName: string;
    customerPhone: string;
    customerCity: string;
    customerAddress: string;
    subtotal: number;
    shippingFee: number;
    total: number;
    notes?: string | null;
  },
) {
  await client.query(
    `
      INSERT INTO orders (
        id, order_number, status,
        customer_name, customer_phone, customer_city, customer_address,
        subtotal, shipping_fee, total, notes, created_at, updated_at
      )
      VALUES (
        $1, $2, $3,
        $4, $5, $6, $7,
        $8, $9, $10, $11, NOW(), NOW()
      )
    `,
    [
      payload.id,
      payload.orderNumber,
      payload.status,
      payload.customerName,
      payload.customerPhone,
      payload.customerCity,
      payload.customerAddress,
      String(payload.subtotal),
      String(payload.shippingFee),
      String(payload.total),
      payload.notes ?? null,
    ],
  );
}
