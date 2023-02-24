import type { Recipe } from "@prisma/client";
import type { RecipeInstruction } from "@prisma/client";
import { prisma } from "~/db.server";

export type {RecipeInstruction};

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

export async function updateRecipeInstruction({
  instructionId,
  stepNo,
  description
}: {
  instructionId: string,
  stepNo: number;
  description: string;
}) {
  return prisma.recipeInstruction.update({
    data: {
      stepNo,
      description
    },
    where: {
      id: instructionId
    }
  });
}

export async function deleteRecipeInstruction(instructionId: string) {
  return prisma.recipeInstruction.delete({
    where: {
      id: instructionId
    }
  });
}

export async function getRecipeInstruction({recipeId, instructionId}: {
  recipeId: string,
  instructionId: string,
}) {
  return prisma.recipeInstruction.findFirst({
    where: {
      id: instructionId,
      recipeId
    }
  })
}
