import "./globals.css";
import React from "react";
import type { Metadata } from "next";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import AuthProvider from "@/components/auth-provider";
import { cn } from "@/lib/utils";
import { Navigation } from "@/components/navigation/navigation";

export const metadata: Metadata = {
  title: "RecipeShare - Share Your Culinary Creations",
  description:
    "A community-driven platform for sharing and discovering recipes",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={cn(
          "min-h-screen bg-gradient-to-b from-background to-muted text-foreground",
          "antialiased"
        )}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <Navigation />
            <main className="max-sm:max-w-sm max-sm:px-6 max-md:max-w-lg max-lg:max-w-2xl max-xl:max-w-4xl max-w-5xl mx-auto">
              {children}
            </main>
            <Toaster />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
