import { baseOgImage, dashWidth, Path, xPaddingPx } from './base';
import { baseUrl } from '../base-url';

export const dynamicOgImage = (component: React.ReactNode) => {
  return baseOgImage(
    <div tw="flex flex-col flex-1">
      <div tw="flex flex-col w-full flex-1 text-white px-12 py-6 flex-1">
        {component}
      </div>
      <div tw="flex flex-col w-full">
        <Path
          orientation="horizontal"
          height={dashWidth}
          width={`1200px`}
          style={{ marginLeft: `-${xPaddingPx}` }}
        />
        <div tw="flex px-12 py-6">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`${baseUrl}/logo/light_horizontal.svg`}
            alt="Echo Logo"
            width={222}
            height={80}
          />
        </div>
      </div>
    </div>
  );
};
