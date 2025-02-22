import type { Express } from "express";
import { createServer } from "http";
import { storage } from "./storage";
import { SearchFilters } from "@shared/schema";

export async function registerRoutes(app: Express) {
  // Search restaurants with filters
  app.get("/api/restaurants", async (req, res) => {
    try {
      const filters: SearchFilters = {
        cuisine: req.query.cuisine as string,
        maxPrice: req.query.maxPrice ? parseInt(req.query.maxPrice as string) : undefined,
        lat: req.query.lat ? parseFloat(req.query.lat as string) : undefined,
        lng: req.query.lng ? parseFloat(req.query.lng as string) : undefined,
        radius: req.query.radius ? parseFloat(req.query.radius as string) : undefined
      };

      console.log('Received filters:', filters); // Debug log

      const results = await storage.searchRestaurants(filters);
      console.log(`Found ${results.length} restaurants`); // Debug log

      // Calculate recommendation scores
      const scoredResults = results.map(restaurant => ({
        ...restaurant,
        score: calculateScore(restaurant)
      }));

      // Sort by score and return top 10
      scoredResults.sort((a, b) => b.score - a.score);
      res.json(scoredResults.slice(0, 10));
    } catch (error) {
      console.error('Error in /api/restaurants:', error);
      res.status(500).json({ error: "Failed to search restaurants" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

function calculateScore(restaurant: any) {
  // Normalize ratings to 0-1
  const ratingScore = restaurant.rating / 5;

  // Normalize price (1-4) to 0-1 (inverted so cheaper is better)
  const priceScore = (5 - restaurant.priceLevel) / 4;

  // Normalize sentiment (-1 to 1) to 0-1
  const sentimentScore = (restaurant.sentimentScore + 1) / 2;

  // Weighted average
  return (
    0.4 * ratingScore +
    0.3 * priceScore +
    0.3 * sentimentScore
  );
}