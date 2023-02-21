import { Form, useActionData, useTransition } from "@remix-run/react";
import type { ActionFunction } from "@remix-run/node";
import { redirect, json } from "@remix-run/node";
import { createRecipeIngredient } from "~/models/recipe-ingredients.server";
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
  const { recipeId } = params;
  invariant(recipeId, "Recipe Id is required");
  const formData = await request.formData();
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

  await createRecipeIngredient({
    name,
    quantity,
    unit,
    recipeId,
  });

  return redirect(`/recipes/${recipeId}/ingredients`);
};

export default function AddIngreditentsPage() {
  const errors = useActionData() as ActionData;
  const transition = useTransition();

  const isCreating = Boolean(transition.submission);

  return (
    <div className="flex flex-col gap-4 pt-4">
      <h2 className="text-md font-bold">Add Ingredient</h2>
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
              className="flex-1 rounded-md border-2 border-sky-600 px-2 text-lg leading-loose"
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
              min={1}
              type="number"
              name="quantity"
              className="flex-1 rounded-md border-2 border-sky-600 px-2 text-lg leading-loose"
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
              name="unit"
              className="flex-1 rounded-md border-2 border-sky-600 px-2 text-lg leading-loose"
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

        <div className="text-right">
          <button
            type="submit"
            className="rounded bg-blue-500 py-2 px-4 text-white hover:bg-blue-600 focus:bg-blue-400 disabled:bg-blue-300"
            disabled={isCreating}
          >
            {isCreating ? "Saving..." : "Save"}
          </button>
        </div>
      </Form>
    </div>
  );
}
