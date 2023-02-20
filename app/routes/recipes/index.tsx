import { json } from "@remix-run/node";
import type { LoaderFunction, LoaderArgs } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { getRecipesList } from "~/models/recipes.server";
import { requireUserId } from "~/session.server";
import invariant from "tiny-invariant";
import RecipeCard from "~/components/recipe-card";

type LoaderData = {
  recipes: Awaited<ReturnType<typeof getRecipesList>>;
};
export const loader: LoaderFunction = async ({ request }: LoaderArgs) => {
  const userId = await requireUserId(request);
  const recipes = await getRecipesList({ userId });
  invariant(recipes, "Recipes not found");
  return json<LoaderData>({ recipes });
};

export default function RecipesIndexPage() {
  const { recipes } = useLoaderData() as unknown as LoaderData;
  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <Link to="new" className="font-semibold text-sky-700">
          + New Recipe
        </Link>
      </div>
      <div className="m-auto flex flex-col gap-4 pb-4">
        {recipes.map((recipe) => {
          return (
            <div
              key={recipe.id}
              className="border--gray-800 shadow-sm max-w-120 rounded border p-2 bg-white"
            >
              <RecipeCard recipe={recipe} isLink></RecipeCard>
            </div>
          );
        })}
      </div>
    </div>
  );
}
