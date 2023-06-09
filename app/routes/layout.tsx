import { Form, Link } from "@remix-run/react";

export default function LayoutPage() {
  return (
    <div>
      <header className="flex items-center justify-between bg-slate-800 p-4 text-white">
        <h1 className="text-3xl font-bold">
          <Link to=".">Recipe Book</Link>
        </h1>
        <p></p>
        <Form action="/logout" method="post">
          <button
            type="submit"
            className="rounded bg-slate-600 py-2 px-4 text-blue-100 hover:bg-blue-500 active:bg-blue-600"
          >
            Logout
          </button>
        </Form>
      </header>
      <div className="flex">
        
      </div>
    </div>
  );
}
