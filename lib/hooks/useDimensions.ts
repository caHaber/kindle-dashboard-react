import { useState, useEffect } from "react";

export function useDimensions(elementRef: React.RefObject<HTMLElement>) {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const updateDimensions = () => {
      if (elementRef.current) {
        setDimensions({
          width: elementRef.current.offsetWidth,
          height: elementRef.current.offsetHeight,
        });
      }
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);

    return () => {
      window.removeEventListener("resize", updateDimensions);
    };
  }, [elementRef]);

  return dimensions;
}
