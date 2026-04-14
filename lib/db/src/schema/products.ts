import { pgTable, text, numeric, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const productsTable = pgTable("products", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  nameAr: text("name_ar").notNull(),
  description: text("description").notNull().default(""),
  descriptionAr: text("description_ar").notNull().default(""),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  compareAtPrice: numeric("compare_at_price", { precision: 10, scale: 2 }),
  imageUrl: text("image_url"),
  images: text("images").array().notNull().default([]),
  categoryId: text("category_id"),
  stock: integer("stock").notNull().default(0),
  sku: text("sku"),
  featured: boolean("featured").notNull().default(false),
  active: boolean("active").notNull().default(true),
  badge: text("badge"),
  slug: text("slug"),
  priceQty2: numeric("price_qty_2", { precision: 10, scale: 2 }),
  priceQty3: numeric("price_qty_3", { precision: 10, scale: 2 }),
  rating: numeric("rating", { precision: 3, scale: 1 }).default("4.5"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertProductSchema = createInsertSchema(productsTable).omit({ createdAt: true, updatedAt: true });
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof productsTable.$inferSelect;
