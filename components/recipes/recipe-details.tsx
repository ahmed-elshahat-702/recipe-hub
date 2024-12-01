import { Badge } from "@/components/ui/badge";
import { ChefHat, Clock, Users } from "lucide-react";
import Image from "next/image";
import { Recipe } from "@/lib/types/recipe";

export function RecipeDetails({ recipe }: { recipe: Recipe }) {
  return (
    <div className="max-w-4xl mx-auto text-foreground">
      <div className="grid md:grid-cols-3 gap-6">
        <section className="md:col-span-2 bg-card rounded-lg shadow-md overflow-hidden">
          <div className="relative h-64">
            <Image
              src={recipe.images?.[0] || "/images/recipe-placeholder.jpg"}
              alt={recipe.title}
              fill
              className="object-cover"
            />
          </div>
          <div className="p-6 space-y-4">
            <h1 className="text-3xl font-bold text-foreground">
              {recipe.title}
            </h1>
            <p className="text-muted-foreground">{recipe.description}</p>
          </div>
        </section>

        <div className="space-y-6">
          <section className="bg-card rounded-lg shadow-sm p-4 border border-main/20">
            <div className="grid grid-cols-3 gap-4">
              <div className="flex flex-col items-center">
                <Clock className="h-6 w-6 text-main mb-1" />
                <span className="text-sm font-medium">
                  {recipe.cookingTime} mins
                </span>
              </div>
              <div className="flex flex-col items-center">
                <Users className="h-6 w-6 text-main mb-1" />
                <span className="text-sm font-medium">
                  {recipe.servings} servings
                </span>
              </div>
              <div className="flex flex-col items-center">
                <ChefHat className="h-6 w-6 text-main mb-1" />
                <span className="text-sm font-medium capitalize">
                  {recipe.difficulty}
                </span>
              </div>
            </div>
          </section>

          <section className="bg-card rounded-lg shadow-sm p-4 border border-main/20">
            <h2 className="text-lg font-semibold mb-3 text-main">
              Ingredients
            </h2>
            <ul className="space-y-2 text-sm">
              {recipe.ingredients.map((ingredient, index) => (
                <li key={index} className="flex items-center">
                  <span className="w-16 font-medium">
                    {ingredient.amount} {ingredient.unit}
                  </span>
                  <span>{ingredient.name}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="bg-card rounded-lg shadow-sm p-4 border border-main/20">
            <h2 className="text-lg font-semibold mb-3 text-main">
              Instructions
            </h2>
            <ol className="space-y-3 text-sm">
              {recipe.instructions.map((instruction, index) => (
                <li key={index} className="flex">
                  <span className="font-bold text-main mr-3">{index + 1}.</span>
                  <p>{instruction}</p>
                </li>
              ))}
            </ol>
          </section>

          <section className="bg-card rounded-lg shadow-sm p-4 border border-main/20">
            <h2 className="text-lg font-semibold mb-3 text-main">Categories</h2>
            <div className="flex flex-wrap gap-2">
              {recipe.categories && recipe.categories.length > 0 ? (
                recipe.categories.map((category) => (
                  <Badge
                    key={category}
                    variant="outline"
                    className="text-xs px-2 py-1 bg-main/10"
                  >
                    {category}
                  </Badge>
                ))
              ) : (
                <p className="text-muted-foreground text-sm">No categories</p>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
