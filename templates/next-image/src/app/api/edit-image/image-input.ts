import { dataUrlToFile } from '@/lib/image-utils';
import type { EditImageInput } from './types';

export async function editInputToDataUrl(
  image: EditImageInput
): Promise<string> {
  if (typeof image === 'string') {
    return image;
  }

  const buffer = Buffer.from(await image.arrayBuffer());
  const mediaType = image.type || 'image/jpeg';
  return `data:${mediaType};base64,${buffer.toString('base64')}`;
}

export function editInputToFile(image: EditImageInput, index: number): File {
  if (typeof image !== 'string') {
    return image;
  }

  return dataUrlToFile(image, `image-${index}.png`);
}
