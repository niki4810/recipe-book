import { Form, Link, useActionData, useLoaderData, useTransition } from "@remix-run/react";
import type { ActionFunction, LoaderArgs, LoaderFunction } from "@remix-run/node";
import { redirect, json } from "@remix-run/node";
import { deleteRecipeIngredient, RecipeIngredient, updateRecipeIngredient } from "~/models/recipe-ingredients.server";
import { createRecipeIngredient, getRecipeIngredient } from "~/models/recipe-ingredients.server";
import { requireUserId } from "~/session.server";
import invariant from "tiny-invariant";

type ActionData =
  | {
      name: null | string;
      quantity: null | string;
      unit: null | string;
    }
  | undefined;

export const action: ActionFunction = async ({ request, params }) => {
  await requireUserId(request);
  const { recipeId, ingredientId } = params;
  invariant(recipeId, "Recipe Id is required");
  invariant(ingredientId, "Ingredient Id is required");
  const formData = await request.formData();

  const intent = formData.get("intent");

  if (intent === "delete") {
    await deleteRecipeIngredient(ingredientId);
    return redirect(`/recipes/${recipeId}/details/ingredients`);
  }

  const name = formData.get("name");
  const quantity = formData.get("quantity");
  const unit = formData.get("unit");

  const errors: ActionData = {
    name: name ? null : "Name is required",
    quantity: quantity ? null : "Quantity is required",
    unit: unit ? null : "Unit is required",
  };

  const hasErrors = Object.values(errors).some((errorMessage) => errorMessage);

  if (hasErrors) {
    return json<ActionData>(errors);
  }

  invariant(typeof name === "string", "Name must be a string");
  invariant(typeof quantity === "string", "Quantity must be a string");
  invariant(typeof unit === "string", "unit must be a string");

  if (ingredientId === "new") {
    await createRecipeIngredient({
      name,
      quantity,
      unit,
      recipeId,
    });
  } else {
    await updateRecipeIngredient({
      ingredientId,
      name,
      quantity,
      unit
    });
  }

  return redirect(`/recipes/${recipeId}/details/ingredients`);
};

type LoaderData = {
  ingredient?: RecipeIngredient;
};

export const loader: LoaderFunction = async ({
  request,
  params,
}: LoaderArgs) => {
  await requireUserId(request);
  if (params.ingredientId === "new") {
    return json({});
  } else {
    const { recipeId, ingredientId } = params;
    invariant(recipeId, "Recipe Id is required");
    invariant(ingredientId, "Ingredient Id is required");
    const ingredient = await getRecipeIngredient({ recipeId, ingredientId });
    invariant(ingredient, "Instruction not found");
    return json<LoaderData>({ ingredient });
  }
};

export default function AddIngreditentsPage() {
  const { ingredient } = useLoaderData() as LoaderData;
  const errors = useActionData() as ActionData;
  
  const transition = useTransition();
  const isCreating = transition.submission?.formData.get("intent") === "create";
  const isUpdating = transition.submission?.formData.get("intent") === "update";
  const isDeleting = transition.submission?.formData.get("intent") === "delete";
  const isNewIngredient = ingredient ? false : true;

  return (
    <div className="flex flex-col gap-4 pt-4">
      <h2 className="text-md font-bold">Add Ingredient</h2>
      <Form 
        method="post"
        className="w-100 flex flex-col gap-2"
        key={ingredient?.id ?? "new"}
      >
        <div>
          <label className="flex w-full flex-col gap-1">
            <span className="text-sm">
              Name:{" "}
              {errors?.name ? (
                <em className="ml-1 text-red-600">{errors.name}</em>
              ) : null}
            </span>
            <input
              defaultValue={ingredient?.name}
              name="name"
              className="flex-1 rounded-md border-2 border-sky-600 px-2 text-sm leading-loose"
            />
          </label>
        </div>
        <div>
          <label className="flex w-full flex-col gap-1">
            <span className="text-sm">
              Quantity:{" "}
              {errors?.quantity ? (
                <em className="ml-1 text-red-600">{errors?.quantity}</em>
              ) : null}
            </span>
            <input
              defaultValue={ingredient?.quantity}
              min={1}
              type="number"
              name="quantity"
              className="flex-1 rounded-md border-2 border-sky-600 px-2 text-sm leading-loose"
            />
          </label>
        </div>
        <div>
          <label className="flex w-full flex-col gap-1">
            <span className="text-sm">
              Unit:
              {errors?.unit ? (
                <em className="ml-1 text-red-600">{errors.unit}</em>
              ) : null}
            </span>
            <select
              defaultValue={ingredient?.unit}
              name="unit"
              className="flex-1 rounded-md border-2 border-sky-600 px-2 text-sm leading-loose"
            >
              <option id="tablespoon" value="tablespoon">
                tablespoon
              </option>
              <option id="count" value="count">
                count
              </option>
              <option id="inch" value="inch">
                inch
              </option>
              <option id="cup" value="cup">
                cup
              </option>
              <option id="ml" value="ml">
                ml
              </option>
              <option id="grams" value="grams">
                grams
              </option>
              <option id="oz" value="oz">
                oz
              </option>
            </select>
          </label>
        </div>

        <div className="flex items-center justify-start gap-4">
          <div className="flex-1">
            {isNewIngredient ? null : (
              <button
                name="intent"
                value={"delete"}
                type="submit"
                className="rounded bg-red-600 py-2 px-4 text-xs text-white hover:bg-red-500  focus:bg-red-400 disabled:bg-red-300"
                disabled={isDeleting}
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            )}
          </div>
          <div className={`flex items-center gap-4 ${isDeleting ? "hidden" : ""}`}>
            <button
              name="intent"
              value={isNewIngredient ? "create" : "update"}
              type="submit"
              className="rounded bg-sky-600 py-2 px-4 text-xs text-white hover:bg-sky-500  focus:bg-sky-400 disabled:bg-sky-300"
              disabled={isCreating || isUpdating}
            >
              {isNewIngredient
                ? isCreating
                  ? "Saving..."
                  : "Save"
                : isUpdating
                ? "Updating..."
                : "Update"}
            </button>
            {isCreating || isUpdating ? null : (
              <Link
                to={`..`}
                className="text-sm"
              >
                Cancel
              </Link>
            )}
          </div>
        </div>
      </Form>
    </div>
  );
}
