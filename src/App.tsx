import { useState, useEffect } from "react";
import type { TripEvent } from "./types";
import { useWeather } from "./hooks/useWeather";

export default function App() {
  const [currentTab, setCurrentTab] = useState<
    "itinerary" | "weather" | "manage"
  >("itinerary");
  const [activeDay, setActiveDay] = useState(1);

  const { updateWeather } = useWeather();

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
    updateWeather("Kyoto");
  }, [updateWeather]);

  const currentEvents = schedule
    .filter((e) => e.day === activeDay)
    .sort((a, b) => a.time.localeCompare(b.time));

  return (
    <div className="max-w-md mx-auto bg-gray-50 min-h-screen flex flex-col shadow-2xl relative">
      <header className="bg-white p-6 pt-10 shadow-sm">
        <h1 className="text-2xl font-black">2月京阪四國之旅</h1>
        <div className="flex gap-3 mt-6 overflow-x-auto pb-2 flex-nowrap px-2">
          {[...Array(10)].map((_, i) => {
            const dayNum = i + 1;
            return (
              <button
                key={dayNum}
                onClick={() => setActiveDay(dayNum)}
                className={`px-6 py-2 rounded-full whitespace-nowrap transition-all flex-shrink-0 font-bold text-sm ${
                  activeDay === dayNum
                    ? "bg-blue-600 text-white shadow-md shadow-blue-200"
                    : "bg-gray-100 text-gray-400 hover:bg-gray-200"
                }`}
              >
                DAY {dayNum}
              </button>
            );
          })}
        </div>
      </header>

      <main className="flex-grow px-5 py-6 mb-24 overflow-y-auto">
        {currentTab === "itinerary" && (
          <div className="space-y-6">
            {currentEvents.length > 0 ? (
              currentEvents.map((item, idx) => (
                <div key={idx} className="flex gap-4 group">
                  {/* 時間軸數字 */}
                  <div className="text-[11px] font-bold text-gray-400 pt-2 w-10 text-center">
                    {item.time}
                  </div>

                  {/* 日系質感卡片 */}
                  <div className="relative flex-grow bg-white border border-gray-100 shadow-sm rounded-[2rem] p-5 transition-transform active:scale-[0.98]">
                    <span className="absolute top-4 right-5 text-[9px] font-black text-blue-500 uppercase tracking-tighter">
                      {item.category}
                    </span>
                    <h3 className="font-bold text-gray-900 pr-12">
                      {item.location}
                    </h3>
                    {item.note && (
                      <p className="text-xs text-gray-400 mt-2 leading-relaxed italic">
                        {item.note}
                      </p>
                    )}

                    {/* 操作按鈕 */}
                    <div className="mt-4 flex gap-2">
                      <button className="flex-grow bg-gray-900 text-white text-[10px] py-2.5 rounded-xl font-bold hover:bg-gray-800">
                        Google Maps
                      </button>
                      <button
                        onClick={() => {
                          if (confirm("刪除這項行程？")) {
                            setSchedule(schedule.filter((s) => s !== item));
                          }
                        }}
                        className="px-4 bg-red-50 text-red-300 rounded-xl hover:text-red-500"
                      >
                        <i className="fas fa-trash-alt text-xs"></i>
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-20">
                <i className="fas fa-map-pin text-gray-200 text-4xl mb-4"></i>
                <p className="text-gray-300 text-sm">今日尚未安排行程</p>
                <p className="text-gray-200 text-[10px] mt-1">
                  請至管理頁面匯入 CSV
                </p>
              </div>
            )}
          </div>
        )}

        {currentTab === "manage" && (
          /* 這裡放之前的 handleImport / handleExport 按鈕 UI */
          <div className="animate-fadeIn">
            {/* ... 前面提供的管理介面代碼 ... */}
          </div>
        )}
      </main>

      {/* Footer 略 */}
      <footer className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white border-t flex justify-around py-4 shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
        <button
          onClick={() => setCurrentTab("itinerary")}
          className={`flex flex-col items-center gap-1 transition-all ${currentTab === "itinerary" ? "text-blue-600 scale-110" : "text-gray-400"}`}
        >
          <i className="fas fa-map-marked-alt text-xl"></i>
          <span className="text-xs font-bold">行程</span>
        </button>

        <button
          onClick={() => setCurrentTab("weather")}
          className={`flex flex-col items-center gap-1 transition-all ${currentTab === "weather" ? "text-blue-600 scale-110" : "text-gray-400"}`}
        >
          <i className="fas fa-cloud-sun text-xl"></i>
          <span className="text-xs font-bold">天氣</span>
        </button>

        <button
          onClick={() => setCurrentTab("manage")}
          className={`flex flex-col items-center gap-1 transition-all ${currentTab === "manage" ? "text-blue-600 scale-110" : "text-gray-400"}`}
        >
          <i className="fas fa-cog text-xl"></i>
          <span className="text-xs font-bold">管理</span>
        </button>
      </footer>
    </div>
  );
}
