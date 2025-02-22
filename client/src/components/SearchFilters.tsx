import { useForm } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import type { SearchFilters } from "@shared/schema";

const CUISINES = [
  "Italian", "Japanese", "Mexican", "Chinese", "Indian",
  "American", "Thai", "Mediterranean", "French", "Korean"
];

interface Props {
  onFilterChange: (filters: SearchFilters) => void;
}

export default function RestaurantSearchFilters({ onFilterChange }: Props) {
  const { register, watch } = useForm<SearchFilters>();

  // Watch for changes and notify parent
  const filters = watch();
  const handleFilterChange = () => {
    onFilterChange(filters);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label>Cuisine Type</Label>
        <Select onValueChange={(value) => {
          filters.cuisine = value;
          handleFilterChange();
        }}>
          <SelectTrigger>
            <SelectValue placeholder="Select cuisine" />
          </SelectTrigger>
          <SelectContent>
            {CUISINES.map(cuisine => (
              <SelectItem key={cuisine} value={cuisine}>{cuisine}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Maximum Price Level</Label>
        <div className="pt-2">
          <Slider
            defaultValue={[4]}
            max={4}
            min={1}
            step={1}
            onValueChange={(value) => {
              filters.maxPrice = value[0];
              handleFilterChange();
            }}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Search Radius (km)</Label>
        <Input
          type="number"
          min={1}
          max={20}
          {...register("radius", { valueAsNumber: true })}
          onChange={handleFilterChange}
        />
      </div>
    </div>
  );
}