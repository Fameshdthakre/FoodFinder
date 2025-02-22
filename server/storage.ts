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
    let query = db
      .select()
      .from(restaurants)
      .limit(50);

    // Build conditions array
    const conditions = [];

    // Filter by cuisine if specified and not 'all'
    if (filters.cuisine && filters.cuisine !== 'all') {
      console.log('Adding cuisine filter:', filters.cuisine); // Debug log
      conditions.push(
        sql`${restaurants.categories}::text[] @> ARRAY[${filters.cuisine}]::text[]`
      );
    }

    // Filter by price level if specified
    if (typeof filters.maxPrice === 'number') {
      console.log('Adding price filter:', filters.maxPrice); // Debug log
      conditions.push(
        lte(restaurants.priceLevel, filters.maxPrice)
      );
    }

    // Filter by location if coordinates and radius are provided
    if (filters.lat && filters.lng && filters.radius) {
      console.log('Adding location filter:', { lat: filters.lat, lng: filters.lng, radius: filters.radius }); // Debug log
      const latDiff = 0.0145 * filters.radius; // Rough approximation for km to lat
      const lngDiff = 0.0145 * filters.radius;

      const minLat = filters.lat - latDiff;
      const maxLat = filters.lat + latDiff;
      const minLng = filters.lng - lngDiff;
      const maxLng = filters.lng + lngDiff;

      conditions.push(
        sql`${restaurants.lat}::float8 BETWEEN ${minLat} AND ${maxLat}`,
        sql`${restaurants.lng}::float8 BETWEEN ${minLng} AND ${maxLng}`
      );
    }

    // Apply all conditions if any exist
    if (conditions.length > 0) {
      console.log('Applying conditions:', conditions.length); // Debug log
      query = query.where(and(...conditions));
    }

    const results = await query;
    console.log('Query returned:', results.length, 'results'); // Debug log
    return results;
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