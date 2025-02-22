export interface Restaurant {
  id: number;
  name: string;
  rating: number;
  totalReviews: number;
  priceLevel: number;
  categories: string[];
  address: string;
  lat: number;
  lng: number;
  reviews: string[];
  sentimentScore: number;
  placeUrl: string;
  score?: number;
}

export interface SearchFilters {
  cuisine?: string;
  maxPrice?: number;
  lat?: number;
  lng?: number;
  radius?: number;
}
