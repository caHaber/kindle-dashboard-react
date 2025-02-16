import { useFetchQuery } from "@/lib/hooks/useFetchQuery";
import { useEffect, useState } from "react";
import queries from "@/lib/queries";
import ObservablePlot from "../ObservablePlot";
import * as Plot from "@observablehq/plot";

interface SeriesData {
    product_name: string;
    series_name: string;
    total_reading_millis: number;
    page_flips: number;
}

export function TotalReadingAndPageFlips() {
    const [data, setData] = useState<SeriesData[]>([]);
    const { fetchKindleReadingData } = useFetchQuery(queries.totalReadingAndPageFlips.query);

    useEffect(() => {
        const fetchData = async () => {
            const rawData = await fetchKindleReadingData();
            const formattedData = rawData.map(row => ({
                product_name: row[queries.totalReadingAndPageFlips.headers[0]] as string,
                series_name: row[queries.totalReadingAndPageFlips.headers[1]] as string,
                total_reading_millis: Number(row[queries.totalReadingAndPageFlips.headers[2]]) / 60000, // Convert to minutes
                page_flips: Number(row[queries.totalReadingAndPageFlips.headers[3]])
            }));
            setData(formattedData);
        };
        fetchData();
    }, [fetchKindleReadingData]);

    if (data.length === 0) return <div>Loading...</div>;

    return (
        <div className="p-6 bg-white rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Reading Time vs Page Flips by Series</h2>
            <ObservablePlot
                options={{
                    height: 400,
                    grid: true,
                    x: {
                        label: "Reading Time (minutes)",
                        tickFormat: "~s"
                    },
                    y: {
                        label: "Page Flips",
                        tickFormat: "~s"
                    },
                    color: {
                        legend: true,
                        scheme: "spectral"
                    },
                    marks: [
                        Plot.dot(data, {
                            x: "total_reading_millis",
                            y: "page_flips",
                            fill: "series_name",
                            r: 8,
                            opacity: 0.7,
                            title: d => `${d.product_name}\n${d.series_name}\n${Math.round(d.total_reading_millis)} minutes\n${d.page_flips} page flips`
                        }),
                        Plot.text(data, {
                            x: "total_reading_millis",
                            y: "page_flips",
                            text: d => d.series_name,
                            dx: 15,
                            dy: 15,
                            fontSize: 8
                        })
                    ]
                }}
            />
        </div>
    );
}
