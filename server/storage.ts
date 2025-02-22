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
      .select({
        id: restaurants.id,
        name: restaurants.name,
        rating: sql<number>`CAST(${restaurants.rating} AS float)`,
        totalReviews: sql<number>`CAST(${restaurants.totalReviews} AS integer)`,
        priceLevel: sql<number>`CAST(${restaurants.priceLevel} AS integer)`,
        categories: restaurants.categories,
        address: restaurants.address,
        lat: sql<number>`CAST(${restaurants.lat} AS float)`,
        lng: sql<number>`CAST(${restaurants.lng} AS float)`,
        reviews: restaurants.reviews,
        sentimentScore: sql<number>`CAST(${restaurants.sentimentScore} AS float)`,
        placeUrl: restaurants.placeUrl
      })
      .from(restaurants);

    if (filters.cuisine && filters.cuisine !== 'all') {
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
        sql`CAST(${restaurants.lat} AS float) BETWEEN ${minLat} AND ${maxLat}`,
        sql`CAST(${restaurants.lng} AS float) BETWEEN ${minLng} AND ${maxLng}`
      ));
    }

    return await query.limit(50);
  }

  async getRestaurant(id: number): Promise<Restaurant | undefined> {
    const [restaurant] = await db
      .select({
        id: restaurants.id,
        name: restaurants.name,
        rating: sql<number>`CAST(${restaurants.rating} AS float)`,
        totalReviews: sql<number>`CAST(${restaurants.totalReviews} AS integer)`,
        priceLevel: sql<number>`CAST(${restaurants.priceLevel} AS integer)`,
        categories: restaurants.categories,
        address: restaurants.address,
        lat: sql<number>`CAST(${restaurants.lat} AS float)`,
        lng: sql<number>`CAST(${restaurants.lng} AS float)`,
        reviews: restaurants.reviews,
        sentimentScore: sql<number>`CAST(${restaurants.sentimentScore} AS float)`,
        placeUrl: restaurants.placeUrl
      })
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