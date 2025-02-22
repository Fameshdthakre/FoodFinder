import type { Express } from "express";
import { createServer } from "http";
import { storage } from "./storage";
import { SearchFilters, DietaryOptions } from "@shared/schema";
import multer from 'multer';
import { parse } from 'csv-parse';

export async function registerRoutes(app: Express) {
  // Search restaurants with filters
  app.get("/api/restaurants", async (req, res) => {
    try {
      const filters: SearchFilters = {
        cuisine: req.query.cuisine as string,
        maxPrice: req.query.maxPrice ? parseInt(req.query.maxPrice as string) : undefined,
        minPrice: req.query.minPrice ? parseInt(req.query.minPrice as string) : undefined,
        rating: req.query.rating ? parseFloat(req.query.rating as string) : undefined,
        lat: req.query.lat ? parseFloat(req.query.lat as string) : undefined,
        lng: req.query.lng ? parseFloat(req.query.lng as string) : undefined,
        radius: req.query.radius ? parseFloat(req.query.radius as string) : undefined,
        dietaryPreferences: req.query.dietary ? (req.query.dietary as string).split(',') : undefined,
        userId: req.query.userId as string,
        sortBy: req.query.sortBy as "rating" | "price" | "distance" | undefined
      };

      console.log('Received filters:', filters);

      const results = await storage.searchRestaurants(filters);
      console.log(`Found ${results.length} restaurants`);

      res.json(results);
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

  const upload = multer({ storage: multer.memoryStorage() });

  // CSV Upload endpoint
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