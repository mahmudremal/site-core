import { useState, useRef, useEffect } from 'react';
import { Button } from './button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../../lib/utils';

export function CategoryBar({
  categories,
  selectedCategory,
  onSelectCategory,
  className
}) {
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);
  
  const scrollContainerRef = useRef(null);

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setShowLeftArrow(scrollLeft > 0);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -200, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 200, behavior: 'smooth' });
    }
  };

  // Initial check and add resize listener
  useEffect(() => {
    handleScroll();
    
    const handleResize = () => {
      handleScroll();
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div className={cn("relative flex items-center", className)}>
      {/* Left scroll button */}
      {showLeftArrow && (
        <div className="absolute left-0 z-10 h-full flex items-center">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full bg-background shadow-md h-8 w-8"
            onClick={scrollLeft}
            aria-label="Scroll left"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
        </div>
      )}
      
      {/* Categories */}
      <div
        ref={scrollContainerRef}
        className="flex gap-2 overflow-x-auto scrollbar-hide px-2 py-3"
        onScroll={handleScroll}
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {categories.map((category) => (
          <Button
            key={category}
            variant={selectedCategory === category ? "default" : "secondary"}
            className={cn(
              "rounded-lg whitespace-nowrap",
              selectedCategory === category ? "bg-black text-white" : "bg-muted/80 text-foreground"
            )}
            onClick={() => onSelectCategory(category)}
          >
            {category}
          </Button>
        ))}
      </div>
      
      {/* Right scroll button */}
      {showRightArrow && (
        <div className="absolute right-0 z-10 h-full flex items-center">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full bg-background shadow-md h-8 w-8"
            onClick={scrollRight}
            aria-label="Scroll right"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      )}
    </div>
  );
}