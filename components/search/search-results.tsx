import React from "react";
import { Recipe } from "@/lib/db/models/Recipe";
import { connectDB } from "@/lib/db/connect";
import { RecipeCard } from "@/components/recipes/recipe-card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

async function getSearchResults(
  query?: string,
  category?: string,
  page: number = 1
) {
  await connectDB();

  const limit = 12;
  const skip = (page - 1) * limit;
  const filterQuery: { $text?: { $search: string }; categories?: string } = {};

  if (query) {
    filterQuery.$text = { $search: query };
  }

  if (category) {
    filterQuery.categories = category;
  }

  const recipes = await Recipe.find(filterQuery)
    .populate("author", "name image")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Recipe.countDocuments(filterQuery);

  return {
    recipes,
    pagination: {
      total,
      pages: Math.ceil(total / limit),
      current: page,
    },
  };
}

export async function SearchResults({
  query,
  category,
  page = "1",
}: {
  query?: string;
  category?: string;
  page?: string;
}) {
  const { recipes, pagination } = await getSearchResults(
    query,
    category,
    parseInt(page)
  );

  if (recipes.length === 0) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold mb-4">No recipes found</h2>
        <p className="text-muted-foreground mb-6">
          Try adjusting your search or filter to find what you&apos;re looking
          for
        </p>
        <Button asChild>
          <Link href="/recipes">Browse all recipes</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8 mt-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recipes.map((recipe) => (
          <RecipeCard key={recipe._id.toString()} recipe={recipe} />
        ))}
      </div>

      {pagination.pages > 1 && (
        <div className="flex justify-center gap-2">
          {[...Array(pagination.pages)].map((_, i) => {
            const pageNumber = i + 1;
            const isCurrentPage = pageNumber === pagination.current;

            const params = new URLSearchParams();
            if (query) params.set("query", query);
            if (category) params.set("category", category);
            params.set("page", pageNumber.toString());

            return (
              <Button
                key={pageNumber}
                variant={isCurrentPage ? "default" : "outline"}
                size="sm"
                asChild
              >
                <Link href={`/search?${params.toString()}`}>{pageNumber}</Link>
              </Button>
            );
          })}
        </div>
      )}
    </div>
  );
}
