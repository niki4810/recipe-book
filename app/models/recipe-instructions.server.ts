import type { Recipe } from "@prisma/client";

import { prisma } from "~/db.server";

export async function getRecipeInstructions({
  recipeId,
}: {
  recipeId: Recipe["id"];
}) {
  return prisma.recipeInstruction.findMany({
    where: { recipeId },
  });
}

export async function createRecipeInstruction({
  stepNo,
  description,
  recipeId,
}: {
  stepNo: number;
  description: string;
  recipeId: string;
}) {
  return prisma.recipeInstruction.create({
    data: {
      stepNo,
      description,
      recipeId,
    },
  });
}
