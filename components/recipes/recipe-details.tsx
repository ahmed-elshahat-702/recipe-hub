import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Clock, Users, ChefHat, SquareArrowOutUpRight } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Skeleton } from "@/components/ui/skeleton";
import { useUserStore } from "@/store/use-user-store";
import Autoplay from "embla-carousel-autoplay";
import { RecipeRating } from "./recipe-rating";
import { RecipeLikeButton } from "./recipe-like-button";
import { RecipeComments } from "./recipe-comments";
import { Recipe } from "@/lib/types/recipe";
import { Badge } from "../ui/badge";

export function RecipeDetails({ recipe }: { recipe: Recipe }) {
  const images = recipe.images ?? ["/images/recipe-placeholder.jpg"];

  const { fetchUser, user } = useUserStore();

  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <div className="max-w-4xl mx-auto text-foreground space-y-4">
      <div className="grid md:grid-cols-3 gap-6">
        <section className="md:col-span-2 bg-card rounded-lg shadow border border-main/20 overflow-hidden">
          <div className="relative">
            {(recipe?.images ?? []).length > 1 ? (
              <Carousel
                opts={{
                  align: "start",
                  loop: true,
                }}
                plugins={[
                  Autoplay({
                    delay: 4000,
                  }),
                ]}
                className="w-full"
              >
                <CarouselContent>
                  {images.map((image, index) => (
                    <CarouselItem key={index}>
                      <div className="relative h-44 sm:h-64">
                        <Image
                          src={image}
                          alt={`${recipe.title} - Image ${index + 1}`}
                          fill
                          className="w-full h-full rounded"
                        />
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="left-2 text-main border border-main hover:text-mainHover hover:border-mainHover shadow" />
                <CarouselNext className="right-2 text-main border border-main hover:text-mainHover hover:border-mainHover shadow" />
              </Carousel>
            ) : (
              <div className="relative h-44 sm:h-64">
                <Image
                  src={recipe?.images?.[0] ?? "/images/recipe-placeholder.jpg"}
                  alt={`${recipe.title} - Image`}
                  fill
                  className="object-cover"
                />
              </div>
            )}
          </div>
          <div className="p-6 space-y-4">
            <div className="md:flex items-center justify-between">
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                {recipe.title}
              </h1>
              <div className="flex items-center max-md:justify-between gap-4">
                <RecipeRating recipeId={recipe._id} />
                <RecipeLikeButton
                  recipeId={recipe._id}
                  initialLikes={recipe.likes.length}
                  initialHasLiked={recipe.likes.includes(user?._id)}
                  variant="default"
                />
              </div>
            </div>
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
            <h2 className="text-lg font-semibold mb-3 text-main">Categories</h2>
            <div className="flex flex-wrap gap-2">
              {recipe.categories && recipe.categories.length > 0 ? (
                recipe.categories.map((category) => (
                  <Badge
                    key={category}
                    variant="outline"
                    className="text-xs px-3 py-1 bg-main/10 border-main"
                  >
                    {category}
                  </Badge>
                ))
              ) : (
                <p className="text-muted-foreground text-sm">No categories</p>
              )}
            </div>
          </section>
          <section className="bg-card rounded-lg shadow-sm p-4 border border-main/20">
            <h2 className="text-lg font-semibold mb-3 text-main">Author</h2>
            {recipe.author && user ? (
              recipe.isAnonymous ? (
                <div className="flex items-center space-x-2 text-main">
                  <div className="relative w-6 h-6 rounded-full overflow-hidden border-2 border-main">
                    <Image
                      src="/images/anonymous-avatar.png"
                      alt="Anonymous"
                      fill
                      className="object-cover p-[1px]"
                    />
                  </div>
                  <span className="text-sm font-medium">Anonymous</span>
                </div>
              ) : (
                <Link
                  href={
                    recipe.author._id === user?._id
                      ? "/profile"
                      : `/user/${recipe.author._id}`
                  }
                  className="inline-flex items-center space-x-2 text-main hover:text-mainHover"
                >
                  <div className="relative w-6 h-6 rounded-full overflow-hidden border-2 border-main">
                    <Image
                      src={recipe.author.image || "/images/default-avatar.png"}
                      alt={recipe.author.name}
                      fill
                    />
                  </div>
                  <span className="text-sm font-medium">
                    {recipe.author.name}
                  </span>
                  <SquareArrowOutUpRight className="h-3 w-3 " />
                </Link>
              )
            ) : (
              <Skeleton className="w-52 h-5 bg-main" />
            )}
          </section>
        </div>
      </div>
      <section className="w-full bg-card rounded-lg shadow-sm p-4 border border-main/20">
        <h2 className="text-lg font-semibold mb-3 text-main">Instructions</h2>
        <ol className="space-y-3 text-sm">
          {recipe.instructions.map((instruction, index) => (
            <li key={index} className="flex">
              <span className="font-bold text-main mr-3">{index + 1}.</span>
              <p>{instruction}</p>
            </li>
          ))}
        </ol>
      </section>
      {/* Comments Section */}
      <section className="mt-8 bg-card rounded-lg shadow-sm p-6 border border-main/20">
        <RecipeComments recipeId={recipe._id} recipe={recipe} user={user} />
      </section>
    </div>
  );
}
