import type { LoaderArgs, LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Link, NavLink, Outlet, useLoaderData } from "@remix-run/react";
import invariant from "tiny-invariant";
import RecipeCard from "~/components/recipe-card";
import { getRecipe } from "~/models/recipes.server";
import { requireUserId } from "~/session.server";


type LoaderData = {
  recipe: NonNullable<Awaited<ReturnType<typeof getRecipe>>>;
};

const commonStyles = `capitalize text-sm font-semibold px-2 py-1 border-b-2 rounded-tl rounded-tr`;
const navLinkStyles = `border-b-transparent bg-gray-400/50 text-gray-800 ${commonStyles}`;
const navLinkActiveStyles = `border-b-transparent text-sky-700 bg-sky-700 text-white ${commonStyles}`;
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
      <div className="rounded border border-gray-400/50 p-2 bg-white flex flex-col gap-2 shadow">
        <RecipeCard recipe={recipe} isLink={false}></RecipeCard>
        <div className="flex gap-2 items-center justify-end">
          <Link to="ingredients/new" className="text-xs text-white bg-sky-600 hover:bg-sky-500 py-1 px-4 rounded">
            Add Ingredient
          </Link>
          <Link to="instructions/new" className="text-xs text-white bg-sky-600 hover:bg-sky-500 py-1 px-4 rounded">
            Add Instruction
          </Link>
        </div>
      </div>
      <hr className="h-px border-b-gray-300 border-b mt-2 mb-1" />
      <div className="flex gap-px border-b border-b-gray-300">
        <NavLink
          to="ingredients"
          className={({ isActive}) => {
            return isActive 
                ? navLinkActiveStyles 
                : navLinkStyles;
          }}
        >
          Ingredients
        </NavLink>
        <NavLink
          to="instructions"
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
