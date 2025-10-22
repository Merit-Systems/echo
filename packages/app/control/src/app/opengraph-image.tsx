import {
  baseOgImage,
  dashWidth,
  Path,
  xPaddingPx,
} from '../components/og/images/base';
import { ogExports } from '../components/og/exports';
import { Logo } from '../components/og/logo';

export const { alt, size, contentType } = ogExports();

const cos30 = Math.cos((30 * Math.PI) / 180);

const innerHexWidth = 180;
const innerHexHeight = innerHexWidth / cos30;
const hexPadding = 8;
const outerHexWidth = innerHexWidth + hexPadding * 2;
const outerHexHeight = outerHexWidth / cos30;

export default async function Image() {
  return baseOgImage(
    <div tw="flex flex-col flex-1">
      <div tw="flex flex-col-reverse">
        <Path orientation="horizontal" height={dashWidth} width={`1200px`} />
        <div tw="flex justify-center items-center">
          <Path
            orientation="horizontal"
            height={dashWidth}
            width={`${(1200 - outerHexWidth) / 2}px`}
            style={{
              marginLeft: `-${xPaddingPx}`,
              marginRight: `${hexPadding}px`,
            }}
          />
          <div tw="flex flex-col relative justify-center items-center">
            <div
              tw="flex flex-col relative justify-center items-center"
              style={{
                position: 'absolute',
                background: '#009dc8',
                marginTop: '-16px',
                marginBottom: '-16px',
                clipPath: ' polygon(-50% 50%,50% 100%,150% 50%,50% 0)',
                height: `${outerHexHeight}px`,
                width: `${outerHexWidth}px`,
                boxShadow: '0 0 24px 12px rgba(0,157,200,0.5)',
              }}
            />

            <div
              tw="flex flex-col relative justify-center items-center"
              style={{
                background: 'white',
                marginTop: '-16px',
                marginBottom: '-16px',
                clipPath: 'polygon(-50% 50%,50% 100%,150% 50%,50% 0)',
                height: `${innerHexHeight}px`,
                width: `${innerHexWidth}px`,
                boxShadow: '0 0 16px 8px rgba(0,157,200,0.5)',
              }}
            >
              <Logo height={180} width={180} />
            </div>
          </div>
          <Path
            orientation="horizontal"
            height={dashWidth}
            width={`${(1200 - outerHexWidth) / 2}px`}
            style={{
              marginLeft: `${hexPadding}px`,
              marginRight: `-${xPaddingPx}`,
            }}
          />
        </div>
      </div>
      <div tw="flex flex-col justify-center items-center flex-1">
        <h1
          tw="text-8xl font-extrabold m-0 mb-3"
          style={{
            background:
              'linear-gradient(to bottom, #009dc8 0%, rgba(0,157,200,0.6) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            color: 'transparent',
          }}
        >
          Echo
        </h1>
        <h2
          tw="m-0 text-5xl font-bold mb-12"
          style={{
            opacity: 0.7,
          }}
        >
          User Pays AI SDK
        </h2>
        <h3 tw="m-0 text-2xl">
          <span style={{ fontWeight: 500 }}> Merit</span>
          <span tw="font-light">Systems</span>
        </h3>
      </div>
    </div>
  );
}
