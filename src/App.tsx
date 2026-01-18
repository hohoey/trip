import { useState, useEffect } from "react";
import type { TripEvent } from "./types";
import { useWeather } from "./hooks/useWeather";
import { AddEventModal } from "./components/addEventModal";

export default function App() {
  const [currentTab, setCurrentTab] = useState<
    "itinerary" | "weather" | "manage"
  >("itinerary");
  const tripDates = [
    "2/10",
    "2/11",
    "2/12",
    "2/13",
    "2/14",
    "2/15",
    "2/16",
    "2/17",
    "2/18",
    "2/19",
  ];
  const [activeDay, setActiveDay] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { updateWeather, weatherMap, loading } = useWeather();

  const [schedule, setSchedule] = useState<TripEvent[]>(() => {
    const saved = localStorage.getItem("japan_trip_v2");
    return saved ? JSON.parse(saved) : [];
  });

  // 自動存檔
  useEffect(() => {
    localStorage.setItem("japan_trip_v2", JSON.stringify(schedule));
  }, [schedule]);

  // 初始載入天氣資料
  useEffect(() => {
    updateWeather();
  }, [updateWeather]);

  const currentEvents = schedule
    .filter((e) => e.day === activeDay)
    .sort((a, b) => a.time.localeCompare(b.time));

  const handleExport = () => {
    if (schedule.length === 0) {
      alert("目前沒有行程可以導出");
      return;
    }
    const headers = [
      "Day",
      "Time",
      "Location",
      "Category",
      "Address",
      "Phone",
      "Note",
    ];
    const csvContent = [
      headers.join(","),
      ...schedule.map((item) =>
        [
          item.day,
          `"${item.time}"`,
          `"${item.location}"`,
          `"${item.category}"`,
          `"${item.address || ""}"`,
          `"${item.phone || ""}"`,
          `"${item.note || ""}"`,
        ].join(","),
      ),
    ].join("\n");

    const blob = new Blob(["\uFEFF" + csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Japan_Trip_Backup_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const lines = text.split(/\r?\n/);
        const newEvents: TripEvent[] = lines
          .slice(1)
          .filter((line) => line.trim() !== "")
          .map((line) => {
            const cols = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
            const cleanCols = cols.map((c) => c.replace(/^"|"$/g, "").trim());
            return {
              day: parseInt(cleanCols[0]) || 1,
              time: cleanCols[1] || "00:00",
              location: cleanCols[2] || "未知",
              category: cleanCols[3] || "景點",
              address: cleanCols[4] || "",
              phone: cleanCols[5] || "",
              note: cleanCols[6] || "",
            };
          });

        if (newEvents.length > 0) {
          if (
            confirm(`成功讀取 ${newEvents.length} 筆行程，是否覆蓋現有資料？`)
          ) {
            setSchedule(newEvents);
            setCurrentTab("itinerary");
          }
        }
      } catch (error) {
        alert("解析檔案失敗");
      }
      e.target.value = "";
    };
    reader.readAsText(file);
  };

  const handleAddEvent = (newEvent: TripEvent) => {
    setSchedule([...schedule, newEvent]);
  };

  return (
    <div className="max-w-md mx-auto bg-gray-50 min-h-screen flex flex-col shadow-2xl relative">
      <header className="bg-white p-6 pt-10 shadow-sm">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-black text-gray-900">2月京阪四國之旅</h1>
          {currentTab === "itinerary" && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="w-10 h-10 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-100 flex items-center justify-center active:scale-90 transition-transform"
            >
              <i className="fas fa-plus"></i>
            </button>
          )}
        </div>
        <div className="flex gap-4 mt-6 overflow-x-auto pb-4 flex-nowrap px-2 no-scrollbar">
          {tripDates.map((date, i) => {
            const dayNum = i + 1;
            const isActive = activeDay === dayNum;
            return (
              <button
                key={dayNum}
                onClick={() => setActiveDay(dayNum)}
                className={`relative flex flex-col items-center min-w-[70px] py-3 rounded-2xl transition-all ${
                  isActive
                    ? "bg-gray-900 text-white shadow-xl"
                    : "bg-white text-gray-400 border border-gray-100"
                }`}
              >
                <span className="text-[10px] font-black uppercase tracking-tighter opacity-60">
                  Day {dayNum}
                </span>
                <span className="text-sm font-black mt-1">{date}</span>
                {isActive && (
                  <div className="absolute -bottom-1 w-1 h-1 bg-blue-500 rounded-full"></div>
                )}
              </button>
            );
          })}
        </div>
      </header>

      <main className="grow px-5 py-6 mb-24 overflow-y-auto no-scrollbar">
        {/* 1. 行程分頁 (Itinerary) */}
        {currentTab === "itinerary" && (
          <div className="space-y-8 animate-fadeIn">
            <div className="px-2 mb-4">
              <h2 className="text-3xl font-black text-gray-900 leading-none">
                {tripDates[activeDay - 1]}
              </h2>
              <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.3em] mt-2">
                Day {activeDay} 行程安排
              </p>
            </div>

            {currentEvents.length > 0 ? (
              currentEvents.map((item, idx) => {
                const categoryStyles: Record<string, string> = {
                  景點: "text-blue-500 bg-blue-50",
                  美食: "text-orange-500 bg-orange-50",
                  交通: "text-purple-500 bg-purple-50",
                  購物: "text-pink-500 bg-pink-50",
                };
                const colorClass =
                  categoryStyles[item.category] || "text-gray-500 bg-gray-50";

                return (
                  <div key={idx} className="flex gap-4 group">
                    {/* 左側：時間顯示 */}
                    <div className="flex flex-col items-center w-16 shrink-0 pt-1">
                      <div className="text-4xl font-black text-gray-900 tabular-nums tracking-tighter leading-none">
                        {item.time.split(":")[0]}
                      </div>
                      <div className="text-sm font-black text-gray-400 tabular-nums leading-none mt-1">
                        {item.time.split(":")[1]}
                      </div>
                      {/* 垂直導引線 */}
                      <div className="w-1 grow bg-gray-100 my-4 rounded-full"></div>
                    </div>

                    {/* 右側：功能性卡片 */}
                    <div className="grow bg-white border border-gray-100 shadow-sm rounded-[2rem] p-6 relative active:scale-[0.98] transition-transform">
                      <span
                        className={`absolute top-6 right-6 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${colorClass}`}
                      >
                        {item.category}
                      </span>

                      <h3 className="font-black text-gray-900 pr-14 text-xl leading-tight">
                        {item.location}
                      </h3>

                      <div className="mt-3 space-y-1.5">
                        {item.address && (
                          <p className="text-[11px] text-blue-500 font-bold flex items-start gap-1.5 leading-snug">
                            <i className="fas fa-location-dot mt-0.5"></i>
                            {item.address}
                          </p>
                        )}
                        {item.phone && (
                          <p className="text-[11px] text-gray-400 font-bold flex items-center gap-1.5">
                            <i className="fas fa-phone-alt"></i>
                            {item.phone}
                          </p>
                        )}
                      </div>

                      {item.note && (
                        <div className="mt-4 p-3 bg-gray-50 rounded-xl border-l-4 border-gray-200">
                          <p className="text-xs text-gray-500 font-medium leading-relaxed">
                            {item.note}
                          </p>
                        </div>
                      )}

                      {/* 操作按鈕 */}
                      <div className="mt-6 flex gap-2">
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.location)}`}
                          target="_blank"
                          rel="noreferrer"
                          className="grow bg-gray-900 text-white text-[10px] py-4 rounded-2xl font-black text-center shadow-md active:bg-blue-600 transition-colors"
                        >
                          GOOGLE導航
                        </a>
                        <button
                          onClick={() => {
                            if (confirm("刪除此行程？")) {
                              setSchedule(schedule.filter((s) => s !== item));
                            }
                          }}
                          className="px-6 bg-gray-50 text-gray-300 rounded-2xl hover:text-red-500 transition-colors"
                        >
                          <i className="fas fa-trash-alt text-xs"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-20 text-center text-gray-300 font-bold italic">
                行程未定
              </div>
            )}
          </div>
        )}

        {/* 2. 天氣分頁 (Weather)*/}
        {currentTab === "weather" && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex justify-between items-end mb-4 px-2">
              <div>
                <h2 className="text-xl font-black text-gray-900">實時天氣</h2>
              </div>
              <button
                onClick={() => updateWeather()}
                className="text-gray-400 hover:text-blue-500 transition-all active:rotate-180 p-2"
              >
                <i
                  className={`fas fa-sync-alt ${loading ? "animate-spin" : ""}`}
                ></i>
              </button>
            </div>

            {loading ? (
              <div className="py-20 text-center flex flex-col items-center">
                <div className="w-10 h-10 border-4 border-blue-100 border-t-blue-500 rounded-full animate-spin mb-4"></div>
                <p className="text-gray-300 font-bold text-sm">
                  獲取衛星資料中...
                </p>
              </div>
            ) : (
              <div className="grid gap-4">
                {Object.entries(weatherMap).map(([cityName, data]) => (
                  <div
                    key={cityName}
                    className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-gray-50 animate-fadeIn"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center text-2xl">
                          <i className={`fas ${data.icon} ${data.color}`}></i>
                        </div>
                        <div>
                          <h3 className="text-xl font-black text-gray-900">
                            {cityName}
                          </h3>
                          <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest">
                            {data.desc}
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-4xl font-black text-gray-900 tracking-tighter">
                          {data.temp}
                          <span className="text-xl ml-1">°</span>
                        </div>
                        <div className="flex items-center gap-2 mt-1 justify-end">
                          <span className="text-[10px] font-bold text-red-400">
                            H: {data.maxTemp}°
                          </span>
                          <span className="text-[10px] font-bold text-blue-400">
                            L: {data.minTemp}°
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* 日出日落 */}
                    <div className="mt-5 flex justify-between px-6 py-3 bg-gray-50 rounded-2xl">
                      <span className="text-[10px] font-bold text-gray-400 flex items-center gap-2">
                        <i className="fas fa-sun text-orange-300"></i>{" "}
                        {data.sunrise}
                      </span>
                      <span className="text-[10px] font-bold text-gray-400 flex items-center gap-2">
                        <i className="fas fa-moon text-blue-300"></i>{" "}
                        {data.sunset}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        {/* 3. 管理分頁 (Manage) */}
        {currentTab === "manage" && (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm">
              <h2 className="text-xl font-black text-gray-900 mb-1">
                行程資料備份與還原
              </h2>

              <div className="space-y-4">
                <button
                  onClick={handleExport}
                  className="w-full flex items-center justify-between bg-blue-50 text-blue-600 p-5 rounded-2xl font-bold active:scale-95 transition-all"
                >
                  <span className="flex items-center gap-4">
                    <i className="fas fa-file-export text-lg"></i>
                    行程CSV Import
                  </span>
                  <i className="fas fa-chevron-right text-[10px] opacity-30"></i>
                </button>

                <label className="w-full flex items-center justify-between bg-gray-50 text-gray-500 p-5 rounded-2xl font-bold border-2 border-dashed border-gray-200 cursor-pointer active:scale-95 transition-all">
                  <span className="flex items-center gap-4">
                    <i className="fas fa-file-import text-lg"></i>
                    行程CSV Export
                  </span>
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleImport}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            <div className="p-6 text-center">
              <button
                onClick={() => {
                  if (confirm("警告：這將永久刪除所有已儲存的行程，確定嗎？"))
                    setSchedule([]);
                }}
                className="text-red-300 text-[10px] font-black uppercase tracking-tighter hover:text-red-500 transition-colors underline decoration-2 underline-offset-4"
              >
                清除所有行程資料
              </button>
            </div>
          </div>
        )}
      </main>

      <AddEventModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={handleAddEvent}
        activeDay={activeDay}
      />

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
