import {
  Form,
  Link,
  useActionData,
  useLoaderData,
  useParams,
  useTransition,
} from "@remix-run/react";
import type {
  ActionFunction,
  LoaderArgs,
  LoaderFunction,
} from "@remix-run/node";
import { redirect, json } from "@remix-run/node";
import { requireUserId } from "~/session.server";
import invariant from "tiny-invariant";
import type { RecipeInstruction } from "~/models/recipe-instructions.server";
import {
  createRecipeInstruction,
  getRecipeInstruction,
  updateRecipeInstruction,
  deleteRecipeInstruction
} from "~/models/recipe-instructions.server";

type ActionData =
  | {
      stepNo: null | string;
      description: null | string;
    }
  | undefined;

export const action: ActionFunction = async ({ request, params }) => {
  await requireUserId(request);
  const { recipeId, instructionId } = params;
  invariant(recipeId, "Recipe Id is required");
  invariant(instructionId, "Instruction Id is required");

  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "delete") {
    await deleteRecipeInstruction(instructionId);
    return redirect(`/recipes/${recipeId}/details/instructions`);
  }

  const stepNo = formData.get("stepNo");
  const description = formData.get("description");

  const errors: ActionData = {
    stepNo: stepNo ? null : "Step No is required",
    description: description ? null : "Description is required",
  };

  const hasErrors = Object.values(errors).some((errorMessage) => errorMessage);

  if (hasErrors) {
    return json<ActionData>(errors);
  }

  invariant(typeof stepNo === "string", "Step No must be a string");
  invariant(typeof description === "string", "Quantity must be a string");

  if (instructionId === "new") {
    await createRecipeInstruction({
      stepNo: parseInt(stepNo),
      description,
      recipeId,
    });
  } else {
    await updateRecipeInstruction({
      stepNo: parseInt(stepNo),
      description,
      instructionId,
    });
  }

  return redirect(`/recipes/${recipeId}/details/instructions`);
};

type LoaderData = {
  instruction?: RecipeInstruction;
};

export const loader: LoaderFunction = async ({
  request,
  params,
}: LoaderArgs) => {
  await requireUserId(request);
  if (params.instructionId === "new") {
    return json({});
  } else {
    const { recipeId, instructionId } = params;
    invariant(recipeId, "Recipe Id is required");
    invariant(instructionId, "Instruction Id is required");
    const instruction = await getRecipeInstruction({ recipeId, instructionId });
    invariant(instruction, "Instruction not found");
    return json<LoaderData>({ instruction });
  }
};

export default function AddInstructionPage() {
  const { instruction } = useLoaderData() as LoaderData;
  const errors = useActionData() as ActionData;
  const { recipeId } = useParams();

  const transition = useTransition();
  const isCreating = transition.submission?.formData.get("intent") === "create";
  const isUpdating = transition.submission?.formData.get("intent") === "update";
  const isDeleting = transition.submission?.formData.get("intent") === "delete";
  const isNewInstruction = instruction ? false : true;

  return (
    <div className="flex flex-col gap-4 pt-4">
      <h2 className="text-md font-bold">Add Instruction</h2>
      <Form
        method="post"
        className="w-100 flex flex-col gap-2"
        key={instruction?.id ?? "new"}
      >
        <div>
          <label className="flex w-full flex-col gap-1">
            <span className="text-sm">
              Step No:{" "}
              {errors?.stepNo ? (
                <em className="ml-1 text-red-600">{errors.stepNo}</em>
              ) : null}
            </span>
            <input
              min={1}
              type="number"
              name="stepNo"
              className="
                flex-1 rounded-md border-2 border-sky-600 px-2 text-sm leading-loose
                read-only:border-gray-500 read-only:bg-gray-400/50"
              readOnly={!isNewInstruction}
              defaultValue={instruction?.stepNo}
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
              defaultValue={instruction?.description}
            />
          </label>
        </div>

        <div className="flex items-center justify-start gap-4">
          <div className="flex-1">
            {isNewInstruction ? null : (
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
            {isCreating || isUpdating ? null : (
              <Link
                to={`../../${recipeId}/details/instructions`}
                className="text-sm"
              >
                Cancel
              </Link>
            )}
            <button
              name="intent"
              value={isNewInstruction ? "create" : "update"}
              type="submit"
              className="rounded bg-sky-600 py-2 px-4 text-xs text-white hover:bg-sky-500  focus:bg-sky-400 disabled:bg-sky-300"
              disabled={isCreating || isUpdating}
            >
              {isNewInstruction
                ? isCreating
                  ? "Saving..."
                  : "Save"
                : isUpdating
                ? "Updating..."
                : "Update"}
            </button>
          </div>
        </div>
      </Form>
    </div>
  );
}
