import type { Recipe } from "@prisma/client";

import { prisma } from "~/db.server";

export function getRecipeInstructions({ recipeId }: { recipeId: Recipe["id"] }) {
  console.log(recipeId);
  return prisma.recipeInstruction.findMany({
    where: {recipeId}
  });
}
