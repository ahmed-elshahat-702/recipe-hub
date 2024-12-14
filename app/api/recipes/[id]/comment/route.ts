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
    await connectDB();
    const { id } = await context.params;

    const recipe = await Recipe.findById(id).populate([
      {
        path: "comments.user",
        select: "name image",
      },
      {
        path: "comments.replies.user",
        select: "name image",
      },
    ]);

    if (!recipe) {
      return NextResponse.json({ error: "Recipe not found" }, { status: 404 });
    }

    return NextResponse.json(recipe.comments);
  } catch (error) {
    console.error("Error fetching comments:", error);
    return NextResponse.json(
      { error: "Failed to fetch comments" },
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
        { error: "You must be logged in to comment" },
        { status: 401 }
      );
    }

    const { content } = await req.json();
    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { error: "Comment content is required" },
        { status: 400 }
      );
    }

    await connectDB();
    const { id } = await context.params;

    const recipe = await Recipe.findById(id);
    if (!recipe) {
      return NextResponse.json({ error: "Recipe not found" }, { status: 404 });
    }

    const comment = {
      user: session.user.id,
      content,
      createdAt: new Date(),
    };

    recipe.comments.push(comment);
    await recipe.save();

    // Populate the user information for the new comment
    const populatedRecipe = await Recipe.findById(id).populate({
      path: "comments.user",
      select: "name image",
    });

    const newComment =
      populatedRecipe.comments[populatedRecipe.comments.length - 1];

    return NextResponse.json(newComment);
  } catch (error) {
    console.error("Error adding comment:", error);
    return NextResponse.json(
      { error: "Failed to add comment" },
      { status: 500 }
    );
  }
}
