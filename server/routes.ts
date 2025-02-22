import type { Express } from "express";
import { createServer } from "http";
import { storage } from "./storage";
import { SearchFilters, DietaryOptions } from "@shared/schema";

export async function registerRoutes(app: Express) {
  // Search restaurants with filters
  app.get("/api/restaurants", async (req, res) => {
    try {
      const filters: SearchFilters = {
        cuisine: req.query.cuisine as string,
        maxPrice: req.query.maxPrice ? parseInt(req.query.maxPrice as string) : undefined,
        lat: req.query.lat ? parseFloat(req.query.lat as string) : undefined,
        lng: req.query.lng ? parseFloat(req.query.lng as string) : undefined,
        radius: req.query.radius ? parseFloat(req.query.radius as string) : undefined,
        dietaryPreferences: req.query.dietary ? (req.query.dietary as string).split(',') : undefined,
        userId: req.query.userId as string
      };

      console.log('Received filters:', filters);

      const results = await storage.searchRestaurants(filters);
      console.log(`Found ${results.length} restaurants`);

      // Calculate recommendation scores
      const scoredResults = results.map(restaurant => ({
        ...restaurant,
        score: calculateScore(restaurant, filters)
      }));

      // Sort by score and return top 10
      scoredResults.sort((a, b) => (b.score || 0) - (a.score || 0));
      res.json(scoredResults.slice(0, 10));
    } catch (error) {
      console.error('Error in /api/restaurants:', error);
      res.status(500).json({ error: "Failed to search restaurants" });
    }
  });

  // Get dietary options
  app.get("/api/dietary-options", (_req, res) => {
    res.json(DietaryOptions);
  });

  // Get user preferences
  app.get("/api/user-preferences/:userId", async (req, res) => {
    try {
      const prefs = await storage.getUserPreferences(req.params.userId);
      res.json(prefs || {});
    } catch (error) {
      res.status(500).json({ error: "Failed to get user preferences" });
    }
  });

  // Update user preferences
  app.post("/api/user-preferences", async (req, res) => {
    try {
      const prefs = await storage.setUserPreferences(req.body);
      res.json(prefs);
    } catch (error) {
      res.status(500).json({ error: "Failed to update user preferences" });
    }
  });

  // Record user interaction
  app.post("/api/interactions", async (req, res) => {
    try {
      const { userId, restaurantId, type } = req.body;
      await storage.recordInteraction(userId, restaurantId, type);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to record interaction" });
    }
  });

  // CSV Upload endpoint
  const multer = require('multer');
  const { parse } = require('csv-parse');
  const upload = multer({ storage: multer.memoryStorage() });

  app.post("/api/restaurants/upload-csv", upload.single('file'), async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    try {
      const records = [];
      const parser = parse({
        columns: true,
        skip_empty_lines: true
      });

      parser.on('readable', function() {
        let record;
        while ((record = parser.read()) !== null) {
          records.push({
            name: record.name,
            rating: parseFloat(record.rating),
            totalReviews: parseInt(record.totalReviews),
            priceLevel: parseInt(record.priceLevel),
            categories: record.categories.split('|'),
            address: record.address,
            lat: parseFloat(record.lat),
            lng: parseFloat(record.lng),
            reviews: record.reviews.split('|'),
            sentimentScore: parseFloat(record.sentimentScore),
            placeUrl: record.placeUrl,
            dietaryOptions: record.dietaryOptions ? record.dietaryOptions.split('|') : [],
            popularDishes: record.popularDishes ? record.popularDishes.split('|') : [],
            peakHours: record.peakHours ? record.peakHours.split('|') : []
          });
        }
      });

      parser.on('end', async function() {
        for (const record of records) {
          await storage.insertRestaurant(record);
        }
        res.json({ success: true, count: records.length });
      });

      parser.write(req.file.buffer.toString());
      parser.end();
    } catch (error) {
      console.error('Error uploading CSV:', error);
      res.status(500).json({ error: "Failed to process CSV file" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

function calculateScore(restaurant: any, filters: SearchFilters) {
  let score = 0;

  // Base score components (40%)
  const ratingScore = (restaurant.rating / 5) * 0.2;
  const priceScore = ((5 - restaurant.priceLevel) / 4) * 0.1;
  const sentimentScore = ((restaurant.sentimentScore + 1) / 2) * 0.1;
  score += ratingScore + priceScore + sentimentScore;

  // Location proximity score (30%)
  if (filters.lat && filters.lng) {
    const distance = calculateDistance(
      filters.lat,
      filters.lng,
      parseFloat(restaurant.lat),
      parseFloat(restaurant.lng)
    );
    const proximityScore = Math.max(0, 1 - (distance / (filters.radius || 5))) * 0.3;
    score += proximityScore;
  }

  // Dietary preference match (20%)
  if (filters.dietaryPreferences?.length && restaurant.dietaryOptions?.length) {
    const matchingPrefs = filters.dietaryPreferences.filter(pref =>
      restaurant.dietaryOptions.includes(pref)
    ).length;
    const dietaryScore = (matchingPrefs / filters.dietaryPreferences.length) * 0.2;
    score += dietaryScore;
  }

  // Popularity and trend score (10%)
  const popularityScore = Math.min(1, restaurant.totalReviews / 1000) * 0.1;
  score += popularityScore;

  return score;
}

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
}

function deg2rad(deg: number): number {
  return deg * (Math.PI / 180);
}