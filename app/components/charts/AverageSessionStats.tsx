import { useFetchQuery } from "@/lib/hooks/useFetchQuery";
import { useEffect, useState } from "react";
import queries from "@/lib/queries";

interface SessionStats {
    avg_reading_minutes: number;
    avg_listening_minutes: number;
}

export function AverageSessionStats() {
    const [data, setData] = useState<SessionStats | null>(null);
    const { fetchKindleReadingData: fetchReadingData } = useFetchQuery(queries.avgReadingSession.query);
    const { fetchKindleReadingData: fetchListeningData } = useFetchQuery(queries.avgListeningSession.query);

    useEffect(() => {
        const fetchData = async () => {
            const readingData = await fetchReadingData();
            const listeningData = await fetchListeningData();

            if (readingData.length > 0 && listeningData.length > 0) {
                setData({
                    avg_reading_minutes: Number(readingData[0][queries.avgReadingSession.headers[0]]),
                    avg_listening_minutes: Number(listeningData[0][queries.avgListeningSession.headers[0]])
                });
            }
        };
        fetchData();
    }, [fetchReadingData, fetchListeningData]);

    if (!data) return <div>Loading...</div>;

    return (
        <div className="p-6 bg-white rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Average Session Duration</h2>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <h3 className="text-lg font-medium text-blue-600">Reading</h3>
                    <p className="text-2xl font-bold">
                        {Math.round(data.avg_reading_minutes)} minutes
                    </p>
                </div>
                <div>
                    <h3 className="text-lg font-medium text-purple-600">Listening</h3>
                    <p className="text-2xl font-bold">
                        {Math.round(data.avg_listening_minutes)} minutes
                    </p>
                </div>
            </div>
        </div>
    );
} 