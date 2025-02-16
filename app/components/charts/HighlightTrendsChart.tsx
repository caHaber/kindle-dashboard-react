import { useFetchQuery } from "@/lib/hooks/useFetchQuery";
import { useEffect, useState } from "react";
import queries from "@/lib/queries/v2";
import ObservablePlot from "../ObservablePlot";
import * as Plot from "@observablehq/plot";

interface HighlightData {
    date: string;
    count: number;
}

export function HighlightTrendsChart() {
    const [data, setData] = useState<HighlightData[]>([]);
    const { fetchKindleReadingData } = useFetchQuery(queries.dailyHighlightTrends.query);

    useEffect(() => {
        const fetchData = async () => {
            const result = await fetchKindleReadingData();
            const formattedData = result.map(row => ({
                date: new Date(row[queries.dailyHighlightTrends.headers[0]] as string).toISOString(),
                count: Number(row[queries.dailyHighlightTrends.headers[1]])
            }));
            setData(formattedData);
        };
        fetchData();
    }, [fetchKindleReadingData]);

    if (data.length === 0) return <div>Loading...</div>;

    return (
        <div className="p-6 bg-white rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Daily Highlight Activity</h2>
            <ObservablePlot
                options={{
                    height: 400,
                    x: {
                        type: "time",
                        label: "Date"
                    },
                    y: {
                        label: "Number of Highlights",
                        grid: true
                    },
                    marks: [
                        Plot.line(data, {
                            x: "date",
                            y: "count",
                            stroke: "#3b82f6",
                            strokeWidth: 2
                        }),
                        Plot.dot(data, {
                            x: "date",
                            y: "count",
                            fill: "#3b82f6",
                            title: d => `${new Date(d.date).toLocaleDateString()}: ${d.count} highlights`
                        })
                    ]
                }}
            />
        </div>
    );
} 