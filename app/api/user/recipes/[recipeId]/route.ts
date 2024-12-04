import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { connectDB } from "@/lib/db/connect";
import { authOptions } from "@/app/api/auth/auth-options";
import { User } from "@/lib/db/models/User";

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    // Remove recipe from user's createdRecipes array
    await User.findByIdAndUpdate(session.user.id, {
      $pull: { createdRecipes: id },
    });

    return NextResponse.json({ message: "Recipe removed from user's recipes" });
  } catch (error) {
    console.error("Error removing recipe from user:", error);
    return NextResponse.json(
      { error: "Failed to remove recipe from user" },
      { status: 500 }
    );
  }
}
