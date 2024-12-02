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

    const recipes = await Recipe.find(filterQuery)
      .populate("author", "name image")
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
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();
    await connectDB();

    const recipe = await Recipe.create({
      ...data,
      images: data.imageUrl,
      author: session.user.id,
    });

    await User.findByIdAndUpdate(
      session.user.id,
      { $push: { createdRecipes: recipe._id } },
      { new: true }
    );

    return NextResponse.json({ recipe }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: `Internal Server Error: ${error}` },
      { status: 500 }
    );
  }
}
