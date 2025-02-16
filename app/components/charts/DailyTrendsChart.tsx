import { useFetchQuery } from "@/lib/hooks/useFetchQuery";
import { useEffect, useState } from "react";
import queries from "@/lib/queries";
import ObservablePlot from "../ObservablePlot";
import * as Plot from "@observablehq/plot";

interface DailyData {
    date: string;
    minutes: number;
    type: 'reading' | 'listening';
}

export function DailyTrendsChart() {
    const [data, setData] = useState<DailyData[]>([]);
    const { fetchKindleReadingData } = useFetchQuery(queries.dailyListeningAndReadingTime.query);

    useEffect(() => {
        const fetchData = async () => {
            const combinedData = await fetchKindleReadingData();

            const formattedData = combinedData.reduce<DailyData[]>((acc, row) => {
                const date = row[queries.dailyListeningAndReadingTime.headers[0]] as string;
                if (!date) return acc;

                return [...acc,
                {
                    date: new Date(date).toISOString(),
                    minutes: Number(row[queries.dailyListeningAndReadingTime.headers[1]]),
                    type: 'reading' as const
                },
                {
                    date: new Date(date).toISOString(),
                    minutes: Number(row[queries.dailyListeningAndReadingTime.headers[2]]),
                    type: 'listening' as const
                }
                ];
            }, []);

            console.log(formattedData);
            setData(formattedData);
        };
        fetchData();
    }, [fetchKindleReadingData]);

    if (data.length === 0) return <div>Loading...</div>;

    return (
        <div className="p-6 bg-white rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Daily Reading and Listening Trends</h2>
            <ObservablePlot
                options={{
                    height: 400,
                    marginLeft: 60,
                    x: {
                        type: "time",
                        label: "Date"
                    },
                    y: {
                        grid: true,
                        label: "Minutes"
                    },
                    color: {
                        domain: ['reading', 'listening'],
                        range: ['#3b82f6', '#9333ea'],
                        legend: true
                    },
                    marks: [
                        Plot.areaY(data, {
                            x: "date",
                            y: "minutes",
                            fill: "type",
                            fillOpacity: 0.6,
                            stroke: "type",
                            strokeWidth: 1,
                            // curve: "basis",
                            tip: true,
                            order: "type",
                        }),
                        Plot.ruleY([0])
                    ]
                }}
            />
        </div>
    );
} 