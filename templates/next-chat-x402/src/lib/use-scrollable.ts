import { useEffect, useState, RefObject, useCallback } from 'react';

export function useScrollable(
  ref: RefObject<HTMLElement | null>
): { isScrollable: boolean; scrollToBottom: () => void } {
  const [isScrollable, setIsScrollable] = useState(false);

  const checkScrollable = useCallback(() => {
    if (!ref.current) return;
    const element = ref.current;
    const hasScrollableContent = element.scrollHeight > element.clientHeight;
    const isNotAtBottom =
      element.scrollTop < element.scrollHeight - element.clientHeight - 20; // 20px threshold
    
    const shouldShow = hasScrollableContent && isNotAtBottom;
    setIsScrollable(shouldShow);
  }, [ref]);

  const scrollToBottom = useCallback(() => {
    if (!ref.current) return;
    ref.current.scrollTo({
      top: ref.current.scrollHeight,
      behavior: 'smooth',
    });
  }, [ref]);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // Initial check with a small delay to ensure DOM is ready
    const timeoutId = setTimeout(checkScrollable, 100);

    const handleScroll = () => checkScrollable();
    element.addEventListener('scroll', handleScroll, { passive: true });

    const resizeObserver = new ResizeObserver(() => {
      // Small delay to ensure scrollHeight is updated
      setTimeout(checkScrollable, 50);
    });
    resizeObserver.observe(element);

    // Check when content changes
    const mutationObserver = new MutationObserver(() => {
      // Small delay to ensure scrollHeight is updated
      setTimeout(checkScrollable, 50);
    });
    mutationObserver.observe(element, {
      childList: true,
      subtree: true,
      characterData: true,
    });

    return () => {
      clearTimeout(timeoutId);
      element.removeEventListener('scroll', handleScroll);
      resizeObserver.disconnect();
      mutationObserver.disconnect();
    };
  }, [ref, checkScrollable]);

  return { isScrollable, scrollToBottom };
}

