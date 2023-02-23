import { Form, Link, Outlet } from "@remix-run/react";

export default function RecipesPage() {
  return (
    <div className="flex h-full min-h-screen flex-col">
      <header className="flex items-center justify-between bg-slate-800 p-4 text-white">
        <h1 className="text-2xl font-semibold">
          <Link className="tracking-wide" to=".">Recipes</Link>
        </h1>

        <Form action="/logout" method="post">
          <button
            type="submit"
            className="rounded text-white text-sm py-1 px-4 bg-sky-600  hover:bg-sky-500"
          >
            Logout
          </button>
        </Form>
      </header>

      <main className="flex h-full flex-col gap-2 p-4 max-w-3xl w-full m-auto ">
        <Outlet />
      </main>
    </div>
  );
}
