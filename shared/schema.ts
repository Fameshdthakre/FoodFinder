import { pgTable, text, serial, numeric, integer, varchar, PgArray, boolean, timestamp } from "drizzle-orm/pg-core";
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
  placeUrl: varchar("place_url", { length: 255 }).notNull(),
  dietaryOptions: varchar("dietary_options", { length: 50 }).array(),
  popularDishes: varchar("popular_dishes", { length: 100 }).array(),
  peakHours: varchar("peak_hours", { length: 20 }).array()
});

export const userPreferences = pgTable("user_preferences", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  dietaryPreferences: varchar("dietary_preferences", { length: 50 }).array(),
  favoriteCategories: varchar("favorite_categories", { length: 50 }).array(),
  pricePreference: integer("price_preference"),
  preferredRadius: numeric("preferred_radius"),
  lastLocation: varchar("last_location", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow()
});

export const userInteractions = pgTable("user_interactions", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  restaurantId: integer("restaurant_id").notNull(),
  interactionType: varchar("interaction_type", { length: 20 }).notNull(), // 'view', 'favorite', 'visit'
  timestamp: timestamp("timestamp").defaultNow()
});

// Schema for inserting new records
export const insertRestaurantSchema = createInsertSchema(restaurants);
export const insertUserPreferenceSchema = createInsertSchema(userPreferences);
export const insertUserInteractionSchema = createInsertSchema(userInteractions);

// Types for TypeScript
export type Restaurant = typeof restaurants.$inferSelect;
export type InsertRestaurant = typeof restaurants.$inferInsert;
export type UserPreference = typeof userPreferences.$inferSelect;
export type InsertUserPreference = typeof userPreferences.$inferInsert;
export type UserInteraction = typeof userInteractions.$inferSelect;
export type InsertUserInteraction = typeof userInteractions.$inferInsert;

// Extended search filters
export type SearchFilters = {
  cuisine?: string;
  maxPrice?: number;
  minPrice?: number;
  rating?: number;
  lat?: number;
  lng?: number;
  radius?: number;
  dietaryPreferences?: string[];
  userId?: string;
};

// Dietary options enum
export const DietaryOptions = {
  VEGAN: 'vegan',
  VEGETARIAN: 'vegetarian',
  NON_VEGETARIAN: 'non-vegetarian'
} as const;