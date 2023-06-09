import type { Recipe, User } from "@prisma/client";

import { prisma } from "~/db.server";

export async function getRecipesList({ userId }: { userId: User["id"] }) {
  return prisma.recipe.findMany({
    where: { userId },
    select: {
      id: true,
      name: true,
      description: true,
      imageUrl: true,
      createdAt: true,
      durationInMins: true,
    },
    orderBy: { updatedAt: "desc" },
  });
}

export async function getRecipe({
  id,
  userId,
}: Pick<Recipe, "id"> & {
  userId: User["id"];
}) {
  return prisma.recipe.findFirst({
    select: {
      id: true,
      name: true,
      description: true,
      imageUrl: true,
      createdAt: true,
      durationInMins: true,
    },
    where: { id, userId },
  });
}

export async function createRecipe(
  recipe: Pick<Recipe, "name" | "description" | "imageUrl" | "durationInMins">,
  userId: User["id"]
  ) {
  return prisma.recipe.create({
    data: {
      name: recipe.name,
      description: recipe.description,
      imageUrl: recipe.imageUrl,
      durationInMins: recipe.durationInMins,
      userId: userId
    }
  })
}

export async function updateRecipe(
  recipe: Pick<Recipe, "name" | "description" | "imageUrl" | "durationInMins">,
  recipeId: string
  ) {
  return prisma.recipe.update({
    data: {
      name: recipe.name,
      description: recipe.description,
      imageUrl: recipe.imageUrl,
      durationInMins: recipe.durationInMins
    },
    where: {
      id: recipeId
    }
  });
}

export async function deleteRecipe(recipeId: string) {
  await prisma.recipeIngredient.deleteMany({
    where: {recipeId}
  });

  await prisma.recipeInstruction.deleteMany({
    where: {recipeId}
  });

  return await prisma.recipe.delete({
    where: {id: recipeId}
  });
}