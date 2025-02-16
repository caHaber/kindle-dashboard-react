import { useFetchQuery } from "@/lib/hooks/useFetchQuery";
import { useEffect, useState } from "react";
import queries from "@/lib/queries";

interface ListeningStats {
    total_minutes_listened: number;
}

export function TotalListeningStats() {
    const [data, setData] = useState<ListeningStats | null>(null);
    const { fetchKindleReadingData } = useFetchQuery(queries.totalListeningTime.query);

    useEffect(() => {
        const fetchData = async () => {
            const rawData = await fetchKindleReadingData();
            if (rawData.length > 0) {
                setData({
                    total_minutes_listened: Number(rawData[0][queries.totalListeningTime.headers[0]])
                });
            }
        };
        fetchData();
    }, [fetchKindleReadingData]);

    if (!data) return <div>Loading...</div>;

    const hours = Math.floor(data.total_minutes_listened / 60);
    const minutes = Math.round(data.total_minutes_listened % 60);

    return (
        <div className="p-6 bg-white rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold mb-2">Total Listening Time</h2>
            <p className="text-3xl font-bold text-purple-600">
                {hours} hours {minutes} minutes
            </p>
        </div>
    );
} 