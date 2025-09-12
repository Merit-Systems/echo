interface LogoProps {
  width?: number;
  height?: number;
}

export const Logo = ({ width, height }: LogoProps) => {
  return (
    <svg
      id="Layer_2"
      data-name="Layer 2"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 363.81 363.81"
      width={width}
      height={height}
    >
      <defs>
        <clipPath id="clippath">
          <rect style={{ fill: 'none' }} width="363.81" height="363.81" />
        </clipPath>
      </defs>
      <g style={{ clipPath: 'url(#clippath)' }}>
        <g id="Layer_1-2" data-name="Layer 1-2">
          <g
            style={{ fill: 'transparent', strokeWidth: 16, stroke: '#919191' }}
          >
            <polygon points="183.23,292.39 88.75,237.84 86.94,236.94 86.94,125.62 183.23,70.03 279.52,125.62 279.52,236.8 183.23,292.39" />
          </g>
          <g
            style={{ fill: 'transparent', strokeWidth: 12, stroke: '#bcbcbc' }}
          >
            <polygon points="181.53,329.96 54.34,256.53 53.31,256.19 53.31,107.88 181.53,33.85 309.75,107.88 309.75,255.94 181.53,329.96" />
          </g>
          <g style={{ fill: 'transparent', strokeWidth: 8, stroke: '#a6a6a6' }}>
            <polygon points="181.53,362.94 181.09,362.69 24.75,272.43 24.75,91.39 25.19,91.14 181.53,0.87 181.97,1.12 338.32,91.39 338.32,272.43 181.97,362.69 181.53,362.94" />
          </g>
          <polygon
            style={{ fill: '#05c7cc' }}
            points="122.32 145.8 122.32 217.35 184.29 253.13 184.29 181.58 122.32 145.8"
          />
          <polygon
            style={{ fill: '#02b2bf' }}
            points="184.29 110.03 184.29 110.03 122.32 145.8 184.29 181.58 246.25 145.8 184.29 110.03"
          />
          <polygon
            style={{ fill: '#0199ae' }}
            points="246.33 145.8 184.36 181.58 184.36 253.13 184.37 253.13 246.33 217.35 246.33 145.8"
          />
        </g>
      </g>
    </svg>
  );
};
