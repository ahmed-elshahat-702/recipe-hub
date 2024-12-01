import { Metadata } from "next";
import { SignUpForm } from "@/components/auth/signup-form";
import Link from "next/link";
import { Suspense } from "react";
import { ChefHat } from "lucide-react";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/auth-options";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Sign Up - RecipeShare",
  description: "Create your RecipeShare account",
};

export default async function SignUpPage() {
  const session = await getServerSession(authOptions);

  if (session) {
    redirect("/");
  }
  return (
    <div className="flex items-center justify-center px-4 py-6 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="text-center">
          <ChefHat className="mx-auto h-12 w-12 text-orange-500" />
          <h2 className="mt-6 text-3xl font-bold tracking-tight">
            Create your account
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Already have an account?{" "}
            <Link
              href="/auth/signin"
              className="font-medium text-main hover:text-mainHover"
            >
              Sign in
            </Link>
          </p>
        </div>
        <Suspense fallback={<div>Loading...</div>}>
          <SignUpForm />
        </Suspense>
      </div>
    </div>
  );
}
