
import type { Recipe } from "@prisma/client";
import { Link } from "@remix-run/react";

export default function RecipeCard({recipe}: {recipe: Pick<Recipe, "id" | "description" | "createdAt" | "durationInMins" | "name" | "imageUrl">}) {
  return (
    <div className="flex items-center gap-2">
      <img
        src={recipe.imageUrl}
        alt={recipe.name}
        className="h-16 w-16 rounded-full
              "
      />
      <div className="flex flex-1 flex-col px-2">
        <Link to={recipe.id} className="text-md font-semibold text-sky-700">
          {recipe.name}
        </Link>
        <div className="my-1 flex items-center gap-1">
          <span className="flex-1 text-xs font-bold text-gray-600">
            Duration {recipe.durationInMins} mins
          </span>
          <span className="text-xs font-bold text-gray-500">
            {new Date(recipe.createdAt).toDateString()}
          </span>
        </div>
        <p className="mt-1 self-start text-sm text-gray-600">
          {recipe.description}
        </p>
      </div>
    </div>
  );
}
