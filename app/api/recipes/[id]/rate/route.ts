import { NextResponse } from "next/server";
import { Recipe } from "@/lib/db/models/Recipe";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/auth-options";
import { connectDB } from "@/lib/db/connect";

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    await connectDB();
    const { id } = await context.params;
    const recipe = await Recipe.findById(id);

    if (!recipe) {
      return NextResponse.json({ error: "Recipe not found" }, { status: 404 });
    }

    const averageRating =
      recipe.ratings.length > 0
        ? recipe.ratings.reduce(
            (acc: any, curr: { score: any }) => acc + curr.score,
            0
          ) / recipe.ratings.length
        : 0;

    let userRating = null;
    if (session?.user) {
      const userRatingObj = recipe.ratings.find(
        (rating: { user: { toString: () => string } }) =>
          rating.user.toString() === session.user.id
      );
      if (userRatingObj) {
        userRating = userRatingObj.score;
      }
    }

    return NextResponse.json({
      averageRating: Math.round(averageRating * 10) / 10,
      totalRatings: recipe.ratings.length,
      userRating,
    });
  } catch (error) {
    console.error("Error fetching recipe rating:", error);
    return NextResponse.json(
      { error: "Failed to fetch recipe rating" },
      { status: 500 }
    );
  }
}
export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: "You must be logged in to rate a recipe" },
        { status: 401 }
      );
    }

    const { score } = await req.json();
    if (!score || score < 1 || score > 5) {
      return NextResponse.json(
        { error: "Rating must be between 1 and 5" },
        { status: 400 }
      );
    }

    await connectDB();
    const { id } = await context.params;

    const recipe = await Recipe.findById(id);
    if (!recipe) {
      return NextResponse.json({ error: "Recipe not found" }, { status: 404 });
    }

    const userId = session.user.id;
    const existingRatingIndex = recipe.ratings.findIndex(
      (rating: { user: { toString: () => string } }) =>
        rating.user.toString() === userId
    );

    if (existingRatingIndex !== -1) {
      // Update existing rating
      recipe.ratings[existingRatingIndex].score = score;
    } else {
      // Add new rating
      recipe.ratings.push({ user: userId, score });
    }

    await recipe.save();

    // Calculate average rating
    const averageRating =
      recipe.ratings.reduce(
        (acc: any, curr: { score: any }) => acc + curr.score,
        0
      ) / recipe.ratings.length;

    return NextResponse.json({
      averageRating: Math.round(averageRating * 10) / 10,
      totalRatings: recipe.ratings.length,
      userRating: score,
    });
  } catch (error) {
    console.error("Error rating recipe:", error);
    return NextResponse.json(
      { error: "Failed to rate recipe" },
      { status: 500 }
    );
  }
}
