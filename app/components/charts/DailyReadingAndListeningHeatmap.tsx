import { useFetchQuery } from "@/lib/hooks/useFetchQuery";
import ObservablePlot from "../ObservablePlot";
import * as d3 from "d3";
import * as Plot from "@observablehq/plot";
import { useEffect, useState } from "react";
import queries from "@/lib/queries";

interface ReadingData {
    activity_date: string;
    minutes_read: number;
    minutes_listened: number;
    most_read_book: string;
    most_listened_book: string;
}

const readableMinutes = (number: number) => {
    const hours = Math.floor(number / 60);
    const minutes = Math.round(number % 60);

    if (hours === 0) {
        return `${minutes} minutes`;
    } else if (minutes === 0) {
        return `${hours} hour${hours === 1 ? '' : 's'}`;
    } else {
        return `${hours} hour${hours === 1 ? '' : 's'} and ${minutes} minute${minutes === 1 ? '' : 's'}`;
    }
}

export function DailyReadingAndListeningHeatmap() {
    const [data, setData] = useState<ReadingData[]>([]);
    const { fetchKindleReadingData } = useFetchQuery(queries.dailyListeningAndReadingTime.query);

    useEffect(() => {
        const fetchData = async () => {
            const rawData = await fetchKindleReadingData();

            const formattedData = rawData.reduce<ReadingData[]>((acc, row) => {

                if (!row[queries.dailyListeningAndReadingTime.headers[0]]) return acc;

                return [...acc, {
                    activity_date: row[queries.dailyListeningAndReadingTime.headers[0]] as string,
                    minutes_read: Number(row[queries.dailyListeningAndReadingTime.headers[1]]),
                    minutes_listened: Number(row[queries.dailyListeningAndReadingTime.headers[2]]),
                    most_read_book: row[queries.dailyListeningAndReadingTime.headers[3]] as string,
                    most_listened_book: row[queries.dailyListeningAndReadingTime.headers[4]] as string
                }]


            }, [] as ReadingData[]);

            setData(formattedData);

        };
        fetchData();
    }, [fetchKindleReadingData]);



    return (
        <div className="flex flex-row bg-white rounded-lg shadow-lg">
            <div className="flex-1">
                {data.length > 0 && <ObservablePlot options={{
                    padding: 0,
                    x: { axis: null },
                    y: { tickFormat: Plot.formatWeekday("en", "narrow"), tickSize: 0 },
                    fy: { tickFormat: "" },
                    color: { scheme: "Blues", legend: true, label: "Minutes read" },
                    marks: [
                        Plot.cell(data, {
                            x: (d) => d3.utcWeek.count(d3.utcYear(new Date(d.activity_date)), new Date(d.activity_date)),
                            y: (d) => new Date(d.activity_date).getUTCDay(),
                            rx: 2,
                            fy: (d) => new Date(d.activity_date).getUTCFullYear(),
                            fill: (d) => Math.round(d.minutes_read),
                            inset: 0.5,
                            title: (d) => `${readableMinutes(d.minutes_read)} \n read on ${d.activity_date} \n ${d.most_read_book}`,
                            tip: true
                        })
                    ]
                }} />}
            </div>
            <div className="flex-1">
                {data.length > 0 && <ObservablePlot options={{
                    padding: 0,
                    x: { axis: null },
                    y: { tickFormat: Plot.formatWeekday("en", "narrow"), tickSize: 0 },
                    fy: { tickFormat: "" },
                    color: { scheme: "PuRd", legend: true, label: "Minutes listened" },
                    marks: [
                        Plot.cell(data, {
                            rx: 2,
                            x: (d) => d3.utcWeek.count(d3.utcYear(new Date(d.activity_date)), new Date(d.activity_date)),
                            y: (d) => new Date(d.activity_date).getUTCDay(),
                            fy: (d) => new Date(d.activity_date).getUTCFullYear(),
                            fill: (d) => Math.round(d.minutes_listened),
                            title: (d) => `${readableMinutes(d.minutes_listened)} \n listened on ${d.activity_date} \n ${d.most_listened_book}`,
                            inset: 0.5,
                            tip: true
                        })
                    ]
                }} />}
            </div>
        </div>
    )
}