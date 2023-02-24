import type { LoaderArgs, LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useCatch, useLoaderData } from "@remix-run/react";
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
    <div className="text-sm mb-4 flex flex-col gap-2.5 border border-transparent">
      {instructions.map((instruction) => {
        return (
          <div key={instruction.id} className="bg-white border-gray-400/50 border shadow max-w-120 rounded p-2 snap-mandatory snap-y
          ">
            <div className="flex items-center gap-2">
              <span className="text-xs text-sky-700 font-bold border-r border-r-gray-300 flex items-center justify-start py-2 px-2.5 flex-shrink-0 flex-col gap-0.5">
                <p className="text-xs capitalize">step</p>
                <p className="text-sm capitalize">{instruction.stepNo}</p>
              </span>
              <span className="capitalize text-sm text-gray-800">{instruction.description}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Expected Errors
export function CatchBoundary() {
  const caught = useCatch();
  if (caught.status === 404) {
    return <div className="text-sm text-gray-800">{caught.data}</div>;
  }
  throw new Error(`Unsupported thrown response status code: ${caught.status}`);
}

// UnExpected Errors
export function ErrorBoundary({ error }: { error: Error }) {
  if (error instanceof Error) {
    return <div className="text-sm text-red-600">{error.message}</div>;
  }
  return <div className="text-sm text-red-600">Oh no, something went wrong!</div>;
}