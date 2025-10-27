import { useEffect, useState } from 'react';

export const useTypewriter = (text: string, isActive: boolean, speed = 30) => {
  const [displayText, setDisplayText] = useState('');

  useEffect(() => {
    if (!isActive) {
      setDisplayText('');
      return;
    }

    let currentIndex = 0;
    const interval = setInterval(() => {
      if (currentIndex <= text.length) {
        setDisplayText(text.slice(0, currentIndex));
        currentIndex++;
      } else {
        clearInterval(interval);
      }
    }, speed);

    return () => clearInterval(interval);
  }, [text, isActive, speed]);

  return {
    displayText,
    isComplete: displayText.length === text.length && text.length > 0,
  };
};
