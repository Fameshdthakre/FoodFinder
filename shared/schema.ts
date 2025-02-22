import { pgTable, text, serial, numeric, integer, varchar, PgArray } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const restaurants = pgTable("restaurants", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  rating: numeric("rating").notNull(),
  totalReviews: integer("total_reviews").notNull(),
  priceLevel: integer("price_level").notNull(),
  categories: varchar("categories", { length: 100 }).array().notNull(),
  address: varchar("address", { length: 255 }).notNull(),
  lat: numeric("lat").notNull(),
  lng: numeric("lng").notNull(),
  reviews: text("reviews").array().notNull(),
  sentimentScore: numeric("sentiment_score").notNull(),
  placeUrl: varchar("place_url", { length: 255 }).notNull()
});

export const insertRestaurantSchema = createInsertSchema(restaurants);

export type Restaurant = typeof restaurants.$inferSelect;
export type InsertRestaurant = typeof restaurants.$inferInsert;

export type SearchFilters = {
  cuisine?: string;
  maxPrice?: number;
  lat?: number;
  lng?: number;
  radius?: number;
};