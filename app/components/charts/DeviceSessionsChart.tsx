import { useFetchQuery } from "@/lib/hooks/useFetchQuery";
import { useEffect, useState } from "react";
import queries from "@/lib/queries/v2";
import ObservablePlot from "../ObservablePlot";
import * as Plot from "@observablehq/plot";

interface DeviceData {
    deviceFamily: string;
    sessionCount: number;
}

export function DeviceSessionsChart() {
    const [data, setData] = useState<DeviceData[]>([]);
    const { fetchKindleReadingData } = useFetchQuery(queries.readingSessionsPerDevice.query);

    useEffect(() => {
        const fetchData = async () => {
            const result = await fetchKindleReadingData();
            const formattedData = result.map(row => ({
                deviceFamily: row[queries.readingSessionsPerDevice.headers[0]] as string,
                sessionCount: Number(row[queries.readingSessionsPerDevice.headers[1]])
            }));
            setData(formattedData);
        };
        fetchData();
    }, [fetchKindleReadingData]);

    if (data.length === 0) return <div>Loading...</div>;

    return (
        <div className="p-6 bg-white rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Reading Sessions by Device</h2>
            <ObservablePlot
                options={{
                    height: 400,
                    color: {
                        legend: true
                    },
                    marks: [
                        Plot.barY(data, {
                            x: "deviceFamily",
                            y: "sessionCount",
                            fill: "deviceFamily",
                            stroke: "white",
                            strokeWidth: 2,
                            title: (d: DeviceData) => `${d.deviceFamily}: ${d.sessionCount} sessions`,
                            sort: { x: "-y" }
                        })
                    ]
                }}
            />
        </div>
    );
} 