"use client"

import { MotherDuckClientProvider, useMotherDuckClientState } from "@/lib/motherduck/context/motherduckClientContext";
import { useCallback, useState, useEffect } from "react";
import * as Plot from "@observablehq/plot";
import { ObservablePlot } from "./components/ObservablePlot";
import queries from "@/lib/queries";

const useFetchKindleReadingData = () => {
    const { safeEvaluateQuery } = useMotherDuckClientState();
    const [error, setError] = useState<string | null>(null);

    const fetchKindleReadingData = useCallback(async () => {
        try {
            await safeEvaluateQuery("USE \"kindle-data\"");
            const safeResult = await safeEvaluateQuery(queries.totalReadingAndPageFlips.query);
            if (safeResult.status === "success") {
                setError(null);
                return safeResult.result.data.toRows().map((row) => {
                    return row;
                });

            } else {
                setError(safeResult.err.message);
                return [];
            }
        } catch (error) {
            setError("fetchKindleReadingData failed with error: " + error);
            return [];
        }

    }, [safeEvaluateQuery]);

    return { fetchKindleReadingData, error };
}


function KindleReadingDataTable() {
    const { fetchKindleReadingData, error } = useFetchKindleReadingData();
    const [loading, setLoading] = useState(false);
    const [kindleReadingData, setKindleReadingData] = useState<object[]>([]);

    const handleFetchKindleReadingData = async () => {
        setLoading(true);
        const result = await fetchKindleReadingData();
        setKindleReadingData(result);
        setLoading(false);
    };

    useEffect(() => {
        const fetch = async () => {
            setLoading(true);
            const result = await fetchKindleReadingData();
            setKindleReadingData(result);
            setLoading(false);
        };
        fetch();
    }, [fetchKindleReadingData]);

    return (
        <div className="p-5">
            <p className="text-xl"> Kindle Reading Data </p>
            {error && <p className="text-red-500">{error}</p>}
            {loading && <p>Loading...</p>}
            <div className="w-3/4">
                {kindleReadingData.length > 0 && <ObservablePlot
                    options={{
                        x: {
                            axis: "top",
                            grid: true,
                            label: 'Hours read'
                        },
                        title: 'Page turns',
                        marks: [
                            Plot.barX(kindleReadingData, {
                                x: d => Number(d['sum(total_reading_millis)']) / 3.6e+6,
                                y: 'series-product-name',
                                fill: 'series-product-name',
                                tip: 'xy',
                                sort: {
                                    y: '-x'
                                }
                            })
                        ],
                        marginLeft: 140
                    }}
                />}

            </div>

            <div className="w-3/4">
                {kindleReadingData.length > 0 && (
                    <table className="w-full border-collapse border border-gray-300">
                        <thead>
                            <tr>
                                {Object.keys(kindleReadingData[0]).map(d => <th key={d} className="border border-gray-300 p-2">{d}</th>)}

                            </tr>
                        </thead>
                        <tbody>
                            {kindleReadingData.map((row, index) => (
                                <tr key={index} className="hover:bg-gray-400">
                                    {Object.values(row).map((item, cellIndex) => (
                                        <td key={cellIndex} className="border border-gray-300 p-2">
                                            {String(item)}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
            <button onClick={handleFetchKindleReadingData} className="px-3 py-1 bg-gray-200 text-gray-800 rounded hover:bg-gray-300" >Refresh</button>
        </div>
    );
}

export default function Home() {
    return (
        <div>
            <MotherDuckClientProvider>
                <KindleReadingDataTable />
            </MotherDuckClientProvider>
        </div>
    );
}
