import { ImageResponse } from 'next/og';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

const backgroundColor = '#fcfcfc';
const borderColor = '#a1a1a1';
export const dashWidth = '1.5px';
const xPadding = 16;
export const xPaddingPx = `${xPadding * 4}px`;
const yPadding = 16;
const yPaddingPx = `${yPadding * 4}px`;
const circleSize = 16;

export const baseOgImage = async (component: React.ReactNode) => {
  const [
    helveticaNowDisplayBlack,
    helveticaNowDisplayExtraBold,
    helveticaNowDisplayRegular,
    helveticaNowDisplayMedium,
    helveticaNowDisplayExtraLight,
  ] = await Promise.all([
    readFile(
      join(process.cwd(), `public/fonts/HelveticaNowDisplay-Black.woff`)
    ),
    readFile(
      join(process.cwd(), `public/fonts/HelveticaNowDisplay-ExtraBold.woff`)
    ),
    readFile(
      join(process.cwd(), `public/fonts/HelveticaNowDisplay-Regular.woff`)
    ),
    readFile(
      join(process.cwd(), `public/fonts/HelveticaNowDisplay-Medium.woff`)
    ),
    readFile(
      join(process.cwd(), `public/fonts/HelveticaNowDisplay-ExtLt.woff`)
    ),
  ]);

  return new ImageResponse(
    (
      <div
        tw="flex flex-col relative"
        style={{
          background: backgroundColor,
          height: '100%',
          width: '100%',
        }}
      >
        {/* Top border */}
        <div
          tw={`h-${yPadding} w-full px-${xPadding} flex items-center justify-between`}
        >
          <Path orientation="vertical" height={yPaddingPx} width={dashWidth} />
          <Path orientation="vertical" height={yPaddingPx} width={dashWidth} />
        </div>
        <Path orientation="horizontal" height={dashWidth} width={'1200px'} />
        <div
          tw="top-0 left-0 right-0 h-4 absolute"
          style={{
            background: `linear-gradient(to bottom, ${backgroundColor} 0%, rgba(252, 252, 252, 0) 100%)`,
          }}
        />
        <div
          tw={`absolute top-${yPadding - circleSize / 2} left-${xPadding - circleSize / 2} flex`}
        >
          <Circle size={circleSize * 4} />
        </div>
        <div
          tw={`absolute bottom-${yPadding - circleSize / 2} right-${xPadding - circleSize / 2} flex`}
        >
          <Circle size={circleSize * 4} />
        </div>

        {/* Content */}
        <div tw={`flex-1 flex px-${xPadding}`}>
          <Path
            orientation="vertical"
            height={`${630 - yPadding * 4 * 2}px`}
            width={dashWidth}
          />
          <div
            tw="flex-1 w-full flex flex-col"
            style={{
              background: backgroundColor,
            }}
          >
            {component}
          </div>
          <Path
            orientation="vertical"
            height={`${630 - yPadding * 4 * 2}px`}
            width={dashWidth}
          />
        </div>
        <Path orientation="horizontal" height={dashWidth} width={`1200px`} />

        {/* Bottom border */}
        <div
          tw={`h-${yPadding} w-full px-${xPadding} flex items-center justify-between`}
        >
          <Path orientation="vertical" height={yPaddingPx} width={dashWidth} />
          <Path orientation="vertical" height={yPaddingPx} width={dashWidth} />
        </div>

        {/* Side gradients */}
        <div
          tw="bottom-0 top-0 left-0 w-4 flex items-center absolute"
          style={{
            background: `linear-gradient(to right, ${backgroundColor} 0%, rgba(252, 252, 252, 0) 100%)`,
          }}
        />
        <div
          tw="bottom-0 top-0 right-0 w-4 flex items-center absolute"
          style={{
            background: `linear-gradient(to left, ${backgroundColor} 0%, rgba(252, 252, 252, 0) 100%)`,
          }}
        />
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: [
        {
          name: 'HelveticaNowDisplay',
          data: helveticaNowDisplayBlack,
          weight: 900,
          style: 'normal',
        },
        {
          name: 'HelveticaNowDisplay',
          data: helveticaNowDisplayExtraBold,
          weight: 800,
          style: 'normal',
        },
        {
          name: 'HelveticaNowDisplay',
          data: helveticaNowDisplayRegular,
          weight: 400,
          style: 'normal',
        },
        {
          name: 'HelveticaNowDisplay',
          data: helveticaNowDisplayMedium,
          weight: 500,
          style: 'normal',
        },
        {
          name: 'HelveticaNowDisplay',
          data: helveticaNowDisplayExtraLight,
          weight: 200,
          style: 'normal',
        },
      ],
    }
  );
};

interface PathProps {
  orientation: 'horizontal' | 'vertical';
  height: string;
  width: string;
  style?: React.CSSProperties;
}

export const Path = ({ orientation, height, width, style }: PathProps) => {
  // Calculate actual pixel dimensions for consistent dash sizing
  const getPixelValue = (value: string) => {
    return parseInt(value.replace('px', ''));
  };

  // For consistent 2px dashes and 10px gaps regardless of path length
  const dashSize = 4;
  const gapSize = 3;

  // Calculate the actual length of the path in pixels
  const pathLengthPx =
    orientation === 'horizontal' ? getPixelValue(width) : getPixelValue(height);

  // Create dash array that maintains consistent absolute sizing
  const normalizedDashArray = `${(dashSize / pathLengthPx) * 100} ${(gapSize / pathLengthPx) * 100}`;

  return (
    <svg
      style={{
        height,
        width,
        ...style,
      }}
    >
      <line
        x1="0"
        y1="0"
        x2={orientation === 'horizontal' ? '100%' : '0'}
        y2={orientation === 'horizontal' ? '0' : '100%'}
        stroke={borderColor}
        strokeWidth={dashWidth}
        strokeDasharray={normalizedDashArray}
        pathLength="100"
      />
    </svg>
  );
};

interface CircleProps {
  size: number;
}

const Circle = ({ size }: CircleProps) => {
  // For consistent dash sizing matching the Path component
  const dashSize = 12;
  const gapSize = 9;

  // Calculate circle circumference: 2πr
  const radius = size / 2;
  const circumference = 2 * Math.PI * radius;

  // Create dash array that maintains consistent absolute sizing
  const normalizedDashArray = `${(dashSize / circumference) * 100} ${(gapSize / circumference) * 100}`;

  return (
    <svg
      style={{
        height: `${size}px`,
        width: `${size}px`,
      }}
    >
      <circle
        cx="50%"
        cy="50%"
        r={'50%'} // Subtract half stroke width to prevent clipping
        fill="none"
        stroke={borderColor}
        strokeWidth={dashWidth}
        strokeDasharray={normalizedDashArray}
        pathLength="100"
      />
    </svg>
  );
};
