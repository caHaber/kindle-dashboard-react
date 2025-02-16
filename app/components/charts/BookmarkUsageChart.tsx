import { useFetchQuery } from "@/lib/hooks/useFetchQuery";
import { useEffect, useState } from "react";
import queries from "@/lib/queries/v2";
import ObservablePlot from "../ObservablePlot";
import * as Plot from "@observablehq/plot";

interface BookmarkData {
    bookTitle: string;
    bookmarkCount: number;
}

export function BookmarkUsageChart() {
    const [data, setData] = useState<BookmarkData[]>([]);
    const { fetchKindleReadingData } = useFetchQuery(queries.bookmarkUsage.query);

    useEffect(() => {
        const fetchData = async () => {
            const result = await fetchKindleReadingData();
            const formattedData = result.map(row => ({
                bookTitle: row[queries.bookmarkUsage.headers[0]] as string,
                bookmarkCount: Number(row[queries.bookmarkUsage.headers[1]])
            }));
            setData(formattedData);
        };
        fetchData();
    }, [fetchKindleReadingData]);

    if (data.length === 0) return <div>Loading...</div>;

    return (
        <div className="p-6 bg-white rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Most Bookmarked Books</h2>
            <ObservablePlot
                options={{
                    height: 400,
                    marginLeft: 150,
                    x: {
                        label: "Number of Bookmarks",
                        grid: true
                    },
                    y: {
                        label: null,
                        domain: data.map(d => d.bookTitle)
                    },
                    marks: [
                        Plot.barX(data, {
                            y: "bookTitle",
                            x: "bookmarkCount",
                            fill: "#3b82f6",
                            sort: { y: "-x" }
                        }),
                        Plot.ruleX([0])
                    ]
                }}
            />
        </div>
    );
} 