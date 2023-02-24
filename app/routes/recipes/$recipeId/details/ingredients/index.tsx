import type { LoaderArgs, LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Link, useCatch, useLoaderData } from "@remix-run/react";
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
  if (!ingredients || ingredients.length === 0) {
    throw new Response("No Ingredients have been added to this recipe yet", {
      status: 404,
    });
  }
  return json<LoaderData>({ ingredients });
};

export default function RecipeIngredientsPage() {
  const { ingredients } = useLoaderData() as unknown as LoaderData;
  return (
    <div className="relative flex flex-col gap-4">
      <Link
        to="new"
        className={`
        absolute
          right-2
          rounded
         px-2 
         py-1
         text-xs 
         font-semibold  
         text-sky-600 
         transition-colors
         delay-300
         hover:bg-sky-600 
         hover:text-white
        `}
      >
        Add Ingredient
      </Link>
      <div className="mb-4 mt-8 flex flex-col border border-gray-400/50 bg-white pr-4 pl-6 pt-2 pb-2 text-sm shadow">
        <ul className="list-disc">
          {ingredients.map((ingredient) => {
            return (
              <li key={ingredient.id}>
                <div className="flex items-center gap-2 p-1 text-sm">
                  <span className="capitalize text-gray-800">
                    {ingredient.name}
                  </span>
                  <span className="text-xs capitalize text-gray-500">
                    ({ingredient.quantity} {ingredient.unit})
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

// Expected Errors
export function CatchBoundary() {
  const caught = useCatch();
  if (caught.status === 404) {
    return (
      <div className="flex flex-col gap-1">
        <div className="text-sm text-gray-800">{caught.data}.</div>
        <Link
          to="new"
          className={`
            rounded
            px-0
            py-1
            text-xs 
            font-semibold
            text-sky-600 
            transition-colors  
            delay-300
            hover:bg-sky-600 
            hover:text-white
            `}
        >
          Add Ingredient
        </Link>
      </div>
    );
  }
  throw new Error(`Unsupported thrown response status code: ${caught.status}`);
}

// UnExpected Errors
export function ErrorBoundary({ error }: { error: Error }) {
  if (error instanceof Error) {
    return <div className="text-sm text-red-600">{error.message}</div>;
  }
  return (
    <div className="text-sm text-red-600">Oh no, something went wrong!</div>
  );
}
