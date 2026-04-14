export type OrderRow = {
  id: string;
  orderNumber: string;
  status: string;
  customerName: string;
  customerPhone: string;
  customerCity: string;
  customerAddress: string;
  subtotal: string | number;
  shippingFee: string | number;
  total: string | number;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};

export type OrderItemRow = {
  id: string;
  orderId: string;
  productId: string | null;
  productName: string;
  productNameAr: string;
  productImage: string | null;
  price: string | number;
  quantity: number;
  subtotal: string | number;
};

export function mapOrder(
  order: OrderRow,
  items: OrderItemRow[],
) {
  return {
    id: order.id,
    orderNumber: order.orderNumber,
    status: order.status,
    customerName: order.customerName,
    customerPhone: order.customerPhone,
    customerCity: order.customerCity,
    customerAddress: order.customerAddress,
    items: items.map((item) => ({
      id: item.id,
      productId: item.productId,
      productName: item.productName,
      productNameAr: item.productNameAr,
      productImage: item.productImage,
      price: Number(item.price ?? 0),
      quantity: Number(item.quantity ?? 1),
      subtotal: Number(item.subtotal ?? 0),
    })),
    subtotal: Number(order.subtotal ?? 0),
    shippingFee: Number(order.shippingFee ?? 0),
    total: Number(order.total ?? 0),
    notes: order.notes,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
  };
}
