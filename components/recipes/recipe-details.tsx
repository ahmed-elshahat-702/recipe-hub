import React from "react";
import { Badge } from "@/components/ui/badge";
import { ChefHat, Clock, Users, ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { Recipe } from "@/lib/types/recipe";
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";

export function RecipeDetails({ recipe }: { recipe: Recipe }) {
  const images = recipe.images?.length
    ? recipe.images
    : ["/images/recipe-placeholder.jpg"];

  return (
    <div className="max-w-4xl mx-auto text-foreground space-y-4">
      <div className="grid md:grid-cols-3 gap-6">
        <section className="md:col-span-2 bg-card rounded-lg shadow border border-main/20 overflow-hidden">
          <div className="relative">
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
                    <div className="relative h-72">
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
    </div>
  );
}
