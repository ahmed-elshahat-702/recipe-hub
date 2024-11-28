import { Metadata } from "next";
import { Suspense } from "react";

import { AuthForm } from "@/components/auth/auth-form";

export const metadata: Metadata = {
  title: "Sign In - RecipeShare",
  description: "Sign in to your RecipeShare account",
};

export default function SignInPage() {
  return (
    <div className="container flex h-screen w-full flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <Suspense fallback={<div>Loading...</div>}>
          <AuthForm />
        </Suspense>
      </div>
    </div>
  );
}
