import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import axios from "axios";
import RecipeCommentSkeleton from "./recipe-comment-skeleton";
import { Edit, Trash2 } from "lucide-react";
import { useRecipeInteractions } from "@/store/recipe-interactions";
import Link from "next/link";
import Image from "next/image";

interface RecipeCommentsProps {
  recipeId: string;
  recipe: {
    author?: {
      _id?: string;
    };
  };
  user?: {
    _id?: string;
  } | null;
}

export function RecipeComments({
  recipeId,
  recipe,
  user,
}: RecipeCommentsProps) {
  const { data: session } = useSession();
  const actualUser = user;
  const [newComment, setNewComment] = useState("");
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [editCommentContent, setEditCommentContent] = useState("");
  const [replyContent, setReplyContent] = useState("");
  const [editingReply, setEditingReply] = useState<string | null>(null);
  const [editReplyContent, setEditReplyContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const { toast } = useToast();

  const {
    interactions,
    setComments,
    addComment,
    updateComment,
    updateReply,
    deleteComment,
    deleteReply,
  } = useRecipeInteractions();
  const comments = interactions[recipeId]?.comments || [];

  useEffect(() => {
    if (recipeId) {
      setIsFetching(true);
      fetchComments();
    }
  }, [recipeId]);

  const fetchComments = async () => {
    try {
      const response = await axios.get(`/api/recipes/${recipeId}/comment`);
      // Initialize the interaction object if it doesn't exist
      if (!interactions[recipeId]) {
        setComments(recipeId, []);
      }
      setComments(recipeId, response.data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load comments",
        variant: "destructive",
      });
    } finally {
      setIsFetching(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!session) {
      toast({
        title: "Please log in",
        description: "You must be logged in to comment",
        variant: "destructive",
      });
      return;
    }

    if (!newComment.trim()) {
      toast({
        title: "Error",
        description: "Comment cannot be empty",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      const response = await axios.post(`/api/recipes/${recipeId}/comment`, {
        content: newComment,
      });

      addComment(recipeId, response.data);
      setNewComment("");
      toast({
        title: "Success",
        description: "Comment added successfully",
      });
    } catch (error) {
      console.error("Error adding comment:", error);
      toast({
        title: "Error",
        description: "Failed to add comment",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditComment = async (commentId: string) => {
    if (!session) {
      toast({
        title: "Please log in",
        description: "You must be logged in to edit comments",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      await axios.patch(`/api/recipes/${recipeId}/comment/${commentId}`, {
        content: editCommentContent,
      });

      updateComment(recipeId, commentId, editCommentContent);
      setEditingComment(null);
      setEditCommentContent("");
      toast({
        title: "Success",
        description: "Comment updated successfully",
      });
    } catch (error) {
      console.error("Error updating comment:", error);
      toast({
        title: "Error",
        description: "Failed to update comment",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  const handleEditReply = async (commentId: string, replyId: string) => {
    if (!session) {
      toast({
        title: "Please log in",
        description: "You must be logged in to edit comments",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      await axios.patch(
        `/api/recipes/${recipeId}/comment/${commentId}/replies/${replyId}`,
        {
          content: editReplyContent,
        }
      );

      updateReply(recipeId, commentId, replyId, editReplyContent);
      setEditingReply(null);
      setEditReplyContent("");
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

  const handleDeleteComment = async (commentId: string) => {
    if (!session) {
      toast({
        title: "Please log in",
        description: "You must be logged in to delete comments",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      await axios.delete(`/api/recipes/${recipeId}/comment/${commentId}`);

      deleteComment(recipeId, commentId);
      toast({
        title: "Success",
        description: "Comment deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting comment:", error);
      toast({
        title: "Error",
        description: "Failed to delete comment",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteReply = async (commentId: string, replyId: string) => {
    if (!session) {
      toast({
        title: "Please log in",
        description: "You must be logged in to delete comments",
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

  const handleReply = async (parentId: string) => {
    if (!session) {
      toast({
        title: "Please log in",
        description: "You must be logged in to reply to comments",
        variant: "destructive",
      });
      return;
    }

    if (!replyContent.trim()) {
      toast({
        title: "Error",
        description: "Reply cannot be empty",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      const response = await axios.post(
        `/api/recipes/${recipeId}/comment/${parentId}/replies`,
        {
          content: replyContent,
        }
      );

      // Prepare the new reply with full user information
      const newReply = {
        ...response.data,
        user: {
          _id: session.user.id,
          name: session.user.name,
          image: session.user.image,
        },
        parentId,
      };

      // Update the comments state with the new reply
      const updatedComments = comments.map((comment) => {
        if (comment._id === parentId) {
          return {
            ...comment,
            replies: comment.replies
              ? [...comment.replies, newReply]
              : [newReply],
          };
        }
        return comment;
      });

      // Update the state with the modified comments
      setComments(recipeId, updatedComments);

      setReplyingTo(null);
      setReplyContent("");
      toast({
        title: "Success",
        description: "Reply added successfully",
      });
    } catch (error) {
      console.error("Error adding reply:", error);
      toast({
        title: "Error",
        description: "Failed to add reply",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const canEditComment = (commentUserId: string) => {
    return session?.user.id === commentUserId;
  };

  const canEditReply = (replyUserId: string) => {
    return session?.user.id === replyUserId;
  };

  if (isFetching) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg text-main font-semibold">Comments</h3>

        {Array.from({ length: 5 }, (_, index) => (
          <RecipeCommentSkeleton key={index} />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg text-main font-semibold">Comments</h3>

      {/* Comment Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <Textarea
          placeholder={
            session ? "Write a comment..." : "Please log in to leave a comment"
          }
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          disabled={!session || isLoading}
          className="min-h-[100px]"
        />
        <Button
          type="submit"
          disabled={!session || isLoading || !newComment.trim()}
          className="bg-main hover:bg-mainHover rounded-lg"
        >
          Post Comment
        </Button>
      </form>

      {/* Comments List */}
      <div className="space-y-6">
        {comments.length === 0 ? (
          <p className="text-muted-foreground text-center">No comments yet</p>
        ) : (
          comments.map((comment) => (
            <div>
              <div
                key={comment._id}
                className="bg-card rounded-lg border border-main/10 p-4 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  {/* Avatar */}
                  <Avatar className="w-8 h-8 sm:w-10 sm:h-10">
                    <AvatarImage
                      src={comment.user.image || "/default-avatar.png"}
                      alt={comment.user.name || "User"}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "/default-avatar.png";
                        target.width = 32;
                        target.height = 32;
                      }}
                    />
                    <AvatarFallback>
                      <Image
                        src="/default-avatar.png"
                        alt={comment.user.name || "User"}
                        width={32}
                        height={32}
                        priority
                      />
                    </AvatarFallback>
                  </Avatar>

                  {/* User Info and Comment */}
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <div className="max-sm:flex-col flex sm:items-center sm:gap-2 text-sm sm:text-base">
                        <Link
                          href={
                            recipe?.author?._id === actualUser?._id
                              ? "/profile"
                              : `/profile/${recipe?.author?._id}`
                          }
                          className="font-semibold text-main hover:text-mainHover"
                        >
                          {comment.user.name}
                        </Link>
                        <span className="text-xs sm:text-sm text-muted-foreground">
                          {formatDistanceToNow(new Date(comment.createdAt), {
                            addSuffix: true,
                          })}
                        </span>
                      </div>

                      {/* Edit and Delete Buttons */}
                      {canEditComment(comment.user._id) && (
                        <div className="flex gap-2">
                          <Button
                            size="icon"
                            variant="secondary"
                            disabled={isLoading}
                            className="h-6 w-6 sm:h-8 sm:w-8"
                            onClick={() => {
                              setEditingComment(comment._id);
                              setEditCommentContent(comment.content);
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
                                className="h-6 w-6 sm:h-8 sm:w-8"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Delete Comment
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete this comment?
                                  This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  className="bg-destructive hover:bg-destructive/90"
                                  onClick={() =>
                                    handleDeleteComment(comment._id)
                                  }
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      )}
                    </div>

                    {/* Comment Content */}
                    {editingComment === comment._id ? (
                      <div className="mt-2 space-y-2">
                        <Textarea
                          value={editCommentContent}
                          onChange={(e) =>
                            setEditCommentContent(e.target.value)
                          }
                          className="min-h-[60px]"
                        />
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleEditComment(comment._id)}
                            disabled={isLoading}
                            className="bg-main hover:bg-mainHover"
                          >
                            Save
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditingComment(null);
                              setEditCommentContent("");
                            }}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <p className="mt-2 text-sm sm:text-base">
                        {comment.content}
                      </p>
                    )}

                    {/* Reply Button */}
                    {session && !editingComment && (
                      <div className="mt-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-main hover:text-mainHover"
                          onClick={() => {
                            setReplyingTo(comment._id);
                            setReplyContent("");
                          }}
                        >
                          Reply
                        </Button>
                      </div>
                    )}

                    {/* Reply Input */}
                    {replyingTo === comment._id && (
                      <div className="mt-2 space-y-2">
                        <Textarea
                          placeholder="Write a reply..."
                          value={replyContent}
                          onChange={(e) => setReplyContent(e.target.value)}
                          className="min-h-[60px]"
                        />
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleReply(comment._id)}
                            disabled={isLoading || !replyContent.trim()}
                            className="bg-main hover:bg-mainHover"
                          >
                            Reply
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setReplyingTo(null);
                              setReplyContent("");
                            }}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              {/* Render Replies */}
              {comment.replies && comment.replies.length > 0 && (
                <details className="mt-4 pl-4 border-l">
                  <summary className="cursor-pointer text-main hover:text-mainHover">
                    {comment.replies.length}{" "}
                    {comment.replies.length === 1 ? "Reply" : "Replies"}
                  </summary>
                  <div className="mt-2 space-y-2">
                    {comment.replies.map((reply) => (
                      <div
                        key={reply._id}
                        className="flex items-start gap-3 p-4 border border-main/10 rounded"
                      >
                        {/* Avatar */}
                        <Avatar className="w-8 h-8 sm:w-10 sm:h-10">
                          <AvatarImage
                            src={reply.user.image || "/default-avatar.png"}
                            alt={reply.user.name || "User"}
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = "/default-avatar.png";
                              target.width = 32;
                              target.height = 32;
                            }}
                          />
                          <AvatarFallback>
                            <Image
                              src="/default-avatar.png"
                              alt={reply.user.name || "User"}
                              width={32}
                              height={32}
                              priority
                            />
                          </AvatarFallback>
                        </Avatar>

                        {/* Reply Content */}
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            {/* User Name and Reply Time */}
                            <div className="max-sm:flex-col flex sm:items-center sm:gap-2 text-sm sm:text-base">
                              <Link
                                href={
                                  reply?.user?._id === actualUser?._id
                                    ? "/profile"
                                    : `/profile/${reply?.user?._id}`
                                }
                                className="font-semibold text-main hover:text-mainHover"
                              >
                                {reply.user.name}
                              </Link>
                              <span className="text-xs text-muted-foreground">
                                {formatDistanceToNow(
                                  new Date(reply.createdAt),
                                  { addSuffix: true }
                                )}
                              </span>
                            </div>

                            {/* Reply Actions (Edit and Delete Buttons) */}
                            {canEditReply(reply.user._id) && (
                              <div className="flex items-center gap-2">
                                <Button
                                  size="icon"
                                  variant="secondary"
                                  disabled={isLoading}
                                  className="h-6 w-6 sm:h-8 sm:w-8"
                                  onClick={() => {
                                    setEditingReply(reply._id);
                                    setEditReplyContent(reply.content);
                                  }}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button
                                      size="icon"
                                      variant="destructive"
                                      className="h-6 w-6 sm:h-8 sm:w-8"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>
                                        Delete Reply
                                      </AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Are you sure you want to delete this
                                        reply? This action cannot be undone.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>
                                        Cancel
                                      </AlertDialogCancel>
                                      <AlertDialogAction
                                        className="bg-destructive hover:bg-destructive/90"
                                        onClick={() =>
                                          handleDeleteReply(
                                            comment._id,
                                            reply._id
                                          )
                                        }
                                      >
                                        Delete
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            )}
                          </div>

                          {/* Reply Content or Editing Area */}
                          {editingReply === reply._id ? (
                            <div className="mt-2 space-y-2">
                              <Textarea
                                value={editReplyContent}
                                onChange={(e) =>
                                  setEditReplyContent(e.target.value)
                                }
                                className="min-h-[60px]"
                              />
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  onClick={() =>
                                    handleEditReply(comment._id, reply._id)
                                  }
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
                                    setEditReplyContent("");
                                  }}
                                >
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <p className="mt-2 text-sm sm:text-base">
                              {reply.content}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </details>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
