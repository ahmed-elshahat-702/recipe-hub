import { connectDB } from "@/lib/db/connect";
import { Recipe } from "@/lib/db/models/Recipe";
import { User } from "@/lib/db/models/User";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    await connectDB();

    const user = await User.findById(id).populate({
      path: "likedRecipes",
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

    return NextResponse.json(
      {
        likedRecipes: user.likedRecipes,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
