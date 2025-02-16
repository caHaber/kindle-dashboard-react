import { useFetchQuery } from "@/lib/hooks/useFetchQuery";
import { useEffect, useState } from "react";
import queries from "@/lib/queries/v2";
import ObservablePlot from "../ObservablePlot";
import * as Plot from "@observablehq/plot";

interface SpeedData {
    date: string;
    speed: number;
}

export function ListeningSpeedTrendsChart() {
    const [data, setData] = useState<SpeedData[]>([]);
    const { fetchKindleReadingData } = useFetchQuery(queries.readingSpeedTrends.query);

    useEffect(() => {
        const fetchData = async () => {
            const result = await fetchKindleReadingData();
            const formattedData = result.reduce<SpeedData[]>((acc, row) => {
                const dateStr = row[queries.readingSpeedTrends.headers[0]] as string;
                const speed = Number(row[queries.readingSpeedTrends.headers[3]]);

                if (!dateStr || isNaN(speed)) return acc;

                const date = new Date(dateStr);
                if (date.toString() === 'Invalid Date') return acc;

                return [...acc, {
                    date: date.toISOString(),
                    speed: speed
                }];
            }, []);
            setData(formattedData);
        };
        fetchData();
    }, [fetchKindleReadingData]);

    if (data.length === 0) return <div>Loading...</div>;

    return (
        <div className="p-6 bg-white rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Reading Speed Trends</h2>
            <ObservablePlot
                options={{
                    height: 400,
                    x: {
                        type: "time",
                        label: "Date"
                    },
                    y: {
                        label: "Average Speed",
                        grid: true
                    },
                    marks: [
                        Plot.line(data, {
                            x: "date",
                            y: "speed",
                            stroke: "#9333ea",
                            strokeWidth: 2
                        }),
                        Plot.dot(data, {
                            x: "date",
                            y: "speed",
                            fill: "#9333ea",
                            title: d => `${new Date(d.date).toLocaleDateString()}: ${d.speed}x speed`
                        })
                    ]
                }}
            />
        </div>
    );
} 