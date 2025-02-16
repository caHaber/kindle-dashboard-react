import { useFetchQuery } from "@/lib/hooks/useFetchQuery";
import { useEffect, useState } from "react";
import queries from "@/lib/queries/v2";
import ObservablePlot from "../ObservablePlot";
import * as Plot from "@observablehq/plot";

interface GenreData {
    genre: string;
    bookCount: number;
}

export function GenrePreferencesChart() {
    const [data, setData] = useState<GenreData[]>([]);
    const { fetchKindleReadingData } = useFetchQuery(queries.genrePreferences.query);

    useEffect(() => {
        const fetchData = async () => {
            const result = await fetchKindleReadingData();
            const formattedData = result.map(row => ({
                genre: row[queries.genrePreferences.headers[0]] as string,
                bookCount: Number(row[queries.genrePreferences.headers[1]])
            }));
            setData(formattedData);
        };
        fetchData();
    }, [fetchKindleReadingData]);

    if (data.length === 0) return <div>Loading...</div>;

    return (
        <div className="p-6 bg-white rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Genre Distribution</h2>
            <ObservablePlot
                options={{
                    height: 400,
                    color: {
                        legend: true
                    },
                    marks: [
                        Plot.barY(data, {
                            x: "genre",
                            y: "bookCount",
                            fill: "genre",
                            stroke: "white",
                            strokeWidth: 2,
                            title: (d: GenreData) => `${d.genre}: ${d.bookCount} books`,
                            sort: { x: "-y" }
                        })
                    ]
                }}
            />
        </div>
    );
} 