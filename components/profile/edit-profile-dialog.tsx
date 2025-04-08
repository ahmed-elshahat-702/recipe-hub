"use client";
import React from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { ArrowRight, Pencil } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { useProfile } from "@/hooks/use-profile";
import { useSession } from "next-auth/react";
import axios from "axios";
import { Checkbox } from "@/components/ui/checkbox";

const formSchema = z.object({
  image: z.string().url("Please enter a valid URL for the image.").optional(),
  name: z.string().min(2, "Name must be at least 2 characters.").optional(),
  bio: z.string().max(500, "Bio must not exceed 500 characters.").optional(),
  useGoogleImage: z.boolean().optional(),
});

export function EditProfileDialog() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [actualFile, setActualFile] = useState<File | null>(null);
  const { profile, updateProfile } = useProfile();
  const { data: session } = useSession();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      bio: "",
      image: "",
      useGoogleImage: false,
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        name: profile.name,
        bio: profile.bio,
        image: profile.image,
        useGoogleImage: false,
      });
    }
  }, [open, profile, form]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      setActualFile(file);
      form.setValue("useGoogleImage", false);
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    try {
      let imageUrl = profile.image;
      if (values.useGoogleImage && session?.user?.image) {
        imageUrl = session.user.image;
      } else if (actualFile) {
        const formData = new FormData();
        formData.append("file", actualFile);

        const response = await axios.post("/api/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        imageUrl = response.data.secure_url || 
        (response.data.result && response.data.result.secure_url) ||
        response.data.url ||
        (response.data.result && response.data.result.url);
      }

      const profileData = { ...values, image: imageUrl };
      updateProfile(profileData);
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
      setOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: `Something went wrong while updating your profile. ${error}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(newOpen) => {
        setOpen(newOpen);
        if (!newOpen) {
          setActualFile(null);
        }
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <Pencil className="w-4 h-4 text-main" />
          <span className="hidden sm:block"> Edit Profile</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="w-11/12 sm:max-w-[425px]">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <DialogHeader>
              <DialogTitle>Edit Profile</DialogTitle>
              <DialogDescription>
                Make changes to your profile here. Click save when you&apos;re
                done.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <FormField
                control={form.control}
                name="image"
                render={() => (
                  <FormItem>
                    <FormLabel>Profile Image</FormLabel>
                    <FormControl>
                      <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-4">
                          <Avatar>
                            <AvatarImage src={profile.image} alt="Current" />
                            <AvatarFallback>CN</AvatarFallback>
                          </Avatar>
                          <ArrowRight className="w-5 h-5" />
                          <Avatar>
                            <AvatarImage
                              src={
                                actualFile
                                  ? URL.createObjectURL(actualFile)
                                  : form.watch("useGoogleImage") &&
                                    session?.user?.image
                                  ? session.user.image
                                  : profile.image ?? undefined
                              }
                              alt={profile.name || "Profile"}
                            />
                            <AvatarFallback>
                              {profile.name?.[0]?.toUpperCase() || "U"}
                            </AvatarFallback>
                          </Avatar>
                        </div>
                        <Input
                          type="file"
                          accept="image/*"
                          className="file:mr-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-main file:text-white hover:file:bg-main/80"
                          onChange={handleImageChange}
                          disabled={form.watch("useGoogleImage")}
                        />
                        {session?.user?.image && (
                          <FormField
                            control={form.control}
                            name="useGoogleImage"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value}
                                    onCheckedChange={(checked) => {
                                      field.onChange(checked);
                                      if (checked) {
                                        setActualFile(null);
                                      }
                                    }}
                                  />
                                </FormControl>
                                <FormLabel>Use Google profile image</FormLabel>
                              </FormItem>
                            )}
                          />
                        )}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bio</FormLabel>
                    <FormControl>
                      <Textarea {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Saving..." : "Save changes"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
