"use client"

import { MotherDuckClientProvider, useMotherDuckClientState } from "@/lib/motherduck/context/motherduckClientContext";
import { useCallback, useState, useEffect } from "react";

const SQL_QUERY_STRING = `SELECT * FROM "kindle-data".Kindle_BookRewards_Achievements_1 LIMIT 10`;

const useFetchCustomerOrdersData = () => {
    const { safeEvaluateQuery } = useMotherDuckClientState();
    const [error, setError] = useState<string | null>(null);

    const fetchCustomerOrdersData = useCallback(async () => {
        try {
            const safeResult = await safeEvaluateQuery(SQL_QUERY_STRING);
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
            setError("fetchCustomerOrdersData failed with error: " + error);
            return [];
        }

    }, [safeEvaluateQuery]);

    return { fetchCustomerOrdersData, error };
}


function CustomerOrdersTable() {
    const { fetchCustomerOrdersData, error } = useFetchCustomerOrdersData();
    // const [customerOrdersData, setCustomerOrdersData] = useState<{ username: string, email: string, totalAmount: number, orderDate: string }[]>([]);
    const [loading, setLoading] = useState(false);
    const [customerOrdersData, setCustomerOrdersData] = useState<any[]>([]);
    const handleFetchCustomerOrdersData = async () => {
        setLoading(true);
        const result = await fetchCustomerOrdersData();
        setCustomerOrdersData(result);
        setLoading(false);
    };

    useEffect(() => {
        const fetch = async () => {
            setLoading(true);
            const result = await fetchCustomerOrdersData();
            setCustomerOrdersData(result);
            setLoading(false);
        };
        fetch();
    }, [fetchCustomerOrdersData]);

    // const keys = 

    return (
        <div className="p-5">
            <p className="text-xl"> Customer Orders Data </p>
            {error && <p className="text-red-500">{error}</p>}
            {loading && <p>Loading...</p>}
            <div className="w-3/4">
                {customerOrdersData.length > 0 && (
                    <table className="w-full border-collapse border border-gray-300">
                        <thead>
                            <tr>
                                {Object.keys(customerOrdersData[0]).map(d => <th key={d} className="border border-gray-300 p-2">{d}</th>)}

                            </tr>
                        </thead>
                        <tbody>
                            {customerOrdersData.map((row, index) => (
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
            <button onClick={handleFetchCustomerOrdersData} className="px-3 py-1 bg-gray-200 text-gray-800 rounded hover:bg-gray-300" >Refresh</button>
        </div>
    );
}

export default function Home() {
    return (
        <div>
            <MotherDuckClientProvider>
                <CustomerOrdersTable />
            </MotherDuckClientProvider>
        </div>
    );
}
