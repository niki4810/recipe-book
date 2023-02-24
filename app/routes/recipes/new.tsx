import { Form, useActionData, useTransition } from "@remix-run/react";
import type { ActionFunction } from "@remix-run/node";
import { redirect, json } from "@remix-run/node";
import React from "react";
import { createRecipe } from "~/models/recipes.server";
import { requireUserId } from "~/session.server";
import invariant from "tiny-invariant";

type ActionData = {
  name: null | string,
  description: null | string,
  durationInMins: null | string,
} | undefined;

export const action:ActionFunction = async ({request}) => {
  const userId = await requireUserId(request);
  const formData = await request.formData();
  const name = formData.get("name");
  const description = formData.get("description");
  const imageUrl = formData.get("imageUrl") || "https://via.placeholder.com/200";
  let durationInMins = formData.get("durationInMins");
  
  
  const errors: ActionData = {
    name: name ? null : "Name is required",
    description: description ? null : "Description is required",
    durationInMins: durationInMins ? null : "Duration is required"
  };

  const hasErrors = Object.values(errors).some(errorMessage => errorMessage);

  if(hasErrors) {
    return json<ActionData>(errors);
  }

  invariant(typeof name === 'string', "Name must be a string");
  invariant(typeof description === 'string', "Description must be a string");
  invariant(typeof durationInMins === 'string', "durationInMins must be a string");
  invariant(typeof imageUrl === 'string', "imageUrl must be a string");
  let duration = parseInt(durationInMins);
  await createRecipe({
    name, 
    description, 
    imageUrl, 
    durationInMins: duration
  }, userId );

  return redirect("/recipes");
}

export default function NewRecipePage() {
  const errors = useActionData() as ActionData;
  const transition = useTransition();

  const isCreating = Boolean(transition.submission);

  return (
    <div className="flex flex-col gap-4 pt-4">
      <h2 className="font-bold text-md">Add Recipe</h2>
      <Form method="post" className="flex flex-col gap-2 w-100">
        <div>
          <label className="flex w-full flex-col gap-1">
            <span className="text-sm">
              Name: {errors?.name ? (
                <em className="text-red-600 ml-1">{errors.name}</em>
              ) : null}
            </span>
            <input
              name="name"
              className="flex-1 rounded-md border-2 border-sky-600 px-3 text-sm leading-loose"
            />
          </label>
        </div>
        <div>
          <label className="flex w-full flex-col gap-1">
            <span className="text-sm">Image:</span>
            <input
              name="imageUrl"
              className="flex-1 rounded-md border-2 border-sky-600 px-3 text-sm leading-loose"
            />
          </label>
        </div>
        <div>
          <label className="flex w-full flex-col gap-1">
            <span className="text-sm">Duration In Minutes: 
            {errors?.durationInMins ? (
                <em className="text-red-600 ml-1">{errors.durationInMins}</em>
              ) : null}
            </span>
            <input
              type="number"
              name="durationInMins"
              className="flex-1 rounded-md border-2 border-sky-600 px-3 text-sm leading-loose"
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
        

          {/*  */}
        <div className="text-right">
          <button
            type="submit"
            className="text-xs text-white py-2 px-4 rounded bg-sky-600 hover:bg-sky-500 focus:bg-sky-400 disabled:bg-sky-300"
            disabled={isCreating}
          >
            {isCreating ? "Saving..." : "Save"}
          </button>
        </div>
      </Form>
    </div>
  );
}
