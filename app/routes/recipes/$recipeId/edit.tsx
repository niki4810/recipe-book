import {
  Form,
  Link,
  useActionData,
  useLoaderData,
  useTransition,
} from "@remix-run/react";
import type {
  ActionFunction,
  LoaderArgs,
  LoaderFunction,
} from "@remix-run/node";
import { redirect, json } from "@remix-run/node";
import { updateRecipe, getRecipe } from "~/models/recipes.server";
import { requireUserId } from "~/session.server";
import invariant from "tiny-invariant";

type LoaderData = {
  recipe: NonNullable<Awaited<ReturnType<typeof getRecipe>>>;
};

type ActionData =
  | {
      name: null | string;
      description: null | string;
      durationInMins: null | string;
    }
  | undefined;

export const action: ActionFunction = async ({ request, params }) => {
  await requireUserId(request);
  const { recipeId } = params;
  invariant(recipeId, "Recipe Id is required");
  const formData = await request.formData();
  const name = formData.get("name");
  const description = formData.get("description");
  const imageUrl =
    formData.get("imageUrl") || "https://via.placeholder.com/200";
  let durationInMins = formData.get("durationInMins");

  const errors: ActionData = {
    name: name ? null : "Name is required",
    description: description ? null : "Description is required",
    durationInMins: durationInMins ? null : "Duration is required",
  };

  const hasErrors = Object.values(errors).some((errorMessage) => errorMessage);

  if (hasErrors) {
    return json<ActionData>(errors);
  }

  invariant(typeof name === "string", "Name must be a string");
  invariant(typeof description === "string", "Description must be a string");
  invariant(
    typeof durationInMins === "string",
    "durationInMins must be a string"
  );
  invariant(typeof imageUrl === "string", "imageUrl must be a string");
  let duration = parseInt(durationInMins);
  await updateRecipe(
    {
      name,
      description,
      imageUrl,
      durationInMins: duration,
    },
    recipeId
  );

  return redirect(`/recipes/${recipeId}/details`);
};

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

export default function EditRecipePage() {
  const errors = useActionData() as ActionData;
  const transition = useTransition();
  const isCreating = Boolean(transition.submission);
  const { recipe } = useLoaderData() as unknown as LoaderData;

  return (
    <div className="flex flex-col gap-4 pt-4">
      <h2 className="text-md font-bold">Edit Recipe</h2>
      <Form method="post" className="w-100 flex flex-col gap-2">
        <div>
          <label className="flex w-full flex-col gap-1">
            <span className="text-sm">
              Name:{" "}
              {errors?.name ? (
                <em className="ml-1 text-red-600">{errors.name}</em>
              ) : null}
            </span>
            <input
              name="name"
              className="flex-1 rounded-md border-2 border-sky-600 px-3 text-sm leading-loose"
              defaultValue={recipe.name}
            />
          </label>
        </div>
        <div>
          <label className="flex w-full flex-col gap-1">
            <span className="text-sm">Image:</span>
            <input
              name="imageUrl"
              className="flex-1 rounded-md border-2 border-sky-600 px-3 text-sm leading-loose"
              defaultValue={recipe.imageUrl}
            />
          </label>
        </div>
        <div>
          <label className="flex w-full flex-col gap-1">
            <span className="text-sm">
              Duration In Minutes:
              {errors?.durationInMins ? (
                <em className="ml-1 text-red-600">{errors.durationInMins}</em>
              ) : null}
            </span>
            <input
              type="number"
              name="durationInMins"
              className="flex-1 rounded-md border-2 border-sky-600 px-3 text-sm leading-loose"
              defaultValue={recipe.durationInMins}
            />
          </label>
        </div>
        <div>
          <label className="flex w-full flex-col gap-1">
            <span className="text-sm">
              Description:
              {errors?.description ? (
                <em className="ml-1 text-red-600">{errors.description}</em>
              ) : null}
            </span>
            <textarea
              rows={3}
              name="description"
              className="flex-1 rounded-md border-2 border-sky-600 px-3 text-sm leading-loose"
              defaultValue={recipe.description}
            />
          </label>
        </div>

        <div className="text-right flex items-center gap-4 justify-end">
          <button
            type="submit"
            className="rounded bg-sky-600 py-2 px-4 text-xs text-white hover:bg-sky-500 focus:bg-sky-400 disabled:bg-sky-300"
            disabled={isCreating}
          >
            {isCreating ? "Saving..." : "Save"}
          </button>
          <Link to={`../${recipe.id}/details`} className="text-sm">Cancel</Link>
        </div>
      </Form>
    </div>
  );
}
