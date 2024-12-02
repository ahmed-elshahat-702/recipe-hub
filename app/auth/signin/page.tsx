import { Metadata } from "next";
import React, { Suspense } from "react";

import { AuthForm } from "@/components/auth/auth-form";
import { ChefHat } from "lucide-react";
import Link from "next/link";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/auth-options";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Sign In - RecipeShare",
  description: "Sign in to your RecipeShare account",
};

export default async function SignInPage() {
  const session = await getServerSession(authOptions);

  if (session) {
    redirect("/");
  }
  return (
    <div className="flex items-center justify-center px-4 py-6 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="text-center">
          <ChefHat className="mx-auto h-12 w-12 text-orange-500" />
          <h2 className="mt-6 text-3xl font-bold tracking-tight ">
            Sign in to your account
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Or{" "}
            <Link
              href="/auth/signup"
              className="font-medium text-main hover:text-mainHover"
            >
              create a new account
            </Link>
          </p>
        </div>
        <Suspense fallback={<div>Loading...</div>}>
          <AuthForm variant="signin" />
        </Suspense>
      </div>
    </div>
  );
}
