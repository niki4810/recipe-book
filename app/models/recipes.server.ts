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

export function getRecipe({
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
