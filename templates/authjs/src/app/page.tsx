import { auth, signIn } from "@/auth";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const session = await auth();
  
  if (session?.user) {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 flex items-center justify-center">
      <div className="max-w-sm w-full px-4">
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg p-8 text-center">
          <h1 className="text-sm font-medium text-neutral-900 dark:text-neutral-100 mb-6">
            Echo Authentication
          </h1>
          <form
            action={async () => {
              "use server";
              await signIn("echo");
            }}
          >
            <button 
              type="submit"
              className="w-full bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 text-xs font-medium py-2.5 px-4 rounded-md hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors"
            >
              Sign in with Echo
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
