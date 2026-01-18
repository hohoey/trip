import { useState, useEffect, useMemo } from "react";
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
    const saved = localStorage.getItem("japan_trip_v1");
    return saved ? JSON.parse(saved) : [];
  });

  // 自動存檔
  useEffect(() => {
    localStorage.setItem("japan_trip_v1", JSON.stringify(schedule));
  }, [schedule]);

  // 初始載入天氣
  useEffect(() => {
    updateWeather();
  }, [updateWeather]);

  const currentEvents = useMemo(() => {
    return schedule
      .filter((e) => e.day === activeDay)
      .sort((a, b) => a.time.localeCompare(b.time));
  }, [schedule, activeDay]);

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
    <div className="max-w-md mx-auto bg-[#E0F2F7] min-h-screen flex flex-col shadow-2xl relative overflow-hidden winter-bg">
      {/* Header: 透明磨砂感 */}
      <header className="bg-white/60 backdrop-blur-xl p-6 pt-12 sticky top-0 z-30 border-b border-white/40">
        <div className="flex justify-between items-center">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black tracking-tighter text-[#1A5276]">
                冬日和風貓家行
              </h1>
              <i className="fas fa-cat text-blue-300 text-sm animate-pulse"></i>
            </div>
            <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] mt-1">
              2月京阪四國之旅
            </p>
          </div>
          {currentTab === "itinerary" && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="w-11 h-11 bg-linear-to-br from-[#1A5276] to-[#2980B9] text-white rounded-2xl flex items-center justify-center shadow-lg active:scale-90 transition-transform"
            >
              <i className="fas fa-plus"></i>
            </button>
          )}
        </div>

        {/* 日期選擇器 */}
        <div className="flex gap-3 mt-8 overflow-x-auto pb-2 no-scrollbar px-1">
          {tripDates.map((date, i) => {
            const dayNum = i + 1;
            const isActive = activeDay === dayNum;
            return (
              <button
                key={dayNum}
                onClick={() => setActiveDay(dayNum)}
                className={`flex-none px-5 py-4 rounded-[1.8rem] transition-all border ${
                  isActive
                    ? "bg-[#1A5276] text-white shadow-xl border-transparent scale-105"
                    : "bg-white/50 text-[#5499C7] border-white/60 hover:bg-white"
                }`}
              >
                <div className="text-[8px] font-black opacity-60 uppercase tracking-widest">
                  Day {dayNum}
                </div>
                <div className="text-sm font-black mt-0.5">{date}</div>
              </button>
            );
          })}
        </div>
      </header>

      {/* Main Content */}
      <main className="grow overflow-y-auto no-scrollbar pb-32 px-6 py-8 relative z-10">
        {/* 1. 行程分頁 (Itinerary) */}
        {currentTab === "itinerary" && (
          <div className="animate-fadeIn">
            {/* --- 今日行程簡介 Summary Banner */}
            {currentEvents.length > 0 && (
              <div className="relative overflow-hidden bg-[#1A5276] rounded-4xl p-8 text-white shadow-xl mb-8">
                {/* 背景雪花裝飾 */}
                <div className="absolute -top-4 -right-4 opacity-20 text-7xl rotate-12">
                  <i className="fas fa-snowflake"></i>
                </div>

                <div className="relative z-10">
                  <p className="text-[10px] font-black text-blue-200 uppercase tracking-[0.3em] mb-2 opacity-90">
                    今日行程簡介 · Day {activeDay}
                  </p>
                  <h2 className="text-2xl font-black text-white leading-tight">
                    {currentEvents.length >= 2
                      ? `${currentEvents[0].location} → ${currentEvents[currentEvents.length - 1].location}`
                      : `探索 ${currentEvents[0].location}`}
                  </h2>
                  <div className="mt-4">
                    <span className="text-[10px] bg-white/20 backdrop-blur-md text-white border border-white/20 px-3 py-1.5 rounded-full font-bold uppercase tracking-widest">
                      {currentEvents.length} Stops
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* --- 行程列表 --- */}
            <div className="space-y-6">
              {currentEvents.length > 0 ? (
                currentEvents.map((item, idx) => {
                  const categoryStyles: Record<string, string> = {
                    景點: "text-[#1A5276] bg-blue-50 border-[#1A5276]/20",
                    美食: "text-[#D35400] bg-orange-50 border-[#D35400]/20",
                    交通: "text-slate-600 bg-slate-100 border-slate-200",
                    購物: "text-indigo-600 bg-indigo-50 border-indigo-100",
                  };

                  return (
                    <div key={idx} className="flex gap-4 group">
                      {/* 左側時間 - 加深字體顏色 */}
                      <div className="flex flex-col items-center w-14 shrink-0 pt-2">
                        <div className="text-3xl font-black text-[#1A5276] tabular-nums tracking-tighter leading-none">
                          {item.time.split(":")[0]}
                        </div>
                        <div className="text-[11px] font-black text-blue-500 tabular-nums leading-none mt-1.5">
                          {item.time.split(":")[1]}
                        </div>
                        <div className="w-0.5 grow bg-blue-100/50 my-4 rounded-full"></div>
                      </div>

                      {/* 右側卡片 - 提高對比度與加入電話 */}
                      <div className="bg-white border border-blue-100 rounded-4xl p-6 shadow-[0_10px_25px_-5px_rgba(26,82,118,0.1)] grow relative">
                        <span
                          className={`absolute top-6 right-6 text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg border ${categoryStyles[item.category] || "text-gray-500 bg-gray-50 border-gray-100"}`}
                        >
                          {item.category}
                        </span>

                        <h3 className="font-black text-lg text-slate-900 pr-14 leading-snug mb-4">
                          {item.location}
                        </h3>

                        <div className="space-y-3 mb-6">
                          {item.address && (
                            <div className="flex items-start gap-2 text-[11px] text-slate-600 font-medium">
                              <i className="fas fa-location-arrow mt-0.5 text-[#1A5276]"></i>
                              <span className="leading-tight">
                                {item.address}
                              </span>
                            </div>
                          )}
                          {item.phone && (
                            <div className="flex items-start gap-2 text-[11px] text-slate-600 font-medium">
                              <i className="fas fa-phone mt-0.5 text-emerald-600"></i>
                              <a
                                href={`tel:${item.phone}`}
                                className="underline decoration-emerald-200 font-bold"
                              >
                                {item.phone}
                              </a>
                            </div>
                          )}
                        </div>

                        {item.note && (
                          <div className="mb-6 p-4 bg-slate-50 rounded-2xl border-l-4 border-blue-200">
                            <p className="text-[11px] text-slate-500 font-medium leading-relaxed italic">
                              "{item.note}"
                            </p>
                          </div>
                        )}

                        {/* 操作按鈕 - 深色對比 */}
                        <div className="flex gap-2">
                          <a
                            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.location)}`}
                            target="_blank"
                            rel="noreferrer"
                            className="grow bg-[#1A5276] text-white text-[11px] py-4 rounded-2xl font-black text-center shadow-lg active:bg-blue-800 transition-colors uppercase tracking-widest flex items-center justify-center gap-2"
                          >
                            <i className="fas fa-directions"></i>
                            導航前往
                          </a>
                          <button
                            onClick={() => {
                              if (confirm("確定刪除？"))
                                setSchedule(schedule.filter((s) => s !== item));
                            }}
                            className="w-12 h-12 bg-white border border-slate-100 text-slate-300 rounded-2xl hover:text-red-400 transition-colors flex items-center justify-center"
                          >
                            <i className="fas fa-trash-can text-sm"></i>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-24 text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full shadow-inner mb-4 text-slate-200 text-2xl">
                    <i className="fas fa-snowflake animate-spin-slow"></i>
                  </div>
                  <p className="text-slate-400 font-bold italic text-sm">
                    行程待定
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 2. 天氣分頁 (Weather) */}
        {currentTab === "weather" && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex justify-between items-center mb-6 px-2">
              <h2 className="text-2xl font-black text-[#1A5276]">地區氣候</h2>
              <button
                onClick={() => updateWeather()}
                className="w-12 h-12 bg-white rounded-2xl shadow-sm text-[#1A5276] flex items-center justify-center active:bg-blue-50 transition-colors border border-blue-50"
              >
                <i
                  className={`fas fa-arrows-rotate text-lg ${loading ? "animate-spin" : ""}`}
                ></i>
              </button>
            </div>

            {loading ? (
              <div className="py-32 text-center">
                <div className="w-12 h-12 border-4 border-blue-100 border-t-[#1A5276] rounded-full animate-spin mx-auto mb-6"></div>
                <p className="text-[#1A5276] font-black text-[10px] tracking-widest opacity-60">
                  資料載入中...
                </p>
              </div>
            ) : (
              <div className="grid gap-5">
                {Object.entries(weatherMap).map(([cityName, data]) => (
                  <div
                    key={cityName}
                    className="bg-white border border-blue-100 rounded-[2.5rem] p-7 shadow-[0_10px_25px_-5px_rgba(26,82,118,0.08)] relative overflow-hidden"
                  >
                    {/* 背景裝飾圖標 - 稍微加深透明度確保質感 */}
                    <div
                      className={`absolute -right-4 -bottom-4 opacity-[0.07] text-8xl ${data.color}`}
                    >
                      <i className={`fas ${data.icon}`}></i>
                    </div>

                    <div className="flex justify-between items-center relative z-10">
                      <div className="flex items-center gap-5">
                        <div className="w-16 h-16 bg-blue-50 rounded-3xl flex items-center justify-center text-3xl shadow-inner">
                          <i className={`fas ${data.icon} ${data.color}`}></i>
                        </div>
                        <div>
                          <h3 className="text-xl font-black text-slate-900">
                            {cityName}
                          </h3>
                          <p className="text-[10px] font-black text-[#1A5276] uppercase tracking-widest mt-1 opacity-70">
                            {data.desc}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-5xl font-black text-slate-900 tracking-tighter tabular-nums flex items-start justify-end">
                          {data.temp}
                          <span className="text-2xl text-blue-300 mt-1">°</span>
                        </div>
                        <div className="mt-1 text-[10px] font-black uppercase tracking-tighter flex gap-2 justify-end">
                          <span className="text-red-500">
                            最高: {data.maxTemp}°
                          </span>
                          <span className="text-blue-500">
                            最低: {data.minTemp}°
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 3. 管理分頁 (Manage) */}
        {currentTab === "manage" && (
          <div className="space-y-8 animate-fadeIn">
            <h2 className="text-2xl font-black text-[#1A5276] px-2">
              資料同步
            </h2>

            {/* 主管理面板 - 深色框架 */}
            <div className="bg-[#1A5276] rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden">
              {/* 裝飾背景 */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>

              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-blue-200 border border-white/10">
                    <i className="fas fa-database text-xl"></i>
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-white">備份</h3>
                    <p className="text-[10px] text-blue-200/60 font-medium tracking-wide">
                      目前共有 {schedule.length} 筆行程資料
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* 匯出按鈕 - 淺色高亮 */}
                  <button
                    onClick={handleExport}
                    className="w-full flex items-center justify-between bg-white text-[#1A5276] p-5 rounded-2xl font-black shadow-lg active:scale-[0.98] transition-all group"
                  >
                    <span className="flex items-center gap-4 text-sm uppercase tracking-wider">
                      <i className="fas fa-cloud-arrow-down text-lg"></i>
                      Export CSV
                    </span>
                    <i className="fas fa-chevron-right text-[10px] opacity-30 group-hover:translate-x-1 transition-transform"></i>
                  </button>

                  {/* 匯入按鈕 - 透明邊框 */}
                  <label className="w-full flex items-center justify-between bg-white/10 text-white p-5 rounded-2xl font-black border border-white/20 cursor-pointer active:scale-[0.98] transition-all hover:bg-white/15">
                    <span className="flex items-center gap-4 text-sm uppercase tracking-wider">
                      <i className="fas fa-file-import text-lg text-blue-300"></i>
                      Import CSV
                    </span>
                    <input
                      type="file"
                      accept=".csv"
                      onChange={handleImport}
                      className="hidden"
                    />
                    <i className="fas fa-plus text-[10px] opacity-30"></i>
                  </label>
                </div>
              </div>
            </div>

            {/* 安全區域 */}
            <div className="bg-white/50 border border-red-100 rounded-4xl p-6 text-center">
              <p className="text-[10px] font-black text-red-400 uppercase tracking-[0.2em] mb-4">
                沒事不要亂按
              </p>
              <button
                onClick={() => {
                  if (confirm("這將永久刪除手機上的所有行程，確定嗎？")) {
                    setSchedule([]);
                    alert("資料已清除");
                  }
                }}
                className="text-xs font-black text-red-500/50 hover:text-red-500 underline decoration-red-200 underline-offset-4 transition-colors"
              >
                清除所有行程資料
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Footer Navigation */}
      <footer className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white/70 backdrop-blur-xl border-t border-white/40 flex justify-around py-6 z-40">
        {[
          { id: "itinerary", icon: "fa-map-marked-alt", label: "行程" },
          { id: "weather", icon: "fa-cloud-sun", label: "天氣" },
          { id: "manage", icon: "fa-sliders", label: "管理" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setCurrentTab(tab.id as any)}
            className={`flex flex-col items-center gap-1.5 transition-all ${currentTab === tab.id ? "text-[#1A5276] scale-110" : "text-blue-200"}`}
          >
            <i className={`fas ${tab.icon} text-xl`}></i>
            <span className="text-[9px] font-black uppercase tracking-widest">
              {tab.label}
            </span>
          </button>
        ))}
      </footer>

      <AddEventModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={handleAddEvent}
        activeDay={activeDay}
      />
    </div>
  );
}
