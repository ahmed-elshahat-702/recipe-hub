import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { connectDB } from "@/lib/db/connect";
import { authOptions } from "@/app/api/auth/auth-options";
import { Recipe } from "@/lib/db/models/Recipe";
import { User } from "@/lib/db/models/User";

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  try {
    await connectDB();
    const { id } = await context.params;

    const recipe = await Recipe.findById(id);
    if (!recipe) {
      return NextResponse.json({ error: "Recipe not found" }, { status: 404 });
    }

    return NextResponse.json({
      likes: recipe.likes.length,
      hasLiked: recipe.likes.includes(session?.user?.id),
    });
  } catch (error) {
    console.error("Error fetching recipe likes:", error);
    return NextResponse.json(
      { error: "Failed to fetch recipe likes" },
      { status: 500 }
    );
  }
}

export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();
    const { id } = await context.params;
    const userId = session.user.id;

    // Validate input
    if (!id || !userId) {
      return NextResponse.json(
        { error: "Invalid recipe or user ID" },
        { status: 400 }
      );
    }

    // Find the recipe
    const recipe = await Recipe.findById(id);
    if (!recipe) {
      return NextResponse.json({ error: "Recipe not found" }, { status: 404 });
    }

    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if user has already liked the recipe
    const hasLiked = recipe.likes.some(
      (likeId: string) => likeId.toString() === userId
    );

    let likedRecipe, likedUser;

    if (hasLiked) {
      // Unlike: remove user from recipe likes and recipe from user's liked recipes
      recipe.likes = recipe.likes.filter(
        (likeId: string) => likeId.toString() !== userId
      );
      user.likedRecipes = user.likedRecipes.filter(
        (recipeId: string) => recipeId.toString() !== id
      );
    } else {
      // Like: add user to recipe likes and recipe to user's liked recipes
      recipe.likes.push(userId);

      // Only add to likedRecipes if not already present
      if (
        !user.likedRecipes.some(
          (recipeId: string) => recipeId.toString() === id
        )
      ) {
        user.likedRecipes.push(id);
      }
    }

    // Save both recipe and user
    likedRecipe = await recipe.save();
    likedUser = await user.save();

    // Verify save operation
    if (!likedRecipe || !likedUser) {
      throw new Error("Failed to save like/unlike changes");
    }

    return NextResponse.json({
      likes: likedRecipe.likes.length,
      hasLiked: !hasLiked,
      message: hasLiked
        ? "Recipe unliked successfully"
        : "Recipe liked successfully",
      likedRecipesCount: likedUser.likedRecipes.length,
    });
  } catch (error) {
    console.error("Detailed error liking recipe:", error);

    // More specific error handling
    if (error instanceof Error) {
      return NextResponse.json(
        {
          error: "Failed to like recipe",
          details: error.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: "Unexpected error occurred while liking recipe" },
      { status: 500 }
    );
  }
}
