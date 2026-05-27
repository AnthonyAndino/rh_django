// Scrollable table wrapper — detects horizontal overflow and shows
// left/right scroll arrow buttons. Uses ResizeObserver for responsiveness
// and adds .is-scrolled class when vertically scrolled (sticky header shadow).
import { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function ScrollableTable({ children, maxHeight }) {
  const containerRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const checkScroll = () => {
    const el = containerRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
    setIsScrolled(el.scrollTop > 2);
  };

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    checkScroll();
    el.addEventListener('scroll', checkScroll);
    const ro = new ResizeObserver(checkScroll);
    ro.observe(el);
    return () => {
      el.removeEventListener('scroll', checkScroll);
      ro.disconnect();
    };
  }, [children]);

  const scroll = (dir) => {
    const el = containerRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * 300, behavior: 'smooth' });
  };

  return (
    <div className="scrollable-table-wrapper">
      {canScrollLeft && (
        <button
          onClick={() => scroll(-1)}
          className="scroll-arrow scroll-arrow-left"
          aria-label="Desplazar a la izquierda"
        >
          <ChevronLeft size={20} />
        </button>
      )}
      {canScrollRight && (
        <button
          onClick={() => scroll(1)}
          className="scroll-arrow scroll-arrow-right"
          aria-label="Desplazar a la derecha"
        >
          <ChevronRight size={20} />
        </button>
      )}
      <div
        ref={containerRef}
        className={`table-container${isScrolled ? ' is-scrolled' : ''}`}
        style={maxHeight ? { maxHeight } : undefined}
      >
        {children}
      </div>
    </div>
  );
}
