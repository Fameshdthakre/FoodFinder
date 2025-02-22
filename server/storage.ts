import { restaurants, userPreferences, userInteractions, type Restaurant, type InsertRestaurant, type SearchFilters, type UserPreference, type InsertUserPreference } from "@shared/schema";
import { db } from "./db";
import { eq, and, lte, sql } from "drizzle-orm";

export interface IStorage {
  searchRestaurants(filters: SearchFilters): Promise<Restaurant[]>;
  getRestaurant(id: number): Promise<Restaurant | undefined>;
  insertRestaurant(restaurant: InsertRestaurant): Promise<Restaurant>;
  getUserPreferences(userId: string): Promise<UserPreference | undefined>;
  setUserPreferences(prefs: InsertUserPreference): Promise<UserPreference>;
  recordInteraction(userId: string, restaurantId: number, type: string): Promise<void>;
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
      console.log('Adding cuisine filter:', filters.cuisine);
      conditions.push(
        sql`${restaurants.categories}::text[] @> ARRAY[${filters.cuisine}]::text[]`
      );
    }

    // Filter by price level if specified
    if (typeof filters.maxPrice === 'number') {
      console.log('Adding price filter:', filters.maxPrice);
      conditions.push(
        lte(restaurants.priceLevel, filters.maxPrice)
      );
    }

    // Filter by dietary preferences if specified
    if (filters.dietaryPreferences?.length) {
      console.log('Adding dietary filters:', filters.dietaryPreferences);
      conditions.push(
        sql`${restaurants.dietaryOptions}::text[] && ARRAY[${filters.dietaryPreferences}]::text[]`
      );
    }

    // Enhanced location-based discovery with dynamic radius
    if (filters.lat && filters.lng && filters.radius) {
      console.log('Adding location filter:', { lat: filters.lat, lng: filters.lng, radius: filters.radius });

      // Convert radius to degrees (approximate)
      const latDiff = filters.radius / 111.32; // 1 degree = 111.32 km
      const lngDiff = filters.radius / (111.32 * Math.cos(filters.lat * Math.PI / 180));

      conditions.push(
        sql`${restaurants.lat}::float8 BETWEEN ${filters.lat - latDiff} AND ${filters.lat + latDiff}`,
        sql`${restaurants.lng}::float8 BETWEEN ${filters.lng - lngDiff} AND ${filters.lng + lngDiff}`
      );
    }

    // Apply all conditions if any exist
    if (conditions.length > 0) {
      console.log('Applying conditions:', conditions.length);
      query = query.where(and(...conditions));
    }

    const results = await query;
    console.log('Query returned:', results.length, 'results');

    // If user ID is provided, personalize the results
    if (filters.userId) {
      const userPrefs = await this.getUserPreferences(filters.userId);
      if (userPrefs) {
        return this.personalizeResults(results, userPrefs);
      }
    }

    return results;
  }

  private async personalizeResults(restaurants: Restaurant[], userPrefs: UserPreference): Promise<Restaurant[]> {
    // Get user's recent interactions
    const recentInteractions = await db
      .select()
      .from(userInteractions)
      .where(eq(userInteractions.userId, userPrefs.userId))
      .limit(20);

    return restaurants.map(restaurant => {
      let personalScore = 0;

      // Match dietary preferences
      if (userPrefs.dietaryPreferences && restaurant.dietaryOptions) {
        const matchingPrefs = userPrefs.dietaryPreferences.filter(pref => 
          restaurant.dietaryOptions?.includes(pref)
        ).length;
        personalScore += (matchingPrefs / userPrefs.dietaryPreferences.length) * 0.3;
      }

      // Match favorite categories
      if (userPrefs.favoriteCategories && restaurant.categories) {
        const matchingCategories = userPrefs.favoriteCategories.filter(cat =>
          restaurant.categories.includes(cat)
        ).length;
        personalScore += (matchingCategories / userPrefs.favoriteCategories.length) * 0.3;
      }

      // Price preference match
      if (userPrefs.pricePreference) {
        personalScore += restaurant.priceLevel <= userPrefs.pricePreference ? 0.2 : 0;
      }

      // Previous positive interactions bonus
      const positiveInteractions = recentInteractions.filter(interaction =>
        interaction.restaurantId === restaurant.id &&
        interaction.interactionType === 'favorite'
      ).length;
      personalScore += positiveInteractions * 0.1;

      return {
        ...restaurant,
        score: personalScore
      };
    }).sort((a, b) => (b.score || 0) - (a.score || 0));
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

  async getUserPreferences(userId: string): Promise<UserPreference | undefined> {
    const [prefs] = await db
      .select()
      .from(userPreferences)
      .where(eq(userPreferences.userId, userId));
    return prefs;
  }

  async setUserPreferences(prefs: InsertUserPreference): Promise<UserPreference> {
    const [inserted] = await db
      .insert(userPreferences)
      .values(prefs)
      .returning();
    return inserted;
  }

  async recordInteraction(userId: string, restaurantId: number, type: string): Promise<void> {
    await db
      .insert(userInteractions)
      .values({
        userId,
        restaurantId,
        interactionType: type
      });
  }
}

export const storage = new DatabaseStorage();