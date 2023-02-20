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
    <div className="flex flex-col gap-4">
      <h2 className="font-bold text-xl">Add Recipe</h2>
      <Form method="post" className="flex flex-col gap-2 w-100">
        <div>
          <label className="flex w-full flex-col gap-1">
            <span>
              Name: {errors?.name ? (
                <em className="text-red-600 ml-1">{errors.name}</em>
              ) : null}
            </span>
            <input
              name="name"
              className="flex-1 rounded-md border-2 border-sky-600 px-3 text-lg leading-loose"
            />
          </label>
        </div>
        <div>
          <label className="flex w-full flex-col gap-1">
            <span>Image:</span>
            <input
              name="imageUrl"
              className="flex-1 rounded-md border-2 border-sky-600 px-3 text-lg leading-loose"
            />
          </label>
        </div>
        <div>
          <label className="flex w-full flex-col gap-1">
            <span>Duration In Minutes: 
            {errors?.durationInMins ? (
                <em className="text-red-600 ml-1">{errors.durationInMins}</em>
              ) : null}
            </span>
            <input
              type="number"
              name="durationInMins"
              className="flex-1 rounded-md border-2 border-sky-600 px-3 text-lg leading-loose"
            />
          </label>
        </div>
        <div>
          <label className="flex w-full flex-col gap-1">
            <span>Description: 
            {errors?.description ? (
                <em className="text-red-600 ml-1">{errors.description}</em>
              ) : null}
            </span>
            <textarea
              rows={3}
              name="description"
              className="flex-1 rounded-md border-2 border-sky-600 px-3 text-lg leading-loose"
            />
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
