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
  const { register, setValue, watch } = useForm<SearchFilters>({
    defaultValues: {
      maxPrice: 4,
      radius: 5
    }
  });

  // Watch all form fields
  const watchedFields = watch();

  // Update parent component whenever any field changes
  const handleFilterChange = (field: keyof SearchFilters, value: any) => {
    setValue(field, value);
    onFilterChange({
      ...watchedFields,
      [field]: value
    });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label>Cuisine Type</Label>
        <Select 
          onValueChange={(value) => handleFilterChange('cuisine', value)}
          defaultValue={watchedFields.cuisine}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select cuisine" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Cuisines</SelectItem>
            {CUISINES.map(cuisine => (
              <SelectItem 
                key={cuisine} 
                value={cuisine.toLowerCase()}
              >
                {cuisine}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Maximum Price Level (${watchedFields.maxPrice})</Label>
        <div className="pt-2">
          <Slider
            defaultValue={[watchedFields.maxPrice || 4]}
            max={4}
            min={1}
            step={1}
            onValueChange={(value) => handleFilterChange('maxPrice', value[0])}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Search Radius (km)</Label>
        <Input
          type="number"
          min={1}
          max={20}
          defaultValue={watchedFields.radius || 5}
          onChange={(e) => handleFilterChange('radius', parseFloat(e.target.value))}
        />
      </div>
    </div>
  );
}