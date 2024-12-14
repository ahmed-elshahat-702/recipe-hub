import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import { User } from "@/lib/db/models/User";
import { Recipe } from "@/lib/db/models/Recipe";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    await connectDB();

    const user = await User.findById(id)
      .populate({
        path: "likedRecipes",
        model: Recipe,
        populate: {
          path: "author",
          model: "User",
          select: "name image",
        },
      })
      .populate({
        path: "createdRecipes",
        model: Recipe,
        populate: {
          path: "author",
          model: "User",
          select: "name image",
        },
      });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        image: user.image,
        likedRecipes: user.likedRecipes,
        createdRecipes: user.createdRecipes,
      },
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
