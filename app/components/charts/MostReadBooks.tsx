import { useFetchQuery } from "@/lib/hooks/useFetchQuery";
import { useEffect, useState } from "react";
import queries from "@/lib/queries";

interface BookData {
    product_name: string;
    session_count: number;
    total_minutes_read: number;
}

export function MostReadBooks() {
    const [data, setData] = useState<BookData | null>(null);
    const { fetchKindleReadingData } = useFetchQuery(queries.mostReadBook.query);

    useEffect(() => {
        const fetchData = async () => {
            const rawData = await fetchKindleReadingData();
            if (rawData.length > 0) {
                setData({
                    product_name: rawData[0][queries.mostReadBook.headers[0]] as string,
                    session_count: Number(rawData[0][queries.mostReadBook.headers[1]]),
                    total_minutes_read: Number(rawData[0][queries.mostReadBook.headers[2]])
                });
            }
        };
        fetchData();
    }, [fetchKindleReadingData]);

    if (!data) return <div>Loading...</div>;

    return (
        <div className="p-6 bg-white rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Most Read Book</h2>
            <div className="space-y-2">
                <p className="text-lg font-medium">{data.product_name}</p>
                <p className="text-gray-600">
                    Read for {Math.floor(data.total_minutes_read / 60)} hours {Math.round(data.total_minutes_read % 60)} minutes
                </p>
                <p className="text-gray-600">
                    {data.session_count} reading sessions
                </p>
            </div>
        </div>
    );
} 