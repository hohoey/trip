import { useState, useEffect } from "react";
import type { TripEvent } from "./types";
import { useWeather } from "./hooks/useWeather";

export default function App() {
  const [currentTab, setCurrentTab] = useState<
    "itinerary" | "weather" | "manage"
  >("itinerary");
  const [activeDay, setActiveDay] = useState(1);

  // 1. 使用 weather 解決 TS6198
  const { updateWeather } = useWeather();

  // 2. 初始化與 setSchedule 解決 TS6133
  const [schedule, setSchedule] = useState<TripEvent[]>(() => {
    const saved = localStorage.getItem("japan_trip_v2");
    return saved ? JSON.parse(saved) : [];
  });

  // 自動存檔
  useEffect(() => {
    localStorage.setItem("japan_trip_v2", JSON.stringify(schedule));
  }, [schedule]);

  // 天氣自動更新
  useEffect(() => {
    updateWeather("Kyoto"); // 這裡調用了 updateWeather
  }, [updateWeather]);

  const currentEvents = schedule
    .filter((e) => e.day === activeDay)
    .sort((a, b) => a.time.localeCompare(b.time));

  return (
    <div className="max-w-md mx-auto bg-gray-50 min-h-screen flex flex-col shadow-2xl relative">
      <header className="bg-white p-6 pt-10 shadow-sm">
        <h1 className="text-2xl font-black">2月京阪四國之旅</h1>
        <div className="flex gap-2 mt-4 overflow-x-auto no-scrollbar pb-2">
          {[...Array(10)].map((_, i) => {
            const dayNum = i + 1;
            return (
              <button
                key={dayNum}
                onClick={() => setActiveDay(dayNum)}
                className={`px-4 py-2 rounded-xl min-w-[70px] text-center transition-all ${
                  activeDay === dayNum
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-400"
                }`}
              >
                <div className="text-[10px] font-black uppercase">
                  Day{dayNum}
                </div>
              </button>
            );
          })}
        </div>
      </header>

      <main className="flex-grow p-5">
        {currentTab === "itinerary" && (
          <div className="space-y-4">
            {currentEvents.map((item, idx) => (
              <div key={idx} className="japanese-card">
                <h3 className="font-bold">{item.location}</h3>
                <button
                  onClick={() =>
                    setSchedule(schedule.filter((_, i) => i !== idx))
                  }
                  className="text-red-400 text-xs mt-2"
                >
                  刪除
                </button>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Footer 略 */}
      <footer className="p-4 border-t flex justify-around bg-white">
        <button onClick={() => setCurrentTab("itinerary")}>行程</button>
        <button onClick={() => setCurrentTab("manage")}>管理</button>
      </footer>
    </div>
  );
}
