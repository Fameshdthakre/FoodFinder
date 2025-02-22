import { Card, CardContent } from "@/components/ui/card";
import { Star, DollarSign } from "lucide-react";
import type { Restaurant } from "@shared/schema";

interface Props {
  restaurant: Restaurant;
}

export default function RestaurantCard({ restaurant }: Props) {
  const getSentimentEmoji = (score: number) => {
    if (score >= 0.7) return "😊";
    if (score >= 0.4) return "😐";
    return "😕";
  };

  const getPriceString = (level: number) => "".padStart(level, "$");

  // Ensure numeric values are properly converted from strings if needed
  const rating = Number(restaurant.rating);
  const sentimentScore = Number(restaurant.sentimentScore);
  const totalReviews = Number(restaurant.totalReviews);
  const priceLevel = Number(restaurant.priceLevel);

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-semibold text-lg">{restaurant.name}</h3>
            <p className="text-sm text-muted-foreground">{restaurant.categories.join(", ")}</p>
          </div>
          <div className="flex items-center space-x-1">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="font-medium">{rating.toFixed(1)}</span>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-primary font-medium">
              {getPriceString(priceLevel)}
            </span>
            <span className="text-2xl" title={`Sentiment Score: ${sentimentScore.toFixed(2)}`}>
              {getSentimentEmoji(sentimentScore)}
            </span>
          </div>
          <span className="text-sm text-muted-foreground">
            {totalReviews} reviews
          </span>
        </div>

        <p className="mt-2 text-sm text-muted-foreground truncate">
          {restaurant.address}
        </p>
      </CardContent>
    </Card>
  );
}