import type { PoolClient } from "pg";
import { query } from "./db.js";
import { mapOrder, type OrderItemRow, type OrderRow } from "./orders.js";

function normalizeOrderId(orderId: string | number | bigint) {
  return String(orderId).trim();
}

export async function fetchOrderWithItems(orderId: string | number | bigint) {
  const orderIdText = normalizeOrderId(orderId);

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
    [orderIdText],
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
    [orderIdText],
  );

  return mapOrder(order, items);
}

export async function insertOrder(
  client: PoolClient,
  payload: {
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
  try {
    const result = await client.query<{ id: string | number | bigint }>(
      `
        INSERT INTO orders (
          order_number, status,
          customer_name, customer_phone, customer_city, customer_address,
          subtotal, shipping_fee, total, notes, created_at, updated_at
        )
        VALUES (
          $1, $2,
          $3, $4, $5, $6,
          $7, $8, $9, $10, NOW(), NOW()
        )
        RETURNING id
      `,
      [
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

    const inserted = result.rows[0];
    if (!inserted?.id) {
      throw new Error("Order insert did not return id");
    }

    return typeof inserted.id === "bigint"
      ? inserted.id
      : BigInt(String(inserted.id));
  } catch (error) {
    console.error("Failed to insert order", {
      orderNumber: payload.orderNumber,
      status: payload.status,
      customerPhone: payload.customerPhone,
      error,
    });
    throw error;
  }
}
