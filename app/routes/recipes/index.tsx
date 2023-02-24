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
        <Link to="new" className="text-xs text-white bg-sky-600 hover:bg-sky-500 py-1 px-4 rounded">
          + New Recipe
        </Link>
      </div>
      <div className="flex flex-col gap-4 pb-4">
        {recipes.map((recipe) => {
          return (
            <div
              key={recipe.id}
              className="rounded border border-gray-400/50 p-2 bg-white flex flex-col gap-2 shadow"
            >
              <RecipeCard to={`${recipe.id}/details`} recipe={recipe} isLink></RecipeCard>
            </div>
          );
        })}
      </div>
    </div>
  );
}
