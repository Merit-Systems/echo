import { dynamicOgImage } from './standard';

interface StaticPageProps {
  title: string;
  description: string;
}

export const staticPage = ({ title, description }: StaticPageProps) => {
  return dynamicOgImage(
    <div tw="flex flex-col flex-1">
      <h1 tw="text-8xl font-extrabold m-0 mb-3 text-black">{title}</h1>
      <h2 tw="m-0 text-5xl font-normal mb-12 text-black opacity-80">
        {description}
      </h2>
    </div>
  );
};
