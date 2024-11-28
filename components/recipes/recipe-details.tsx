import { Badge } from "@/components/ui/badge";
import { ChefHat, Clock, Users } from "lucide-react";
import Image from "next/image";
import { Recipe } from "@/lib/types/recipe";

export function RecipeDetails({ recipe }: { recipe: Recipe }) {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row gap-6">
        <section className="md:w-2/3 relative overflow-hidden rounded-lg shadow-md">
          <Image
            src={recipe.images?.[0] || "/images/recipe-placeholder.jpg"}
            alt={recipe.title}
            width={800}
            height={400}
            className="object-cover w-full h-48 md:h-64"
          />
          <div className="absolute inset-0 bg-black bg-opacity-40 flex flex-col justify-end p-4">
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">
              {recipe.title}
            </h1>
            <p className="text-white/80 text-sm">{recipe.description}</p>
          </div>
        </section>

        <div className="md:w-1/3 space-y-6">
          <section className="flex justify-between bg-card rounded-lg shadow-sm p-3">
            <div className="flex flex-col items-center">
              <Clock className="h-6 w-6 text-primary mb-1" />
              <span className="text-sm font-medium">
                {recipe.cookingTime} mins
              </span>
            </div>
            <div className="flex flex-col items-center">
              <Users className="h-6 w-6 text-primary mb-1" />
              <span className="text-sm font-medium">
                {recipe.servings} servings
              </span>
            </div>
            <div className="flex flex-col items-center">
              <ChefHat className="h-6 w-6 text-primary mb-1" />
              <span className="text-sm font-medium capitalize">
                {recipe.difficulty}
              </span>
            </div>
          </section>

          <section className="bg-card rounded-lg shadow-sm p-4">
            <h2 className="text-lg font-semibold mb-2">Ingredients</h2>
            <ul className="space-y-1 text-sm">
              {recipe.ingredients.map((ingredient, index) => (
                <li key={index} className="flex items-center">
                  <span className="w-12 font-medium">
                    {ingredient.amount} {ingredient.unit}
                  </span>
                  <span>{ingredient.name}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="bg-card rounded-lg shadow-sm p-4">
            <h2 className="text-lg font-semibold mb-2">Instructions</h2>
            <ol className="space-y-2 text-sm">
              {recipe.instructions.map((instruction, index) => (
                <li key={index} className="flex">
                  <span className="font-bold text-primary mr-2">
                    {index + 1}.
                  </span>
                  <p>{instruction}</p>
                </li>
              ))}
            </ol>
          </section>

          <section className="bg-card rounded-lg shadow-sm p-4">
            <h2 className="text-lg font-semibold mb-2">Categories</h2>
            <div className="flex flex-wrap gap-1">
              {recipe.categories.map((category) => (
                <Badge
                  key={category}
                  variant="secondary"
                  className="text-xs px-2 py-0.5"
                >
                  {category}
                </Badge>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
