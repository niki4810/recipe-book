import type { Recipe } from "@prisma/client";

import { prisma } from "~/db.server";
import type { RecipeIngredient } from "@prisma/client";

export type {RecipeIngredient};

export async function getRecipeIngredients({
  recipeId,
}: {
  recipeId: Recipe["id"];
}) {
  return prisma.recipeIngredient.findMany({
    where: { recipeId },
  });
}

export async function createRecipeIngredient({
  name,
  quantity,
  unit,
  recipeId,
}: {
  name: string;
  quantity: string;
  unit: string;
  recipeId: string;
}) {
  return prisma.recipeIngredient.create({
    data: {
      name,
      quantity,
      unit,
      recipeId,
    },
  });
}

export async function getRecipeIngredient({
  recipeId, ingredientId 
}: {recipeId: string, ingredientId: string }) {
  return prisma.recipeIngredient.findFirst({
    where: {
      id: ingredientId,
      recipeId: recipeId
    }
  });
}

export async function updateRecipeIngredient({
  ingredientId,
  name,
  quantity,
  unit,
}: {
  ingredientId: string,
  name: string;
  quantity: string;
  unit: string;
}) {
  return prisma.recipeIngredient.update({
    data: {
      name,
      quantity,
      unit
    },
    where: {
      id: ingredientId
    }
  });
}

export async function deleteRecipeIngredient(ingredientId: string) {
  return prisma.recipeIngredient.delete({
    where: {
      id: ingredientId
    }
  });
}
