import type { Recipe } from "@prisma/client";

import { prisma } from "~/db.server";

export function getRecipeIngredients({ recipeId }: { recipeId: Recipe["id"] }) {
  console.log(recipeId);
  return prisma.recipeIngredient.findMany({
    where: {recipeId}
  });
}
