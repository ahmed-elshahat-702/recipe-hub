"use client";

import { Input } from "@/components/ui/input";
import { useRecipeStore } from "@/store/use-recipe-store";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, X, UtensilsCrossed, ArrowUpDown } from "lucide-react";
import { useState } from "react";

const categories = [
  "All",
  "Breakfast",
  "Lunch",
  "Dinner",
  "Dessert",
  "Snack",
  "Beverage",
];

const sortOptions = [
  { value: "latest", label: "Latest" },
  { value: "oldest", label: "Oldest" },
  { value: "name-asc", label: "Name (A-Z)" },
  { value: "name-desc", label: "Name (Z-A)" },
];

export function RecipeFilters() {
  const { setSearchQuery, setSelectedCategory, setSortBy } = useRecipeStore();
  const [searchValue, setSearchValue] = useState("");

  return (
    <div className="flex flex-col gap-4 md:flex-row items-center justify-between">
      <div className="flex-1 w-full">
        <label htmlFor="search" className="text-sm font-medium mb-2 block">
          Search Recipes
        </label>
        <div className="relative">
          <Input
            id="search"
            type="search"
            placeholder="Search recipes..."
            className="w-full pl-10 pr-10 [&::-webkit-search-cancel-button]:hidden"
            value={searchValue}
            onChange={(e) => {
              const value = e.target.value;
              setSearchValue(value);
              setSearchQuery(value);
            }}
          />
          <Search className="w-5 h-5 text-main absolute left-3 top-1/2 transform -translate-y-1/2" />
          <button
            type="button"
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            onClick={() => {
              setSearchValue("");
              setSearchQuery("");
            }}
          >
            <X className="w-5 h-5 hover:text-mainHover" />
          </button>
        </div>
      </div>
      <div className="flex flex-1 gap-4 w-full md:w-auto">
        <div className="flex-1 flex flex-col gap-2">
          <label htmlFor="category" className="text-sm font-medium">
            Category
          </label>
          <Select
            onValueChange={(value) =>
              setSelectedCategory(value === "All" ? "" : value)
            }
          >
            <SelectTrigger id="category" className="w-full">
              <UtensilsCrossed className="w-4 h-4 mr-2 text-main" />
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex-1 flex flex-col gap-2">
          <label htmlFor="sort" className="text-sm font-medium">
            Sort By
          </label>
          <Select
            onValueChange={(value: "latest" | "oldest" | "name-asc" | "name-desc") =>
              setSortBy(value)
            }
          >
            <SelectTrigger id="sort" className="w-full">
              <ArrowUpDown className="w-4 h-4 mr-2 text-main" />
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
