import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import RestaurantSearchFilters from "@/components/SearchFilters";
import RestaurantCard from "@/components/RestaurantCard";
import RestaurantMap from "@/components/RestaurantMap";
import type { Restaurant, SearchFilters } from "@shared/schema";

export default function Home() {
  const [filters, setFilters] = useState<SearchFilters>({
    maxPrice: 4,
    radius: 5
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
    .filter(([_, value]) => value !== undefined && value !== '')
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join('&');

  const { data: restaurants = [], isLoading } = useQuery<Restaurant[]>({
    queryKey: [`/api/restaurants?${queryString}`],
    enabled: Boolean(filters.lat && filters.lng)
  });

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          Restaurant Recommendations
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <Card className="p-4">
              <RestaurantSearchFilters onFilterChange={setFilters} />
            </Card>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <RestaurantMap 
              restaurants={restaurants} 
              center={filters.lat && filters.lng ? [filters.lat, filters.lng] : undefined}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {isLoading ? (
                Array(4).fill(0).map((_, i) => (
                  <Card key={i} className="h-48 animate-pulse bg-muted" />
                ))
              ) : restaurants.length === 0 ? (
                <div className="col-span-2 text-center py-8 text-muted-foreground">
                  No restaurants found matching your criteria
                </div>
              ) : (
                restaurants.map((restaurant) => (
                  <RestaurantCard key={restaurant.id} restaurant={restaurant} />
                ))
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}