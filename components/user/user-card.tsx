import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CalendarIcon, User, UtensilsIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { Recipe } from "@/lib/types/recipe";

interface UserCardProps {
  user: {
    name?: string | null;
    image?: string | null;
    bio?: string | null;
  };
  anyUserRecipes: Recipe[];
  joinedDate: string;
  className?: string;
}

export function UserCard({
  user,
  className,
  anyUserRecipes,
  joinedDate,
}: UserCardProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-4 p-4 rounded-lg border bg-card shadow-sm"
      )}
    >
      <Avatar className="h-20 w-20 border-2 border-primary/10">
        <AvatarImage
          src={user.image || "/images/default-avatar.png"}
          alt={user.name || "User"}
        />
        <AvatarFallback>
          <Image
            src="/images/default-avatar.png"
            alt={user.name || "User"}
            width={80}
            height={80}
            priority
            className="object-cover"
          />
        </AvatarFallback>
      </Avatar>
      <div className="flex flex-col gap-1">
        <h3 className="font-semibold text-lg text-wrap">
          {user.name || "Anonymous User"}
        </h3>
        {user.bio && (
          <p className="text-sm text-muted-foreground text-wrap">{user.bio}</p>
        )}
        <div className="sm:flex items-center gap-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <CalendarIcon className="w-4 h-4 text-main" />
            <span>{joinedDate}</span>
          </div>
          <div className="flex items-center gap-1">
            <UtensilsIcon className="w-4 h-4 text-main" />
            <span>{anyUserRecipes?.length || 0} Recipes</span>
          </div>
        </div>
      </div>
    </div>
  );
}
