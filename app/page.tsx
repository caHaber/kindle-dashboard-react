"use client"

import { MotherDuckClientProvider } from "@/lib/motherduck/context/motherduckClientContext";
import { DailyReadingAndListeningHeatmap } from "./components/charts/DailyReadingAndListeningHeatmap";
import { TotalReadingStats } from "./components/charts/TotalReadingStats";
import { TotalListeningStats } from "./components/charts/TotalListeningStats";
import { MostReadBooks } from "./components/charts/MostReadBooks";
import { MostListenedBooks } from "./components/charts/MostListenedBooks";
import { AverageSessionStats } from "./components/charts/AverageSessionStats";
import { TotalReadingAndPageFlips } from "./components/charts/TotalReadingAndPageFlips";
import { DailyTrendsChart } from "./components/charts/DailyTrendsChart";
import { GenrePreferencesChart } from "./components/charts/GenrePreferencesChart";
import { DeviceSessionsChart } from "./components/charts/DeviceSessionsChart";
import { HighlightTrendsChart } from "./components/charts/HighlightTrendsChart";
import { BookmarkUsageChart } from "./components/charts/BookmarkUsageChart";
import { ListeningSpeedTrendsChart } from "./components/charts/ListeningSpeedTrendsChart";

export default function Home() {
    return (
        <MotherDuckClientProvider>
            <main className="container mx-auto p-4">
                <h1 className="text-2xl font-bold mb-6">Reading Analytics Dashboard</h1>

                {/* Stats Cards Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="w-full">
                        <TotalReadingStats />
                    </div>
                    <div className="w-full">
                        <TotalListeningStats />
                    </div>
                    <div className="w-full lg:col-span-2">
                        <AverageSessionStats />
                    </div>
                </div>

                {/* Most Read/Listened Books Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    <div className="w-full">
                        <MostReadBooks />
                    </div>
                    <div className="w-full">
                        <MostListenedBooks />
                    </div>
                </div>

                {/* Genre and Device Distribution Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    <div className="w-full">
                        <GenrePreferencesChart />
                    </div>
                    <div className="w-full">
                        <DeviceSessionsChart />
                    </div>
                </div>

                {/* Heatmap */}
                <div className="mt-6 w-full">
                    <DailyReadingAndListeningHeatmap />
                </div>

                {/* Reading vs Page Flips */}
                <div className="mt-6 w-full">
                    <TotalReadingAndPageFlips />
                </div>

                {/* Daily Trends */}
                <div className="mt-6 w-full">
                    <DailyTrendsChart />
                </div>

                {/* Highlight and Bookmark Stats Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    <div className="w-full">
                        <HighlightTrendsChart />
                    </div>
                    <div className="w-full">
                        <BookmarkUsageChart />
                    </div>
                </div>

                {/* Listening Speed Trends */}
                <div className="mt-6 w-full">
                    <ListeningSpeedTrendsChart />
                </div>
            </main>
        </MotherDuckClientProvider>
    );
}
