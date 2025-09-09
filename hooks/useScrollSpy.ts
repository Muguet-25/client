import { useState, useEffect } from 'react';

const isIntersecting = (element: HTMLElement) => {
  const rect = element.getBoundingClientRect();
  return rect.top <= window.innerHeight && rect.bottom >= 0;
};

export const useScrollSpy = (sections: string[]) => {
  const [activeSection, setActiveSection] = useState(sections[0]);
  const [isNavVisible, setIsNavVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // 현재 화면에 보이는 섹션 찾기
      for (const sectionId of sections) {
        const element = document.getElementById(sectionId);
        if (element && isIntersecting(element)) {
          setActiveSection(sectionId);
          break;
        }
      }

      // 네비게이션 표시/숨김 로직
      const heroSection = document.getElementById('hero');
      if (heroSection && isIntersecting(heroSection)) {
        setIsNavVisible(true);
      } else {
        setIsNavVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [sections]);

  return { activeSection, isNavVisible };
};
