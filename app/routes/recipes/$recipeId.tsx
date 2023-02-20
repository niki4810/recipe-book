import type { LoaderArgs, LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { NavLink, Outlet, useLoaderData } from "@remix-run/react";
import invariant from "tiny-invariant";
import RecipeCard from "~/components/recipe-card";
import { getRecipe } from "~/models/recipes.server";
import { requireUserId } from "~/session.server";


type LoaderData = {
  recipe: NonNullable<Awaited<ReturnType<typeof getRecipe>>>;
};

const navLinkActiveStyles = "text-sky-700 border-b-4 border-b-sky-700 capitalize text-sm font-semibold p-2";
const navLinkStyles = "border-b-4 border-b-transparent capitalize text-sm font-semibold p-2"
export const loader: LoaderFunction = async ({
  request,
  params,
}: LoaderArgs) => {
  const { recipeId } = params;
  invariant(recipeId, "Recipe Id is required");
  const userId = await requireUserId(request);
  const recipe = await getRecipe({ id: recipeId, userId });
  invariant(recipe, `Recipe not found: ${recipeId}`);
  return json<LoaderData>({ recipe });
};

export default function RecipeDetailsPage() {
  const { recipe } = useLoaderData() as unknown as LoaderData;
  return (
    <div className="flex flex-col gap-2">
      <div className="shadow-sm max-w-120 rounded border border--gray-800 p-2 bg-white">
        <RecipeCard recipe={recipe} isLink={false}></RecipeCard>
      </div>
      <hr className="my-2 bg-gray-500" />
      <div className="flex gap-3">
        <NavLink
          to="."
          end
          className={({ isActive }) => {
            return isActive 
                ? navLinkActiveStyles 
                : navLinkStyles;
          }}
        >
          Ingredients
        </NavLink>
        <NavLink
          to="instructions"
          end
          className={({ isActive }) => {
            return isActive 
                ? navLinkActiveStyles 
                : navLinkStyles;
          }}
        >
          Instructions
        </NavLink>
      </div>
      <div>
        <Outlet/>
      </div>
    </div>
  );
}
