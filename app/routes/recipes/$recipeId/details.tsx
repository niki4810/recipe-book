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
const navLinkActiveStyles = `border-b-transparent bg-sky-600 text-white ${commonStyles}`;
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
    <div className="flex flex-col gap-4">
      <div className="rounded border border-gray-400/50 py-4 px-2 bg-white flex flex-col gap-2 shadow relative">
        <RecipeCard recipe={recipe} isLink={false}></RecipeCard>
          <Link to={`../${recipe.id}/edit`} className={`
            rounded
            px-2
            py-1
            text-xs 
            font-semibold
            text-sky-600 
            hover:text-white  
            hover:bg-sky-600 
            absolute
            right-2
            delay-300 
            transition-colors
        `}>
            Edit Recipe
          </Link>
      </div>
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
