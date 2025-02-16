import React, { useEffect, useRef } from 'react';
import * as Plot from "@observablehq/plot";

interface ObservablePlotProps {
    options?: Plot.PlotOptions;
}

export const ObservablePlot: React.FC<ObservablePlotProps> = ({
    options = {},
}) => {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!containerRef.current) return;

        // Clear any existing plots
        containerRef.current.innerHTML = '';

        // Create the plot
        const plot = Plot.plot(options);

        // Append the plot to the container
        containerRef.current.appendChild(plot);

        // Cleanup function
        return () => {
            if (containerRef.current) {
                containerRef.current.innerHTML = '';
            }
        };
    }, [options]);

    return (
        <div
            ref={containerRef}
            className="observable-plot-container"
        />
    );
};

export default ObservablePlot;
