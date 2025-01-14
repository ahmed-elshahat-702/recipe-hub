"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
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
import { Recipe } from "@/lib/types/recipe";
import { Checkbox } from "../ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useRecipeStore } from "@/store/use-recipe-store";

export function RecipeForm({ initialData }: { initialData?: Recipe }) {
  const router = useRouter();
  const [imageUrls, setImageUrls] = useState<string[]>(
    initialData?.images ?? []
  );
  const [actualFiles, setActualFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [categoryInput, setCategoryInput] = useState("");
  const { toast } = useToast();
  const { createRecipe, updateRecipe } = useRecipeStore();

  const MAX_IMAGES = 10;
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB in bytes

  const recipeSchema = z.object({
    title: z.string().min(1, "Title is required"),
    description: z.string().min(1, "Description is required"),
    ingredients: z.array(
      z.object({
        name: z.string().min(1, "Ingredient name is required"),
        amount: z.number().min(0, "Amount must be positive"),
        unit: z.string().min(1, "Unit is required"),
      })
    ),
    instructions: z.array(z.string().min(1, "Instruction is required")),
    cookingTime: z.number().min(1, "Cooking time must be at least 1 minute"),
    servings: z.number().min(1, "Servings must be at least 1"),
    difficulty: z.enum(["easy", "medium", "hard"]),
    categories: z.array(z.string()),
    isAnonymous: z.boolean().default(false),
  });

  const form = useForm<z.infer<typeof recipeSchema>>({
    resolver: zodResolver(recipeSchema),
    defaultValues: initialData || {
      title: "",
      description: "",
      ingredients: [{ name: "", amount: 1, unit: "" }],
      instructions: [""],
      cookingTime: 1,
      servings: 1,
      difficulty: "medium",
      categories: [],
      isAnonymous: false,
    },
  });

  useEffect(() => {
    if (!initialData) return;

    const subscription = form.watch((value) => {
      const hasFieldChanges = Object.keys(value).some((key) => {
        if (
          key === "ingredients" ||
          key === "instructions" ||
          key === "categories"
        ) {
          return (
            JSON.stringify(value[key as keyof typeof value]) !==
            JSON.stringify(initialData[key as keyof typeof initialData])
          );
        }
        return (
          value[key as keyof typeof value] !==
          initialData[key as keyof typeof initialData]
        );
      });

      setHasChanges(hasFieldChanges || !!actualFiles.length);
    });

    return () => subscription.unsubscribe();
  }, [form.watch, initialData, actualFiles]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      const files = Array.from(e.target.files);

      // Check total number of images
      if (imageUrls.length + previewUrls.length + files.length > MAX_IMAGES) {
        toast({
          title: "Too many images",
          description: `You can only upload up to ${MAX_IMAGES} images`,
          variant: "destructive",
        });
        return;
      }

      // Validate file sizes
      const invalidFiles = files.filter((file) => file.size > MAX_FILE_SIZE);
      if (invalidFiles.length > 0) {
        toast({
          title: "Files too large",
          description: "Each image must be less than 10MB",
          variant: "destructive",
        });
        return;
      }

      const newUrls = files.map((file) => URL.createObjectURL(file));
      setPreviewUrls((prev) => [...prev, ...newUrls]);
      setActualFiles((prev) => [...prev, ...files]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    const imageFiles = files.filter((file) => file.type.startsWith("image/"));

    // Check total number of images
    if (
      imageUrls.length + previewUrls.length + imageFiles.length >
      MAX_IMAGES
    ) {
      toast({
        title: "Too many images",
        description: `You can only upload up to ${MAX_IMAGES} images`,
        variant: "destructive",
      });
      return;
    }

    // Validate file sizes
    const invalidFiles = imageFiles.filter((file) => file.size > MAX_FILE_SIZE);
    if (invalidFiles.length > 0) {
      toast({
        title: "Files too large",
        description: "Each image must be less than 10MB",
        variant: "destructive",
      });
      return;
    }

    if (imageFiles.length > 0) {
      const newUrls = imageFiles.map((file) => URL.createObjectURL(file));
      setPreviewUrls((prev) => [...prev, ...newUrls]);
      setActualFiles((prev) => [...prev, ...imageFiles]);
    } else {
      toast({
        title: "Invalid file type",
        description: "Please upload image files only",
        variant: "destructive",
      });
    }
  };

  const removeImage = (index: number, isExisting: boolean) => {
    if (isExisting) {
      setImageUrls((prev) => prev.filter((_, i) => i !== index));
    } else {
      const previewIndex = index - imageUrls.length;
      setPreviewUrls((prev) => prev.filter((_, i) => i !== previewIndex));
      setActualFiles((prev) => prev.filter((_, i) => i !== previewIndex));
    }
  };

  const handleCancel = () => {
    if (hasChanges) {
      if (confirm("Are you sure you want to discard your changes?")) {
        router.back();
      }
    } else {
      router.back();
    }
  };

  const onSubmit = async (data: z.infer<typeof recipeSchema>) => {
    try {
      setIsSubmitting(true);

      // Start with existing image URLs
      const uploadedImageUrls = [...imageUrls];

      // Upload new images
      if (actualFiles.length > 0) {
        toast({
          title: "Uploading images",
          description: "Please wait while we upload your images.",
        });

        const uploadPromises = actualFiles.map(async (file) => {
          const formData = new FormData();
          formData.append("file", file);

          return await axios.post("/api/upload", formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });
        });

        const responses = await Promise.all(uploadPromises);
        const newImageUrls = responses.map((res) => res.data.secure_url);
        uploadedImageUrls.push(...newImageUrls);
      }

      const recipeData = { ...data, images: uploadedImageUrls };

      if (initialData) {
        await updateRecipe(initialData._id, recipeData);
        toast({
          title: "Success",
          description: "Recipe updated successfully!",
        });
      } else {
        await createRecipe(recipeData);
        toast({
          title: "Success",
          description: "Recipe submitted successfully!",
        });
      }

      router.push("/recipes");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit recipe. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const recommendedUnits = [
    "g",
    "kg",
    "ml",
    "L",
    "cup",
    "tbsp",
    "tsp",
    "oz",
    "lb",
    "piece",
    "slice",
    "pinch",
  ];

  const suggestedCategories = [
    "Breakfast",
    "Lunch",
    "Dinner",
    "Dessert",
    "Appetizer",
    "Snack",
    "Vegetarian",
    "Vegan",
    "Gluten-free",
    "Dairy-free",
    "Healthy",
    "Quick & Easy",
    "Italian",
    "Mexican",
    "Asian",
    "Mediterranean",
  ];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10">
        <div>
          <label className="block text-sm font-medium">Recipe Images</label>
          <div
            className={`mt-1 flex justify-center rounded-lg border border-dashed border-main px-6 py-10 ${
              isDragging ? "border-foreground bg-foreground/10" : ""
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="w-full">
              {imageUrls.length > 0 || previewUrls.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {imageUrls.map((url, index) => (
                    <div key={`existing-${index}`} className="relative">
                      <Image
                        src={url}
                        alt={`Existing image ${index + 1}`}
                        className="h-64 w-full rounded-lg object-cover"
                        width={640}
                        height={480}
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index, true)}
                        className="absolute right-2 top-2 rounded-full bg-white p-1 text-main shadow hover:text-mainHover"
                      >
                        <Minus className="h-5 w-5" />
                      </button>
                    </div>
                  ))}
                  {previewUrls.map((url, index) => (
                    <div key={`preview-${index}`} className="relative">
                      <Image
                        src={url}
                        alt={`New image ${index + 1}`}
                        className="h-64 w-full rounded-lg object-cover"
                        width={640}
                        height={480}
                      />
                      <button
                        type="button"
                        onClick={() =>
                          removeImage(imageUrls.length + index, false)
                        }
                        className="absolute right-2 top-2 rounded-full bg-white p-1 text-main shadow hover:text-mainHover"
                      >
                        <Minus className="h-5 w-5" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : null}
              <div
                className={`text-center ${
                  imageUrls.length > 0 || previewUrls.length > 0 ? "mt-4" : ""
                }`}
              >
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <div className="mt-4 flex justify-center text-sm text-gray-600">
                  <label
                    className={`relative cursor-pointer rounded-md bg-white font-medium ${
                      imageUrls.length + previewUrls.length >= MAX_IMAGES
                        ? "opacity-50 cursor-not-allowed"
                        : "text-main hover:text-mainHover"
                    }`}
                  >
                    <span
                      className={`${
                        imageUrls.length + previewUrls.length >= MAX_IMAGES
                          ? "bg-gray-400"
                          : "bg-main hover:bg-mainHover"
                      } text-white py-1 px-2 rounded-md transition-colors duration-200 focus:outline-none`}
                    >
                      Upload images
                    </span>
                    <input
                      type="file"
                      className="sr-only"
                      accept="image/*"
                      onChange={handleImageChange}
                      multiple
                      disabled={
                        imageUrls.length + previewUrls.length >= MAX_IMAGES
                      }
                    />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-main/90 mt-2">
                  Multiple images supported (max {MAX_IMAGES})
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  PNG, JPG, GIF up to 10MB each
                </p>
              </div>
            </div>
          </div>
        </div>

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

        <div>
          <label className="block text-lg font-semibold">Ingredients</label>
          <div className="space-y-4 mt-4">
            {form.watch("ingredients")?.map((_, index) => (
              <div key={index} className="flex items-center gap-4">
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
                    <FormItem className="w-32">
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Unit" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {recommendedUnits.map((unit) => (
                            <SelectItem key={unit} value={unit}>
                              {unit}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    const ingredients = form.getValues("ingredients");
                    ingredients.splice(index, 1);
                    form.setValue("ingredients", ingredients);
                  }}
                  className="px-3"
                >
                  Remove
                </Button>
              </div>
            ))}
            <Button
              type="button"
              size="sm"
              onClick={() => {
                const ingredients = form.getValues("ingredients") || [];
                form.setValue("ingredients", [
                  ...ingredients,
                  { name: "", amount: 0, unit: "" },
                ]);
              }}
              className="mt-2"
            >
              Add Ingredient
            </Button>
          </div>
        </div>

        <div>
          <label className="block text-lg font-semibold">Instructions</label>
          <div className="space-y-4 mt-4">
            {form.watch("instructions")?.map((_, index) => (
              <div key={index} className="flex items-center gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-main text-white flex items-center justify-center font-medium">
                  {index + 1}
                </div>
                <FormField
                  control={form.control}
                  name={`instructions.${index}`}
                  render={({ field }) => (
                    <FormItem className="flex-grow">
                      <FormControl>
                        <Input placeholder={`Step `} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    const instructions = form.getValues("instructions");
                    instructions.splice(index, 1);
                    form.setValue("instructions", instructions);
                  }}
                  className="px-3"
                >
                  Remove
                </Button>
              </div>
            ))}
            <Button
              type="button"
              size="sm"
              onClick={() => {
                const instructions = form.getValues("instructions") || [];
                form.setValue("instructions", [...instructions, ""]);
              }}
              className="mt-2"
            >
              Add Instruction
            </Button>
          </div>
        </div>

        <div className="w-full flex items-center gap-2">
          <FormField
            control={form.control}
            name="cookingTime"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel className="text-lg font-semibold">
                  Cooking Time (minutes)
                </FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="1"
                    {...field}
                    onChange={(e) =>
                      field.onChange(parseInt(e.target.value, 10) || "")
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="servings"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel className="text-lg font-semibold">
                  Servings
                </FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="1"
                    {...field}
                    onChange={(e) =>
                      field.onChange(parseInt(e.target.value, 10) || "")
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

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

        <FormField
          control={form.control}
          name="categories"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Categories (Optional)</FormLabel>
              <div className="space-y-2">
                <div className="flex flex-wrap gap-2">
                  {field.value?.map((category, idx) => (
                    <div
                      key={idx}
                      className="bg-main/10 text-main px-2 py-1 rounded-md flex items-center gap-1"
                    >
                      {category}
                      <button
                        type="button"
                        onClick={() => {
                          const newCategories = [...field.value];
                          newCategories.splice(idx, 1);
                          field.onChange(newCategories);
                        }}
                        className="text-main hover:text-red-500"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
                <div className="relative">
                  <Input
                    placeholder="Type to add categories"
                    value={categoryInput}
                    onChange={(e) => setCategoryInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === ",") {
                        e.preventDefault();
                        const value = categoryInput.trim();
                        if (value && !field.value.includes(value)) {
                          field.onChange([...field.value, value]);
                          setCategoryInput("");
                        }
                      }
                    }}
                  />
                  {categoryInput && (
                    <div className="absolute top-full left-0 right-0 bg-white shadow-lg rounded-md mt-1 z-10">
                      {suggestedCategories
                        .filter(
                          (cat) =>
                            !field.value.includes(cat) &&
                            cat
                              .toLowerCase()
                              .includes(categoryInput.toLowerCase())
                        )
                        .slice(0, 5)
                        .map((suggestion) => (
                          <div
                            key={suggestion}
                            className="px-3 py-2 hover:bg-gray-100 cursor-pointer bg-background"
                            onClick={() => {
                              if (!field.value.includes(suggestion)) {
                                field.onChange([...field.value, suggestion]);
                                setCategoryInput("");
                              }
                            }}
                          >
                            {suggestion}
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              </div>
              <FormDescription>
                Press Enter or comma to add a category
              </FormDescription>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="isAnonymous"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 border border-dashed border-main rounded p-4">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Share Anonymously</FormLabel>
                <FormDescription>
                  Your recipe will be displayed as anonymous to other users, but
                  you'll still be able to edit, delete, and view it in your
                  profile
                </FormDescription>
              </div>
            </FormItem>
          )}
        />

        <div className="flex gap-4">
          <Button
            type="button"
            variant="outline"
            disabled={isSubmitting}
            className="w-full"
            onClick={handleCancel}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting
              ? "Saving..."
              : initialData
              ? "Update Recipe"
              : "Create Recipe"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
