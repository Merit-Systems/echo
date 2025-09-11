import * as React from 'react';

const MOBILE_BREAKPOINT = 768;

export function useIsMobile(defaultValue = false) {
  const [isMobile, setIsMobile] = React.useState<boolean>(defaultValue);

  React.useEffect(() => {
    // Set initial value
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);

    // Create media query
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);

    // Define change handler
    const onChange = (e: MediaQueryListEvent) => {
      setIsMobile(e.matches);
    };

    // Add event listener
    mql.addEventListener('change', onChange);

    // Cleanup
    return () => mql.removeEventListener('change', onChange);
  }, []);

  return isMobile;
}
