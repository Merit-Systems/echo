import { dynamicOgImage } from '@/components/og/images/standard';

// Image metadata
export const alt = 'About Acme';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

// Image generation
export default async function Image() {
  return dynamicOgImage(<p>Login page</p>);
}
