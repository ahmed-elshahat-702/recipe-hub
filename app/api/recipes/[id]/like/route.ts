import { NextResponse } from "next/server";
import { Recipe } from "@/lib/db/models/Recipe";
import { getServerSession } from "next-auth";
import { connectDB } from "@/lib/db/connect";
import { authOptions } from "@/app/api/auth/auth-options";

export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: "You must be logged in to like a recipe" },
        { status: 401 }
      );
    }

    await connectDB();
    const { id } = await context.params;

    const recipe = await Recipe.findById(id);
    if (!recipe) {
      return NextResponse.json({ error: "Recipe not found" }, { status: 404 });
    }

    const userId = session.user.id;
    const hasLiked = recipe.likes.includes(userId);

    if (hasLiked) {
      // Unlike
      recipe.likes = recipe.likes.filter(
        (likeId: { toString: () => string }) => likeId.toString() !== userId
      );
    } else {
      // Like
      recipe.likes.push(userId);
    }

    await recipe.save();

    return NextResponse.json({
      likes: recipe.likes.length,
      hasLiked: !hasLiked,
    });
  } catch (error) {
    console.error("Error handling recipe like:", error);
    return NextResponse.json(
      { error: "Failed to update recipe like" },
      { status: 500 }
    );
  }
}
