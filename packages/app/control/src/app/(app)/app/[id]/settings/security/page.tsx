import { AuthorizedCallbacksForm } from './_components/authorized-callbacks';

export default async function SecurityAppSettingsPage(
  props: PageProps<'/app/[id]/settings/security'>
) {
  const { id } = await props.params;

  return <AuthorizedCallbacksForm appId={id} />;
}
