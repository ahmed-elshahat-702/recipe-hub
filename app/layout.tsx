import "./globals.css";
import type { Metadata } from "next";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { Navigation } from "@/components/navigation";
import AuthProvider from "@/components/auth-provider";

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
    <html lang="en">
      <body
        suppressHydrationWarning
        className="bg-gradient-to-b from-background to-muted text-foreground"
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <Navigation />
            <main className="min-h-screen max-sm:max-w-sm max-md:max-w-lg max-lg:max-w-2xl max-xl:max-w-4xl max-w-5xl mx-auto">
              {children}
            </main>
            <Toaster />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
