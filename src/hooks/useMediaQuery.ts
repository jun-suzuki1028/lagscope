import { useState, useEffect } from 'react';

export const useMediaQuery = (query: string): boolean => {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    
    // 初期値を設定
    if (media.matches !== matches) {
      setMatches(media.matches);
    }

    // リスナーを追加
    const listener = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    // 新しい addEventListener API を使用（古いブラウザのフォールバック付き）
    if (media.addEventListener) {
      media.addEventListener('change', listener);
    } else {
      // 古いブラウザ用フォールバック
      media.addListener(listener);
    }

    return () => {
      if (media.removeEventListener) {
        media.removeEventListener('change', listener);
      } else {
        // 古いブラウザ用フォールバック
        media.removeListener(listener);
      }
    };
  }, [matches, query]);

  return matches;
};

export const useBreakpoint = () => {
  const isSm = useMediaQuery('(min-width: 640px)');
  const isMd = useMediaQuery('(min-width: 768px)');
  const isLg = useMediaQuery('(min-width: 1024px)');
  const isXl = useMediaQuery('(min-width: 1280px)');
  const is2xl = useMediaQuery('(min-width: 1536px)');

  return {
    isSm,
    isMd,
    isLg,
    isXl,
    is2xl,
    isMobile: !isSm,
    isTablet: isSm && !isLg,
    isDesktop: isLg,
  };
};

export const useScreenSize = () => {
  const [screenSize, setScreenSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  });

  useEffect(() => {
    const handleResize = () => {
      setScreenSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    
    // 初期値を設定
    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return screenSize;
};