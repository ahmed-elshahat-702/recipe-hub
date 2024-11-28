import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { type Recipe } from "@/lib/types/recipe";

interface RecipeCardProps {
  recipe: Recipe;
}

export function RecipeCard({ recipe }: RecipeCardProps) {
  return (
    <Link href={`/recipes/${recipe._id}`}>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow">
        <div className="aspect-video relative">
          {recipe && recipe.images && recipe.images.length > 0 ? (
            <Image
              src={recipe.images[0]}
              alt={recipe.title}
              fill
              className="object-cover"
            />
          ) : (
            <Image
              src={"/recipe-placeholder.jpg"}
              alt={recipe.title}
              fill
              className="object-cover"
            />
          )}
        </div>
        <CardContent className="p-4">
          <h3 className="font-semibold text-lg line-clamp-1">{recipe.title}</h3>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {recipe.description}
          </p>
        </CardContent>
        <CardFooter className="p-4 pt-0">
          <div className="flex items-center space-x-2">
            <div className="relative h-6 w-6 rounded-full overflow-hidden">
              <Image
                src={recipe.author.image || "/images/user-placeholder.jpg"}
                alt={recipe.author.name}
                fill
                className="object-cover"
              />
            </div>
            <span className="text-sm text-muted-foreground">
              {recipe.author.name}
            </span>
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}
