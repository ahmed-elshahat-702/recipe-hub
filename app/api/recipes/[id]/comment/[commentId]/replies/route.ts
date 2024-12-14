import { authOptions } from "@/app/api/auth/auth-options";
import { connectDB } from "@/lib/db/connect";
import { Recipe } from "@/lib/db/models/Recipe";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string; commentId: string }> }
) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json(
      { error: "You must be logged in to delete comments" },
      { status: 401 }
    );
  }

  const { id, commentId } = await context.params;
  const { content } = await request.json();

  if (!content?.trim()) {
    return NextResponse.json(
      { error: "Comment content is required" },
      { status: 400 }
    );
  }

  try {
    await connectDB();

    const recipe = await Recipe.findById(id).populate({
      path: "comments.user",
      select: "name image",
    });
    if (!recipe) {
      return NextResponse.json({ error: "Recipe not found" }, { status: 404 });
    }

    const comment = recipe.comments.id(commentId);
    if (!comment) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 });
    }

    const reply = {
      user: session.user.id,
      content,
      createdAt: new Date(),
    };

    comment.replies.push(reply);
    await recipe.save();

    const newReply =
      recipe.comments.id(commentId).replies[
        recipe.comments.id(commentId).replies.length - 1
      ];

    return NextResponse.json(newReply);
  } catch (error) {
    console.error("Error adding reply:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
