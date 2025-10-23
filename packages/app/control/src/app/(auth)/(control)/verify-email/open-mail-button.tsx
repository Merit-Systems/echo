'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Mail } from 'lucide-react';

export function OpenMailButton() {
  const [isMobile, setIsMobile] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    // Mark component as mounted and detect if user is on mobile device
    setHasMounted(true);
    const userAgent = navigator.userAgent.toLowerCase();
    const mobile = /iphone|ipad|ipod|android/.test(userAgent);
    setIsMobile(mobile);
  }, []);

  const handleOpenMail = () => {
    // Detect platform
    const userAgent = navigator.userAgent.toLowerCase();
    const isIOS = /iphone|ipad|ipod/.test(userAgent);
    const isAndroid = userAgent.includes('android');

    if (isIOS) {
      // For iOS, use mailto: which opens the default mail app
      // This is the most reliable cross-app method
      window.location.href = 'mailto:';
    } else if (isAndroid) {
      // For Android, use mailto: which is reliable across all devices
      // The intent URI approach doesn't throw exceptions when it fails,
      // making try-catch ineffective for fallback handling
      window.location.href = 'mailto:';
    } else {
      // Desktop fallback - just use mailto
      window.location.href = 'mailto:';
    }
  };

  // Prevent hydration mismatch by not rendering until component has mounted
  if (!hasMounted) {
    return null;
  }

  // Only show the button on mobile devices
  if (!isMobile) {
    return null;
  }

  return (
    <Button
      onClick={handleOpenMail}
      variant="default"
      className="gap-2"
      size="lg"
    >
      <Mail className="size-4" />
      Open Mail App
    </Button>
  );
}
