import { dynamicOgImage } from '@/components/og/images/standard';
import { getApp } from '@/app/(app)/app/[id]/_lib/fetch';

export const appOgImage = async (id: string, component: React.ReactNode) => {
  const app = await getApp(id);

  return dynamicOgImage(
    <div tw="flex flex-col gap-4 justify-between flex-1">
      <div tw="flex justify-between items-start">
        <div tw="flex flex-col">
          <h1 tw="text-7xl font-bold text-black mb-4 mt-0">{app.name}</h1>
          {app.description && (
            <p
              tw="text-3xl text-neutral-600 m-0"
              style={{
                whiteSpace: 'pre-line',
                wordBreak: 'break-word',
                maxWidth: '700px',
              }}
            >
              {app.description}
            </p>
          )}
        </div>
        {app.profilePictureUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={app.profilePictureUrl}
            alt={app.name}
            height={120}
            width={120}
            tw="rounded-md"
          />
        )}
      </div>
      {component}
    </div>
  );
};

export const appSubpageOgImage = async (id: string, title: string) => {
  return appOgImage(
    id,
    <div tw="flex justify-end">
      <h2 tw="text-7xl text-neutral-700 text-right">{title}</h2>
    </div>
  );
};
