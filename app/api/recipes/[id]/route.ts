import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import { Recipe } from "@/lib/db/models/Recipe";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/auth-options";
import { User } from "@/lib/db/models/User";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    await connectDB();
    const recipe = await Recipe.findById(id).populate("author", "name");

    if (!recipe) {
      return NextResponse.json({ error: "Recipe not found" }, { status: 404 });
    }

    return NextResponse.json(recipe);
  } catch (error) {
    return NextResponse.json(
      { error: `Internal Server Error: ${error}` },

      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    const data = await request.json();
    await connectDB();

    const recipe = await Recipe.findOneAndUpdate(
      { _id: id, author: session.user.id },
      { ...data, updatedAt: new Date() },
      { new: true }
    );

    if (!recipe) {
      return NextResponse.json({ error: "Recipe not found" }, { status: 404 });
    }

    return NextResponse.json(recipe);
  } catch (error) {
    return NextResponse.json(
      { error: `Internal Server Error: ${error}` },

      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    await connectDB();

    const recipe = await Recipe.findOne({ _id: id, author: session.user.id });

    if (!recipe) {
      return NextResponse.json({ error: "Recipe not found" }, { status: 404 });
    }

    await Recipe.findByIdAndDelete(id);

    await User.findByIdAndUpdate(
      session.user.id,
      { $pull: { createdRecipes: id } },
      { new: true }
    );

    return NextResponse.json({ message: "Recipe deleted successfully" });
  } catch (error) {
    return NextResponse.json(
      { error: `Internal Server Error: ${error}` },
      { status: 500 }
    );
  }
}
