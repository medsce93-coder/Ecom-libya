import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { productsTable } from "./products";

export const landingPagesTable = pgTable("landing_pages", {
  id: text("id").primaryKey(),
  productId: text("product_id").notNull().references(() => productsTable.id, { onDelete: "cascade" }),
  slug: text("slug").notNull().unique(),
  headline: text("headline").notNull(),
  subheadline: text("subheadline").notNull().default(""),
  mediaUrls: text("media_urls").array().notNull().default([]),
  features: text("features").array().notNull().default([]),
  boxContents: text("box_contents"),
  urgencyText: text("urgency_text"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertLandingPageSchema = createInsertSchema(landingPagesTable).omit({
  createdAt: true,
  updatedAt: true,
});
export type InsertLandingPage = z.infer<typeof insertLandingPageSchema>;
export type LandingPage = typeof landingPagesTable.$inferSelect;
