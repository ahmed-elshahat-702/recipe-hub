export interface Author {
  _id: string;
  name: string;
  image?: string;
}

export interface Ingredient {
  name: string;
  amount: number;
  unit: string;
}

export interface Recipe {
  _id: string;
  title: string;
  description: string;
  ingredients: Ingredient[];
  instructions: string[];
  image?: string;
  imageUrl?: string;
  images?: string[];
  author?: Author;
  isAnonymous?: boolean;
  createdAt: string;
  updatedAt: string;
  cookingTime?: number;
  servings?: number;
  difficulty?: "easy" | "medium" | "hard";
  cuisine?: string;
  categories?: string[];
}
