"use client"

import { MotherDuckClientProvider, useMotherDuckClientState } from "@/lib/motherduck/context/motherduckClientContext";
import { useCallback, useState, useEffect } from "react";
import { GET_TOTAL_READING_AND_PAGE_FLIPS } from "@/lib/queries";
import * as Plot from "@observablehq/plot";
import { ObservablePlot } from "./components/ObservablePlot";
// const SQL_QUERY_STRING = `SELECT * FROM "kindle-data".Kindle_BookRewards_Achievements_1 LIMIT 10`;

const useFetchKindleReadingData = () => {
    const { safeEvaluateQuery } = useMotherDuckClientState();
    const [error, setError] = useState<string | null>(null);

    const fetchKindleReadingData = useCallback(async () => {
        try {
            await safeEvaluateQuery("USE \"kindle-data\"");
            const safeResult = await safeEvaluateQuery(GET_TOTAL_READING_AND_PAGE_FLIPS.query);
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

    // const keys = 

    return (
        <div className="p-5">
            <p className="text-xl"> Kindle Reading Data </p>
            {error && <p className="text-red-500">{error}</p>}
            {loading && <p>Loading...</p>}
            <div className="w-3/4">
                {kindleReadingData.length > 0 && <ObservablePlot
                    options={{
                        title: 'Page turns',
                        marks: [
                            Plot.barX(kindleReadingData, {
                                x: 'sum(number_of_page_flips)',
                                y: 'series-product-name',
                                fill: 'Product Name',
                                tip: 'xy'
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
