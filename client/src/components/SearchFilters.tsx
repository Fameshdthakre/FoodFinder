import { useForm } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { useQuery } from "@tanstack/react-query";
import type { SearchFilters, UserPreference } from "@shared/schema";
import React from 'react';

const CUISINES = [
  "Italian", "Japanese", "Mexican", "Chinese", "Indian",
  "American", "Thai", "Mediterranean", "French", "Korean"
];

interface Props {
  onFilterChange: (filters: SearchFilters) => void;
  userId?: string;
}

export default function RestaurantSearchFilters({ onFilterChange, userId }: Props) {
  const clearFilters = () => {
    setValue('cuisine', undefined);
    setValue('maxPrice', 4);
    setValue('radius', 5);
    setValue('dietaryPreferences', []);
    onFilterChange({
      maxPrice: 4,
      radius: 5,
      dietaryPreferences: []
    });
  };

  const { register, setValue, watch } = useForm<SearchFilters>({
    defaultValues: {
      maxPrice: 4,
      radius: 5
    }
  });

  // Fetch user preferences if userId is provided
  const { data: userPrefs } = useQuery<UserPreference>({
    queryKey: [`/api/user-preferences/${userId}`],
    enabled: !!userId
  });

  // Fetch dietary options
  const { data: dietaryOptions } = useQuery<Record<string, string>>({
    queryKey: ['/api/dietary-options']
  });

  // Watch all form fields
  const watchedFields = watch();

  // Update parent component whenever any field changes
  const handleFilterChange = (field: keyof SearchFilters, value: any) => {
    setValue(field, value);
    const updatedFilters = {
      ...watchedFields,
      [field]: value,
      userId
    };
    onFilterChange(updatedFilters);
  };

  // Update filters with user preferences when available
  React.useEffect(() => {
    if (userPrefs?.dietaryPreferences) {
      setValue('dietaryPreferences', userPrefs.dietaryPreferences);
      setValue('maxPrice', userPrefs.pricePreference || 4);
      onFilterChange({
        ...watchedFields,
        dietaryPreferences: userPrefs.dietaryPreferences,
        maxPrice: userPrefs.pricePreference || 4,
        userId
      });
    }
  }, [userPrefs]);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label>Cuisine Type</Label>
        <Select 
          onValueChange={(value) => handleFilterChange('cuisine', value)}
          defaultValue={watchedFields.cuisine || 'all'}
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

      {dietaryOptions && (
        <div className="space-y-2">
          <Label>Dietary Preferences</Label>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(dietaryOptions).map(([key, value]) => (
              <div key={key} className="flex items-center space-x-2">
                <Checkbox
                  id={key}
                  checked={watchedFields.dietaryPreferences?.includes(value)}
                  onCheckedChange={(checked) => {
                    const current = watchedFields.dietaryPreferences || [];
                    const updated = checked
                      ? [...current, value]
                      : current.filter(v => v !== value);
                    handleFilterChange('dietaryPreferences', updated);
                  }}
                />
                <label
                  htmlFor={key}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {key.split('_').map(word => word.charAt(0) + word.slice(1).toLowerCase()).join(' ')}
                </label>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-between items-center pt-4">
        <Button variant="outline" onClick={clearFilters}>
          Clear Filters
        </Button>
      </div>
    </div>
  );
}