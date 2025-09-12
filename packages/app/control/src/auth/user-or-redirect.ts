import { redirect } from 'next/navigation';
import { auth } from '.';
import { Route } from 'next';
import { AppRoutes } from '../../.next/types/routes';

export const userOrRedirect = async <T extends string>(
  route: Route<T>,
  props: PageProps<AppRoutes>
) => {
  const session = await auth();
  if (!session?.user) {
    const searchParams = await props.searchParams;
    const redirect_url = new URL(route, process.env.ECHO_CONTROL_APP_BASE_URL);
    for (const [key, value] of Object.entries(searchParams)) {
      if (typeof value === 'string') {
        redirect_url.searchParams.set(key, value);
      }
    }
    return redirect(`/login?redirect_url=${redirect_url.toString()}`);
  }
  return session.user;
};

export const userOrRedirectLayout = async <T extends string>(
  route: Route<T>
) => {
  const session = await auth();
  if (!session?.user) {
    return redirect(`/login?redirect_url=${route}`);
  }
  return session.user;
};
