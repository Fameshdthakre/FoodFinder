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

const CUISINES = ["Indian", "Chinese", "American", "Thai"];

interface Props {
  onFilterChange: (filters: SearchFilters) => void;
  userId?: string;
  currentFilters: SearchFilters;
}

const SORT_OPTIONS = [
  { value: 'rating', label: 'Star Rating' },
  { value: 'price', label: 'Price' },
  { value: 'distance', label: 'Distance' }
];

export default function RestaurantSearchFilters({ onFilterChange, userId, currentFilters }: Props) {
  const { register, setValue, watch } = useForm<SearchFilters>({
    defaultValues: {
      maxPrice: 4,
      minPrice: 1,
      radius: 5,
      rating: 0,
      cuisine: 'all',
      dietaryPreferences: [],
      sortBy: 'rating'
    }
  });

  const clearFilters = () => {
    // Reset form values
    setValue('rating', 0);
    setValue('maxPrice', 4);
    setValue('minPrice', 1);
    setValue('radius', 5);
    setValue('cuisine', 'all');
    setValue('dietaryPreferences', []);
    setValue('sortBy', 'rating');

    // Reset cuisine select
    const selectTrigger = document.querySelector('[data-state]');
    if (selectTrigger) {
      selectTrigger.textContent = 'All Cuisines';
    }

    // Reset star rating slider
    const ratingSlider = document.querySelector('[role="slider"]') as HTMLElement;
    if (ratingSlider) {
      ratingSlider.style.left = '0%';
    }

    // Reset price range slider thumbs
    const priceSliders = document.querySelectorAll('[role="slider"]') as NodeListOf<HTMLElement>;
    if (priceSliders.length >= 2) {
      priceSliders[0].style.left = '0%';
      priceSliders[1].style.left = '100%';
    }

    // Reset radius input
    const radiusInput = document.querySelector('input[type="number"]') as HTMLInputElement;
    if (radiusInput) {
      radiusInput.value = '5';
    }

    // Reset checkboxes
    const checkboxes = document.querySelectorAll('input[type="checkbox"]') as NodeListOf<HTMLInputElement>;
    checkboxes.forEach(checkbox => {
      checkbox.checked = false;
    });

    // Update parent component with reset values
    onFilterChange({
      cuisine: 'all',
      rating: 0,
      maxPrice: 4,
      minPrice: 1,
      radius: 5,
      dietaryPreferences: [],
      sortBy: 'rating',
      lat: currentFilters.lat,
      lng: currentFilters.lng
    });
  };

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

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label>Cuisine Type</Label>
        <Select 
          onValueChange={(value) => handleFilterChange('cuisine', value)}
          defaultValue="all"
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
        <Label>Star Rating (Minimum)</Label>
        <div className="pt-2">
          <Slider
            defaultValue={[watchedFields.rating || 0]}
            max={5}
            min={0}
            step={0.5}
            onValueChange={(value) => handleFilterChange('rating', value[0])}
          />
          <div className="text-sm text-muted-foreground mt-1">
            {watchedFields.rating || 0} stars and above
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Price Range</Label>
        <div className="pt-2">
          <Slider
            defaultValue={[watchedFields.minPrice || 1, watchedFields.maxPrice || 4]}
            max={4}
            min={1}
            step={1}
            onValueChange={([min, max]) => {
              handleFilterChange('minPrice', min);
              handleFilterChange('maxPrice', max);
            }}
          />
          <div className="text-sm text-muted-foreground mt-1">
            {watchedFields.minPrice || 1}$ - {watchedFields.maxPrice || 4}$
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Search Radius (km)</Label>
        <Input
          type="number"
          min={1}
          max={20}
          defaultValue={5}
          onChange={(e) => handleFilterChange('radius', parseFloat(e.target.value))}
        />
      </div>

      {dietaryOptions && (
        <div className="space-y-2">
          <Label>Dietary Preferences</Label>
          <div className="flex gap-4">
            {['VEGAN', 'VEGETARIAN', 'NON_VEGETARIAN'].map((key) => (
              <div key={key} className="flex items-center space-x-2">
                <Checkbox
                  id={key}
                  checked={watchedFields.dietaryPreferences?.includes(key.toLowerCase())}
                  onCheckedChange={(checked) => {
                    const current = watchedFields.dietaryPreferences || [];
                    const updated = checked
                      ? [...current, key.toLowerCase()]
                      : current.filter(v => v !== key.toLowerCase());
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