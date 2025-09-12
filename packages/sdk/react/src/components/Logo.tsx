import React from 'react';

interface LogoProps {
  className?: string;
  width?: number;
  height?: number;
  variant?: 'light' | 'dark';
}

export const Logo: React.FC<LogoProps> = ({
  className = '',
  width = 16,
  height = 16,
  variant = 'light',
}) => {
  const fillColor = variant === 'dark' ? '#DFE2D9' : '#232323';

  return (
    <svg
      id="Layer_1"
      data-name="Layer 1"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 226.03 261"
      className={className}
      width={width}
      height={height}
      aria-label="Echo Logo"
    >
      <defs>
        <style>
          {`
            .cls-1 {
              fill: none;
            }
            .cls-3 {
              fill: #7f0404;
            }
            .cls-4 {
              fill: ${fillColor};
            }
            .cls-5 {
              fill: #a50404;
            }
            .cls-6 {
              fill: #cd0202;
              opacity: .9;
            }
          `}
        </style>
      </defs>
      <polygon
        className="cls-6"
        points="59.23 99.45 59.23 161.55 113.02 192.61 113.02 130.5 59.23 99.45"
      />
      <polygon
        className="cls-5"
        points="113.02 68.39 113.02 68.39 59.23 99.45 113.02 130.5 166.8 99.45 113.02 68.39"
      />
      <polygon
        className="cls-3"
        points="166.8 99.45 113.02 130.5 113.02 192.61 113.02 192.61 166.8 161.55 166.8 99.45"
      />
      <g>
        <path
          className="cls-4"
          d="m113.02,196.41l-57.08-32.95v-65.91l57.08-32.95,57.08,32.95v65.91l-57.08,32.95Zm-52.53-35.58l52.53,30.33,52.53-30.33v-60.66l-52.53-30.33-52.53,30.33v60.66Z"
        />
        <path
          className="cls-4"
          d="m113.02,261L0,195.75V65.25L113.02,0l113.02,65.25v130.5l-113.02,65.25ZM6.82,191.81l106.2,61.31,106.2-61.31v-122.62L113.02,7.88,6.82,69.19v122.62Z"
        />
        <rect
          className="cls-4"
          x="111.88"
          y="3.94"
          width="2.27"
          height="63.28"
        />
        <rect
          className="cls-4"
          x="-.83"
          y="176.82"
          width="63.28"
          height="2.27"
          transform="translate(-84.84 39.24) rotate(-29.99)"
        />
        <rect
          className="cls-4"
          x="194.08"
          y="146.32"
          width="2.27"
          height="63.28"
          transform="translate(-56.51 258.05) rotate(-60)"
        />
        <rect
          className="cls-4"
          x="111.88"
          y="130.5"
          width="2.27"
          height="126.56"
        />
        <rect
          className="cls-4"
          x="104.54"
          y="97.72"
          width="126.56"
          height="2.27"
          transform="translate(-26.95 97.14) rotate(-29.99)"
        />
        <rect
          className="cls-4"
          x="57.08"
          y="35.58"
          width="2.27"
          height="126.56"
          transform="translate(-56.51 99.84) rotate(-60)"
        />
      </g>
    </svg>
  );
};
