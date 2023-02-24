import type { LoaderArgs, LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Link, useCatch, useLoaderData } from "@remix-run/react";
import invariant from "tiny-invariant";
import { getRecipeInstructions } from "~/models/recipe-instructions.server";

import { requireUserId } from "~/session.server";

type LoaderData = {
  instructions: Awaited<ReturnType<typeof getRecipeInstructions>>;
};

export const loader: LoaderFunction = async ({
  params,
  request,
}: LoaderArgs) => {
  await requireUserId(request);
  const { recipeId } = params;
  invariant(recipeId, "Recipe Id is required");
  const instructions = await getRecipeInstructions({ recipeId });
  if (!instructions || instructions.length === 0) {
    throw new Response("No instructions have been added to this recipe yet", {
      status: 404,
    });
  }
  return json<LoaderData>({ instructions });
};

export default function RecipeInstructionsPage() {
  const { instructions } = useLoaderData() as unknown as LoaderData;
  return (
    <div className="relative flex flex-col gap-4">
      <Link
        to="new"
        className={`
        absolute
        right-0
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
        Add Instruction
      </Link>

      <div className="mb-4 mt-10 flex flex-col gap-2.5 border border-transparent text-sm">
        {instructions.map((instruction) => {
          return (
            <div
              key={instruction.id}
              className="max-w-120 snap-y snap-mandatory rounded border border-gray-400/50 bg-white p-2 shadow
          "
            >
              <div className="flex items-center gap-2">
                <Link 
                  to={`${instruction.id}`}
                  className="flex flex-shrink-0 flex-col items-center justify-start gap-0.5 border-r border-r-gray-300 py-2 px-2.5 text-xs font-bold text-sky-700">
                  <p className="text-xs capitalize">step</p>
                  <p className="text-sm capitalize">{instruction.stepNo}</p>
                </Link>
                <span className="text-sm capitalize text-gray-800">
                  {instruction.description}
                </span>
              </div>
            </div>
          );
        })}
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
            -mx-2
            px-2
            py-1
            text-xs 
            font-semibold
            text-sky-600 
            transition-colors  
            delay-300
            hover:bg-sky-600 
            hover:text-white
            w-28
            `}
        >
          Add Instruction
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
