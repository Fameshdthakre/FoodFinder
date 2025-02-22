import { restaurants, type Restaurant, type InsertRestaurant, type SearchFilters } from "@shared/schema";
import { db } from "./db";
import { eq, and, lte, sql } from "drizzle-orm";

export interface IStorage {
  searchRestaurants(filters: SearchFilters): Promise<Restaurant[]>;
  getRestaurant(id: number): Promise<Restaurant | undefined>;
  insertRestaurant(restaurant: InsertRestaurant): Promise<Restaurant>;
}

export class DatabaseStorage implements IStorage {
  async searchRestaurants(filters: SearchFilters): Promise<Restaurant[]> {
    let query = db.select().from(restaurants);

    if (filters.cuisine) {
      query = query.where(sql`${restaurants.categories} @> ARRAY[${filters.cuisine}]::varchar[]`);
    }

    if (filters.maxPrice) {
      query = query.where(lte(restaurants.priceLevel, filters.maxPrice));
    }

    // Basic proximity filter if location provided
    if (filters.lat && filters.lng && filters.radius) {
      // Simplified distance calculation
      const latDiff = 0.0145 * filters.radius; // Rough approximation for km to lat
      const lngDiff = 0.0145 * filters.radius;

      const minLat = filters.lat - latDiff;
      const maxLat = filters.lat + latDiff;
      const minLng = filters.lng - lngDiff;
      const maxLng = filters.lng + lngDiff;

      query = query.where(and(
        sql`${restaurants.lat} BETWEEN ${minLat} AND ${maxLat}`,
        sql`${restaurants.lng} BETWEEN ${minLng} AND ${maxLng}`
      ));
    }

    return await query.limit(50);
  }

  async getRestaurant(id: number): Promise<Restaurant | undefined> {
    const [restaurant] = await db
      .select()
      .from(restaurants)
      .where(eq(restaurants.id, id));
    return restaurant;
  }

  async insertRestaurant(restaurant: InsertRestaurant): Promise<Restaurant> {
    const [inserted] = await db
      .insert(restaurants)
      .values(restaurant)
      .returning();
    return inserted;
  }
}

export const storage = new DatabaseStorage();