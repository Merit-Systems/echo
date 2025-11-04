import { auth, signOut } from "@/auth";
import { redirect } from "next/navigation";
import { getEchoClient } from "@/lib/echo-client";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) {
    redirect('/');
  }

  const appId = process.env.ECHO_APP_ID;
  if (!appId) {
    throw new Error("ECHO_APP_ID environment variable is not set");
  }

  const client = await getEchoClient();
  const user = await client.users.getUserInfo();
  const balance = await client.balance.getBalance();
  const freeTierBalance = await client.balance.getFreeBalance(appId);

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <div className="max-w-2xl mx-auto px-4 py-12">
        <header className="flex items-center justify-between mb-10">
          <h1 className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
            Dashboard
          </h1>
          <form
            action={async () => {
              "use server";
              await signOut();
            }}
          >
            <button
              type="submit"
              className="text-xs text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 transition-colors"
            >
              Sign out
            </button>
          </form>
        </header>

        <div className="space-y-4">
          {user && (
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg p-6">
              <div className="flex items-start gap-4">
                {user.picture && (
                  <img
                    src={user.picture}
                    alt={user.name ?? ''}
                    className="w-10 h-10 rounded-full border border-neutral-200 dark:border-neutral-800"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100 mb-0.5">
                    {user.name}
                  </p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate">
                    {user.email}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            {balance && (
              <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg p-4">
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">
                  Balance
                </p>
                <p className="text-lg font-medium text-neutral-900 dark:text-neutral-100 tabular-nums">
                  ${balance.balance.toFixed(2)}
                </p>
              </div>
            )}
            {freeTierBalance && (
              <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg p-4">
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">
                  Free Tier
                </p>
                <p className="text-lg font-medium text-neutral-900 dark:text-neutral-100 tabular-nums">
                  ${freeTierBalance.userSpendInfo.amountLeft.toFixed(2)}
                </p>
              </div>
            )}
          </div>

          {user && (
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg p-4">
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">
                User ID
              </p>
              <p className="text-xs text-neutral-700 dark:text-neutral-300 break-all font-mono">
                {user.id}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
