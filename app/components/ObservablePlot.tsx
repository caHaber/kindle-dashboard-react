import React, { useEffect, useRef } from 'react';
import * as Plot from "@observablehq/plot";
import { useDimensions } from '@/lib/hooks/useDimensions';

interface ObservablePlotProps {
    options?: Plot.PlotOptions;
}

export const ObservablePlot: React.FC<ObservablePlotProps> = ({
    options = {},
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const { width } = useDimensions(containerRef);

    useEffect(() => {
        if (!containerRef.current) return;

        // Clear any existing plots
        containerRef.current.innerHTML = '';

        // Create the plot
        const plot = Plot.plot({ ...options, width });

        // Append the plot to the container
        containerRef.current.appendChild(plot);

        // Cleanup function
        return () => {
            if (containerRef.current) {
                // eslint-disable-next-line react-hooks/exhaustive-deps
                containerRef.current.innerHTML = '';
            }
        };
    }, [options, width]);

    return (
        <div
            ref={containerRef}
            className="observable-plot-container"
        />
    );
};

export default ObservablePlot;
