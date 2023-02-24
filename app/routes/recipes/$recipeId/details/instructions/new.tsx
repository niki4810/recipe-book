import { Form, useActionData, useTransition } from "@remix-run/react";
import type { ActionFunction } from "@remix-run/node";
import { redirect, json } from "@remix-run/node";
import { requireUserId } from "~/session.server";
import invariant from "tiny-invariant";
import { createRecipeInstruction } from "~/models/recipe-instructions.server";


type ActionData = {
  stepNo: null | string,
  description: null | string
} | undefined;

export const action:ActionFunction = async ({request, params}) => {
  await requireUserId(request);
  const { recipeId } = params;
  invariant(recipeId, "Recipe Id is required");
  
  const formData = await request.formData();
  const stepNo = formData.get("stepNo");
  const description = formData.get("description");

  const errors: ActionData = {
    stepNo: stepNo ? null : "Step No is required",
    description: description ? null : "Description is required"
  };

  const hasErrors = Object.values(errors).some(errorMessage => errorMessage);

  if(hasErrors) {
    return json<ActionData>(errors);
  }

  invariant(typeof stepNo === 'string', "Step No must be a string");
  invariant(typeof description === 'string', "Quantity must be a string");

  await createRecipeInstruction({
    stepNo: parseInt(stepNo), 
    description,
    recipeId
  });

  return redirect(`/recipes/${recipeId}/instructions`);
}


export default function AddInstructionPage() {
  const errors = useActionData() as ActionData;
  const transition = useTransition();

  const isCreating = Boolean(transition.submission);

  return (
    <div className="flex flex-col gap-4 pt-4">
      <h2 className="font-bold text-md">Add Instruction</h2>
      <Form method="post" className="flex flex-col gap-2 w-100">
        <div>
          <label className="flex w-full flex-col gap-1">
            <span className="text-sm">
              Step No: {errors?.stepNo ? (
                <em className="text-red-600 ml-1">{errors.stepNo}</em>
              ) : null}
            </span>
            <input
              min={1}
              type="number"
              name="stepNo"
              className="flex-1 rounded-md border-2 border-sky-600 px-2 text-sm leading-loose"
            />
          </label>
        </div>
        <div>
          <label className="flex w-full flex-col gap-1">
            <span className="text-sm">Description: 
            {errors?.description ? (
                <em className="text-red-600 ml-1">{errors.description}</em>
              ) : null}
            </span>
            <textarea
              rows={3}
              name="description"
              className="flex-1 rounded-md border-2 border-sky-600 px-3 text-sm leading-loose"
            />
          </label>
        </div>
        
        <div className="text-right">
          <button
            type="submit"
            className="text-xs text-white bg-sky-600 hover:bg-sky-500 py-2 px-4 rounded  focus:bg-sky-400 disabled:bg-sky-300"
            disabled={isCreating}
          >
            {isCreating ? "Saving..." : "Save"}
          </button>
        </div>
      </Form>
    </div>
  );
}

