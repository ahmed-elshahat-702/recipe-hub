"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import Link from "next/link";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { CookingPot, LogOut, Search, User } from "lucide-react";
import { ModeToggle } from "./mode-toggle";
import { useEffect, useState } from "react";
import { Skeleton } from "./ui/skeleton";

export function Navigation() {
  const { data: session, status } = useSession();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Render a simplified version during SSR
  if (!mounted) {
    return null;
  }

  return (
    <nav className="border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link href="/" className="flex items-center">
              <CookingPot className="h-6 w-6 mr-2 text-main" />
              <span className="font-bold text-xl text-main">RecipeShare</span>
            </Link>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link
                href="/recipes"
                className="inline-flex items-center px-1 pt-1 text-sm font-medium"
              >
                Recipes
              </Link>
              {/* <Link
                href="/search"
                className="inline-flex items-center px-1 pt-1 text-sm font-medium"
              >
                <Search className="h-4 w-4 mr-1" />
                Search
              </Link> */}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <ModeToggle />
            {status === "loading" ? (
              <Skeleton className="w-8 h-8 rounded-full bg-main/80" />
            ) : session ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-8 w-8 rounded-full"
                  >
                    <Avatar className="h-8 w-8 border-2 border-main">
                      <AvatarImage
                        src={session.user?.image || ""}
                        alt={session.user?.name || ""}
                      />
                      <AvatarFallback>
                        {session.user?.name?.[0] || "?"}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="flex items-center">
                      <User className="mr-2 h-4 w-4 text-main" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => signOut()}>
                    {/* sign out icon */}
                    <LogOut className="mr-2 h-4 w-4 text-main" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button onClick={() => signIn()}>Sign in</Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
