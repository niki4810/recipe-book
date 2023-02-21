import type { Recipe } from "@prisma/client";

import { prisma } from "~/db.server";

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
