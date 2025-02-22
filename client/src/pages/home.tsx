import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import RestaurantSearchFilters from "@/components/SearchFilters";
import RestaurantCard from "@/components/RestaurantCard";
import RestaurantMap from "@/components/RestaurantMap";
import type { Restaurant, SearchFilters } from "@shared/schema";

export default function Home() {
  const [filters, setFilters] = useState<SearchFilters>({
    maxPrice: 4,
    radius: 5,
    dietaryPreferences: []
  });

  // Get user's location for initial map center
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFilters(prev => ({
            ...prev,
            lat: position.coords.latitude,
            lng: position.coords.longitude
          }));
        },
        () => {
          // Default to NYC coordinates if geolocation fails
          setFilters(prev => ({
            ...prev,
            lat: 40.7128,
            lng: -74.0060
          }));
        }
      );
    }
  }, []);

  // Build query string from filters
  const queryString = Object.entries(filters)
    .filter(([_, value]) => value !== undefined && value !== '' && (Array.isArray(value) ? value.length > 0 : true))
    .map(([key, value]) => `${key}=${encodeURIComponent(Array.isArray(value) ? value.join(',') : value)}`)
    .join('&');

  const { data: restaurants = [], isLoading } = useQuery<Restaurant[]>({
    queryKey: ['/api/restaurants', queryString],
    queryFn: async () => {
      const response = await fetch(`/api/restaurants?${queryString}`);
      if (!response.ok) {
        throw new Error('Failed to fetch restaurants');
      }
      return response.json();
    }
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4">
        <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          Restaurant Recommendations
        </h1>

        <div className="flex h-[calc(100vh-8rem)] gap-4">
          {/* Search Filters Section - 25% */}
          <div className="w-1/4">
            <Card className="p-4 h-full overflow-y-auto">
              <RestaurantSearchFilters
                onFilterChange={setFilters}
              />
            </Card>
          </div>

          {/* Restaurant List Section - 25% */}
          <div className="w-1/4">
            <div className="h-full overflow-y-auto pr-2">
              {isLoading ? (
                Array(4).fill(0).map((_, i) => (
                  <Card key={i} className="mb-4 h-48 animate-pulse bg-muted" />
                ))
              ) : restaurants.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No restaurants found matching your criteria
                </div>
              ) : (
                <div className="space-y-4">
                  {restaurants.map((restaurant) => (
                    <RestaurantCard key={restaurant.id} restaurant={restaurant} />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Map Section - 50% */}
          <div className="w-1/2">
            <div className="h-full rounded-lg overflow-hidden shadow-lg">
              <RestaurantMap
                restaurants={restaurants}
                center={filters.lat && filters.lng ? [filters.lat, filters.lng] : undefined}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}