import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import RestaurantSearchFilters from "@/components/SearchFilters";
import RestaurantCard from "@/components/RestaurantCard";
import RestaurantMap from "@/components/RestaurantMap";
import type { Restaurant, SearchFilters } from "@shared/schema";

export default function Home() {
  const [filters, setFilters] = useState<SearchFilters>({});

  const { data: restaurants = [], isLoading } = useQuery<Restaurant[]>({
    queryKey: ['/api/restaurants', filters],
    enabled: true
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
            <RestaurantMap restaurants={restaurants} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {isLoading ? (
                Array(4).fill(0).map((_, i) => (
                  <Card key={i} className="h-48 animate-pulse bg-muted" />
                ))
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