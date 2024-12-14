import { authOptions } from "@/app/api/auth/auth-options";
import { connectDB } from "@/lib/db/connect";
import { Recipe } from "@/lib/db/models/Recipe";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function PATCH(
  request: Request,
  context: {
    params: Promise<{ id: string; commentId: string; repliesId: string }>;
  }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: "You must be logged in to edit replies" },
        { status: 401 }
      );
    }

    const { id, commentId, repliesId } = await context.params;
    const { content } = await request.json();

    if (!content?.trim()) {
      return NextResponse.json(
        { error: "Reply content is required" },
        { status: 400 }
      );
    }

    await connectDB();

    const recipe = await Recipe.findById(id);
    if (!recipe) {
      return NextResponse.json({ error: "Recipe not found" }, { status: 404 });
    }

    const comment = recipe.comments.id(commentId);
    if (!comment) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 });
    }

    const reply = comment.replies.id(repliesId);
    if (!reply) {
      return NextResponse.json({ error: "Reply not found" }, { status: 404 });
    }

    if (reply.user.toString() !== session.user.id) {
      return NextResponse.json(
        { error: "Not authorized to edit this reply" },
        { status: 403 }
      );
    }

    reply.content = content;
    reply.updatedAt = new Date();
    await recipe.save();

    return NextResponse.json({ message: "Reply updated successfully", reply });
  } catch (error) {
    console.error("Error updating reply:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  context: {
    params: Promise<{ id: string; commentId: string; repliesId: string }>;
  }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: "You must be logged in to delete replies" },
        { status: 401 }
      );
    }

    const { id, commentId, repliesId } = await context.params;

    await connectDB();

    const recipe = await Recipe.findById(id);
    if (!recipe) {
      return NextResponse.json({ error: "Recipe not found" }, { status: 404 });
    }

    const comment = recipe.comments.id(commentId);
    if (!comment) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 });
    }

    const reply = comment.replies.id(repliesId);
    if (!reply) {
      return NextResponse.json({ error: "Reply not found" }, { status: 404 });
    }

    // Check if the user owns the reply
    if (reply.user.toString() !== session.user.id) {
      return NextResponse.json(
        { error: "Not authorized to delete this reply" },
        { status: 403 }
      );
    }

    comment.replies.pull(repliesId);
    await recipe.save();

    return NextResponse.json({ message: "Reply deleted successfully" });
  } catch (error) {
    console.error("Error deleting reply:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
