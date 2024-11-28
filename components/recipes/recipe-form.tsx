"use client";

import { useState } from "react";
import React from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray, Control } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Image from "next/image";
import { Minus, Upload } from "lucide-react";

export function RecipeForm() {
  const router = useRouter();
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [actualFile, setActualFile] = useState<File | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const recipeSchema = z.object({
    title: z.string().min(2, "Title must be at least 2 characters"),
    description: z
      .string()
      .min(10, "Description must be at least 10 characters"),
    ingredients: z
      .array(
        z.object({
          name: z
            .string()
            .min(2, "Ingredient name must be at least 2 characters"),
          amount: z.number().min(0, "Amount must be a positive number"),
          unit: z.string().min(1, "Unit is required"),
        })
      )
      .min(1, "At least one ingredient is required"),
    instructions: z
      .array(z.string().min(5, "Instruction must be at least 5 characters"))
      .min(1, "At least one instruction is required"),
    cookingTime: z.number().min(1, "Cooking time must be at least 1 minute"),
    servings: z.number().min(1, "Servings must be at least 1"),
    difficulty: z.enum(["easy", "medium", "hard"]),
    categories: z.array(z.string()).min(1, "At least one category is required"),
  });

  const form = useForm<z.infer<typeof recipeSchema>>({
    resolver: zodResolver(recipeSchema),
    defaultValues: {
      title: "",
      description: "",
      ingredients: [{ name: "", amount: 0, unit: "" }],
      instructions: [""],
      cookingTime: 0,
      servings: 1,
      difficulty: "medium",
      categories: [],
    },
  });

  const {
    fields: ingredientFields,
    append: appendIngredient,
    remove: removeIngredient,
  } = useFieldArray({ name: "ingredients" });

  const {
    fields: instructionFields,
    append: appendInstruction,
    remove: removeInstruction,
  } = useFieldArray({ name: "instructions" });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      setImageUrl(URL.createObjectURL(file));
      setActualFile(file);
    }
  };

  async function onSubmit(data: z.infer<typeof recipeSchema>) {
    if (!actualFile) return;

    setIsSubmitting(true);
    try {
      // Upload image to Cloudinary
      const formData = new FormData();
      // Add a null check to ensure image is defined before appending
      if (actualFile) {
        formData.append("file", actualFile);
      }
      formData.append(
        "upload_preset",
        process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || ""
      );

      const imgResponse = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      const imageData = await imgResponse.json();
      const imageUrl = imageData.secure_url;

      const recipeData = { ...data, imageUrl };
      await axios.post("/api/recipes", recipeData);
      router.push(`/recipes`);
    } catch (error) {
      console.error("Error creating recipe:", error);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10">
        {/* Image Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Recipe Image
          </label>
          <div className="mt-1 flex justify-center rounded-lg border border-dashed border-gray-300 px-6 py-10">
            {imageUrl ? (
              <div className="relative">
                <Image
                  src={imageUrl}
                  alt="Preview"
                  className="h-64 w-full rounded-lg object-cover"
                  width={640}
                  height={480}
                />
                <button
                  type="button"
                  onClick={() => {
                    setImageUrl(null);
                    setActualFile(null);
                  }}
                  className="absolute right-2 top-2 rounded-full bg-white p-1 text-gray-500 shadow-sm hover:text-gray-700"
                >
                  <Minus className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <div className="text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <div className="mt-4 flex text-sm text-gray-600">
                  <label className="relative cursor-pointer rounded-md bg-white font-medium text-orange-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-orange-500 focus-within:ring-offset-2 hover:text-orange-400">
                    <span>Upload a file</span>
                    <input
                      type="file"
                      className="sr-only"
                      accept="image/*"
                      onChange={handleImageChange}
                      required
                    />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500">
                  PNG, JPG, GIF up to 10MB
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Recipe Title */}
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-lg font-semibold">Title</FormLabel>
              <FormControl>
                <Input placeholder="Enter recipe title" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Recipe Description */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-lg font-semibold">
                Description
              </FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Briefly describe your recipe"
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Ingredients Section */}
        <div>
          <label className="block text-lg font-semibold">Ingredients</label>
          <div className="space-y-4 mt-4">
            {ingredientFields.map((field, index) => (
              <div key={field.id} className="flex items-center gap-4">
                <FormField
                  control={form.control}
                  name={`ingredients.${index}.name`}
                  render={({ field }) => (
                    <FormItem className="flex-grow">
                      <FormControl>
                        <Input placeholder="Ingredient name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`ingredients.${index}.amount`}
                  render={({ field }) => (
                    <FormItem className="w-24">
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Amount"
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseFloat(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`ingredients.${index}.unit`}
                  render={({ field }) => (
                    <FormItem className="w-24">
                      <FormControl>
                        <Input placeholder="Unit" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => removeIngredient(index)}
                  className="px-3"
                >
                  Remove
                </Button>
              </div>
            ))}
            <Button
              type="button"
              size="sm"
              onClick={() =>
                appendIngredient({ name: "", amount: 0, unit: "" })
              }
              className="mt-2"
            >
              Add Ingredient
            </Button>
          </div>
        </div>

        {/* Instructions Section */}
        <div>
          <label className="block text-lg font-semibold">Instructions</label>
          <div className="space-y-4 mt-4">
            {instructionFields.map((field, index) => (
              <div key={field.id} className="flex items-center gap-4">
                <FormField
                  control={form.control}
                  name={`instructions.${index}`}
                  render={({ field }) => (
                    <FormItem className="flex-grow">
                      <FormControl>
                        <Input placeholder={`Step ${index + 1}`} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => removeInstruction(index)}
                  className="px-3"
                >
                  Remove
                </Button>
              </div>
            ))}
            <Button
              type="button"
              size="sm"
              onClick={() => appendInstruction("")}
              className="mt-2"
            >
              Add Instruction
            </Button>
          </div>
        </div>

        {/* Cooking Time */}
        <FormField
          control={form.control}
          name="cookingTime"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-lg font-semibold">
                Cooking Time (minutes)
              </FormLabel>
              <FormControl>
                <Input
                  type="number"
                  {...field}
                  onChange={(e) => field.onChange(parseInt(e.target.value, 10))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Servings */}
        <FormField
          control={form.control}
          name="servings"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-lg font-semibold">Servings</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  {...field}
                  onChange={(e) => field.onChange(parseInt(e.target.value, 10))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Difficulty */}
        <FormField
          control={form.control}
          name="difficulty"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-lg font-semibold">
                Difficulty
              </FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select difficulty" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Categories */}
        <FormField
          control={form.control}
          name="categories"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-lg font-semibold">
                Categories
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="Separate categories with commas"
                  {...field}
                  onChange={(e) =>
                    field.onChange(
                      e.target.value.split(",").map((cat) => cat.trim())
                    )
                  }
                />
              </FormControl>
              <FormDescription>
                Examples: Breakfast, Vegetarian, Quick
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Submit Button */}
        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? "Creating..." : "Create Recipe"}
        </Button>
      </form>
    </Form>
  );
}
