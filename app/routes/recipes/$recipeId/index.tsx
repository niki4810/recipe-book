import type { LoaderArgs, LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import invariant from "tiny-invariant";
import { getRecipeIngredients } from "~/models/recipe-ingredients.server";
import { requireUserId } from "~/session.server";

type LoaderData = {
  ingredients: Awaited<ReturnType<typeof getRecipeIngredients>>;
};

export const loader: LoaderFunction = async ({
  params,
  request,
}: LoaderArgs) => {
  await requireUserId(request);
  const { recipeId } = params;
  invariant(recipeId, "Recipe Id is required");
  const ingredients = await getRecipeIngredients({ recipeId });
  invariant(ingredients, `Recipe Ingredients not found: ${recipeId}`);
  return json<LoaderData>({ ingredients });
};

export default function RecipeIngredientsPage() {
  const { ingredients } = useLoaderData() as unknown as LoaderData;
  return (
    <ul className="list-disc px-4 text-sm bg-white pl-6 mb-4 pt-2">
      {ingredients.map((ingredient) => {
        return (
          <li key={ingredient.id}>
            <div className="flex items-center gap-2 p-1 text-sm">
              <span className="capitalize text-gray-800">{ingredient.name}</span>
              <span className="text-xs text-gray-500 capitalize">
                ({ingredient.quantity} {ingredient.unit})
              </span>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
