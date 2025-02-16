import { useFetchQuery } from "@/lib/hooks/useFetchQuery";
import { useEffect, useState } from "react";
import queries from "@/lib/queries";

interface ReadingStats {
    total_minutes_read: number;
}

export function TotalReadingStats() {
    const [data, setData] = useState<ReadingStats | null>(null);
    const { fetchKindleReadingData } = useFetchQuery(queries.totalReadingTime.query);

    useEffect(() => {
        const fetchData = async () => {
            const rawData = await fetchKindleReadingData();
            if (rawData.length > 0) {
                setData({
                    total_minutes_read: Number(rawData[0][queries.totalReadingTime.headers[0]])
                });
            }
        };
        fetchData();
    }, [fetchKindleReadingData]);

    if (!data) return <div>Loading...</div>;

    const hours = Math.floor(data.total_minutes_read / 60);
    const minutes = Math.round(data.total_minutes_read % 60);

    return (
        <div className="p-6 bg-white rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold mb-2">Total Reading Time</h2>
            <p className="text-3xl font-bold text-blue-600">
                {hours} hours {minutes} minutes
            </p>
        </div>
    );
} 