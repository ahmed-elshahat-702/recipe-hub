"use client";
import React from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import Link from "next/link";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { CookingPot, LogOut, User } from "lucide-react";
import { ModeToggle } from "./mode-toggle";
import { useEffect, useState } from "react";
import { Skeleton } from "../ui/skeleton";
import { useProfile } from "@/hooks/use-profile";
import axios from "axios";
import Image from "next/image";
import { useToast } from "@/hooks/use-toast";

export function Navigation() {
  const { data: session, status } = useSession();
  const [mounted, setMounted] = useState(false);
  const { profile, setProfile } = useProfile();
  const { toast } = useToast();

  const fetccProfileData = async () => {
    if (!session?.user) return;
    try {
      const response = await axios.get(`/api/user/profile`);
      setProfile(response.data.user);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch profile data. Please try again.",
      });
    }
  };

  useEffect(() => {
    setMounted(true);
    fetccProfileData();
  }, [session]);

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
              <span className="font-bold text-xl text-main">RecipeHub</span>
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
            ) : session && session.user && profile ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-8 w-8 rounded-full"
                  >
                    <Avatar className="h-8 w-8 border-2 border-main">
                      <AvatarImage
                        src={profile.image || "/default-avatar.png"}
                        alt={profile.name || "User"}
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = "/default-avatar.png";
                          target.width = 32;
                          target.height = 32;
                        }}
                      />
                      <AvatarFallback>
                        <Image
                          src="/images/default-avatar.png"
                          alt={profile.name || "User"}
                          width={32}
                          height={32}
                          priority
                        />
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
