import React, { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Edit, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { formatDistanceToNow } from "date-fns";
import { useSession } from "next-auth/react";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";
import { useRecipeInteractions } from "@/store/recipe-interactions";
import Link from "next/link";
import { comment } from "postcss";

export interface RecipeCommentReplyProps {
  reply: {
    _id: string;
    user: {
      _id: string;
      name: string;
      image: string;
    };
    content: string;
    createdAt: string;
  };
  recipeId: string;
  commentId: string;
  recipe: {
    author: {
      _id: string;
    };
  };
  user: {
    _id: string;
    id: string;
  };
}

const RecipeCommentReply = ({
  reply,
  recipeId,
  commentId,
  recipe,
  user,
}: RecipeCommentReplyProps) => {
  const [editingReply, setEditingReply] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { data: session } = useSession();
  const { toast } = useToast();

  const { updateReply, deleteReply } = useRecipeInteractions();

  const handleEdit = async (replyId: string) => {
    if (!session) {
      toast({
        title: "Please log in",
        description: "You must be logged in to edit replies",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      await axios.patch(
        `/api/recipes/${recipeId}/comment/${commentId}/replies/${replyId}`,
        {
          content: editContent,
          isReply: true,
        }
      );

      updateReply(recipeId, commentId, replyId, editContent);
      setEditingReply(null);
      setEditContent("");
      toast({
        title: "Success",
        description: "Reply updated successfully",
      });
    } catch (error) {
      console.error("Error updating reply:", error);
      toast({
        title: "Error",
        description: "Failed to update reply",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (replyId: string) => {
    if (!session) {
      toast({
        title: "Please log in",
        description: "You must be logged in to delete replies",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      await axios.delete(
        `/api/recipes/${recipeId}/comment/${commentId}/replies/${replyId}`
      );

      deleteReply(recipeId, replyId);
      toast({
        title: "Success",
        description: "Reply deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting reply:", error);
      toast({
        title: "Error",
        description: "Failed to delete reply",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex gap-4">
      <Avatar>
        <AvatarImage src={reply.user.image} />
        <AvatarFallback>
          {reply.user.name
            .split(" ")
            .map((n) => n[0])
            .join("")}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <Link
              href={
                recipe?.author?._id === user?._id
                  ? "/profile"
                  : `/user/${recipe?.author?._id}`
              }
              className="inline-flex items-center space-x-2 text-main hover:text-mainHover"
            >
              <span className="font-semibold">{reply.user.name}</span>
            </Link>
            <span className="text-sm text-muted-foreground">
              {formatDistanceToNow(new Date(reply.createdAt), {
                addSuffix: true,
              })}
            </span>
          </div>
          {session?.user.id === reply.user._id && (
            <div className="space-x-2">
              <Button
                size="icon"
                variant="secondary"
                disabled={isLoading}
                className="h-8 w-8"
                onClick={() => {
                  setEditingReply(reply._id);
                  setEditContent(reply.content);
                }}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    size="icon"
                    variant="destructive"
                    disabled={isLoading}
                    className="h-8 w-8"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Comment</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete this comment? This action
                      cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      className="bg-destructive hover:bg-destructive/90"
                      onClick={() => handleDelete(reply._id)}
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}
        </div>
        {editingReply === reply._id ? (
          <div className="space-y-2">
            <Textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="min-h-[60px]"
            />
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={() => handleEdit(reply._id)}
                disabled={isLoading}
                className="bg-main hover:bg-mainHover"
              >
                Save
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setEditingReply(null);
                  setEditContent("");
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-sm">{reply.content}</p>
        )}
      </div>
    </div>
  );
};

export default RecipeCommentReply;
