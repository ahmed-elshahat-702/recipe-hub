import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CookingPot, Utensils, Users } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen">
      <section className="py-20 px-4 text-center">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl mb-6">
            Share Your Culinary Journey
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Join our community of food enthusiasts. Share recipes, discover new
            dishes, and connect with fellow home chefs.
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/recipes/create" className="inline-flex">
              <Button className="w-40 sm:w-56 lg:w-60">
                <CookingPot className="mr-2 h-5 w-5" />
                Share a Recipe
              </Button>
            </Link>
            <Link href="/recipes" className="inline-flex">
              <Button variant="outline" className="w-40 sm:w-56 lg:w-60">
                <Utensils className="mr-2 h-5 w-5" />
                Explore Recipes
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            Why Join RecipeShare?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                <CookingPot className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Share Your Recipes</h3>
              <p className="text-muted-foreground">
                Document and share your favorite recipes with our community.
              </p>
            </div>
            <div className="text-center p-6">
              <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                <Utensils className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                Discover New Dishes
              </h3>
              <p className="text-muted-foreground">
                Explore a vast collection of recipes from around the world.
              </p>
            </div>
            <div className="text-center p-6">
              <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Join the Community</h3>
              <p className="text-muted-foreground">
                Connect with other food enthusiasts and share your culinary
                experiences.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
