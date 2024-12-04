import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import { Recipe } from "@/lib/db/models/Recipe";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/auth-options";
import { User } from "@/lib/db/models/User";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("query");
    const category = searchParams.get("category");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = 10;

    await connectDB();

    const filterQuery: {
      $text?: { $search: string };
      categories?: string;
    } = {};

    if (query) {
      filterQuery.$text = { $search: query };
    }

    if (category) {
      filterQuery.categories = category;
    }

    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    const recipes = await Recipe.find(filterQuery)
      .populate({
        path: "author",
        select: "name image",
        transform: (doc: any, id: any) => {
          // Only show author details if:
          // 1. The recipe is not anonymous, or
          // 2. The viewer is the author themselves
          if (!doc?.isAnonymous || (userId && userId === id.toString())) {
            return { _id: doc._id, name: doc.name, image: doc.image };
          }
          return { name: "Anonymous User" };
        },
      })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await Recipe.countDocuments(filterQuery);

    return NextResponse.json({
      recipes,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        current: page,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: `Internal Server Error: ${error}` },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const data = await request.json();
    const { isAnonymous, ...recipeData } = data;

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "You must be logged in to create a recipe" },
        { status: 401 }
      );
    }

    await connectDB();

    // Handle images array instead of single imageUrl
    const images = Array.isArray(recipeData.images) ? recipeData.images : [];

    // Create the recipe with author and isAnonymous flag
    const recipe = await Recipe.create({
      ...recipeData,
      images,
      author: session.user.id,
      isAnonymous: isAnonymous || false,
    });

    // Always add recipe to user's createdRecipes since we're keeping track of authorship
    await User.findByIdAndUpdate(
      session.user.id,
      { $push: { createdRecipes: recipe._id } },
      { new: true }
    );

    return NextResponse.json(recipe, { status: 201 });
  } catch (error) {
    console.error("Error creating recipe:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to create recipe",
      },
      { status: 500 }
    );
  }
}
