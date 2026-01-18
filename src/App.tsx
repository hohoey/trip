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

  const prefectures = [
    "北海道",
    "青森県",
    "岩手県",
    "宮城県",
    "秋田県",
    "山形県",
    "福島県",
    "茨城県",
    "栃木県",
    "群馬県",
    "埼玉県",
    "千葉県",
    "東京都",
    "神奈川県",
    "新潟県",
    "富山県",
    "石川県",
    "福井県",
    "山梨県",
    "長野県",
    "岐阜県",
    "静岡県",
    "愛知県",
    "三重県",
    "滋賀県",
    "京都府",
    "大阪府",
    "兵庫県",
    "奈良県",
    "和歌山県",
    "鳥取県",
    "島根県",
    "岡山県",
    "広島県",
    "山口県",
    "徳島県",
    "香川県",
    "愛媛県",
    "高知県",
    "福岡県",
    "佐賀県",
    "長崎県",
    "熊本県",
    "大分県",
    "宮崎県",
    "鹿児島県",
    "沖縄県",
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
      .sort((a, b) => {
        const timeA = parseInt(a.time.replace(":", ""), 10);
        const timeB = parseInt(b.time.replace(":", ""), 10);
        return timeA - timeB;
      });
  }, [schedule, activeDay]); // 僅在行程內容或切換天數時才重新排序

  const travelRoute = useMemo(() => {
    if (currentEvents.length === 0) return { start: "京都", end: "京都" };

    const getArea = (item: TripEvent) => {
      const text = (item.address || "") + (item.location || "");
      const found = prefectures.find((p) => text.includes(p));
      // 如果地址沒寫縣市，就回傳地點名稱的前兩個字，或是預設值
      return found || item.location.substring(0, 2);
    };

    return {
      start: getArea(currentEvents[0]),
      end: getArea(currentEvents[currentEvents.length - 1]),
    };
  }, [currentEvents]);

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
            {/* --- 今日行程簡介 Summary Banner --- */}
            {currentEvents.length > 0 && (
              <div className="relative overflow-hidden bg-[#1A5276] rounded-[2.5rem] p-8 text-white shadow-2xl mb-8">
                {/* 右上角裝飾 */}
                <div className="absolute -top-6 -right-6 opacity-10 text-9xl rotate-12 pointer-events-none">
                  <i className="fas fa-map-location-dot"></i>
                </div>

                <div className="relative z-10">
                  {/* 頂部輔助資訊 */}
                  <div className="flex items-center gap-2 mb-4">
                    <span className="bg-blue-400/30 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] font-black tracking-widest border border-white/10">
                      今日行程簡介
                    </span>
                    <p className="text-[10px] font-bold text-blue-200 uppercase tracking-[0.2em]">
                      Day {activeDay}
                    </p>
                  </div>

                  {/* 主標題：地區路徑 */}
                  <h2 className="text-3xl font-black text-white leading-none mb-6 tracking-tighter">
                    {currentEvents.length >= 2 &&
                    travelRoute.start !== travelRoute.end ? (
                      <div className="flex items-center gap-4">
                        <span>{travelRoute.start}</span>
                        <i className="fas fa-chevron-right text-lg text-blue-400/50"></i>
                        <span>{travelRoute.end}</span>
                      </div>
                    ) : (
                      `探索 ${travelRoute.start}`
                    )}
                  </h2>

                  {/* 底部數據 */}
                  <div className="flex items-center gap-4 text-blue-100/80">
                    <div className="flex items-center gap-1.5">
                      <i className="fas fa-flag-checkered text-[10px]"></i>
                      <span className="text-[11px] font-black uppercase tracking-widest">
                        {currentEvents.length} Stops
                      </span>
                    </div>
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
                    住宿: "text-emerald-600 bg-emerald-50 border-emerald-100",
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
                            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                              item.address || item.location,
                            )}`}
                            target="_blank"
                            rel="noreferrer"
                            className="grow bg-[#1A5276] text-white text-[11px] py-4 rounded-2xl font-black text-center shadow-lg active:scale-95 transition-all uppercase tracking-widest flex items-center justify-center gap-2"
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
          <div className="space-y-6 animate-fadeIn pb-10">
            <div className="flex justify-between items-center px-2">
              <h2 className="text-2xl font-black text-[#1A5276]">
                地區氣候詳情
              </h2>
              <button
                onClick={() => updateWeather()}
                className="w-12 h-12 bg-white rounded-2xl shadow-sm text-[#1A5276] flex items-center justify-center border border-blue-50"
              >
                <i
                  className={`fas fa-arrows-rotate ${loading ? "animate-spin" : ""}`}
                ></i>
              </button>
            </div>

            {loading ? (
              <div className="py-32 text-center text-[#1A5276] font-black opacity-40">
                LOADING...
              </div>
            ) : (
              <div className="grid gap-6">
                {Object.entries(weatherMap).map(([cityName, data]) => (
                  <div
                    key={cityName}
                    className="bg-white border border-blue-100 rounded-[2.5rem] p-7 shadow-xl relative overflow-hidden"
                  >
                    {/* 標題與主要溫度 */}
                    <div className="flex justify-between items-start mb-6 relative z-10">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-3xl shadow-inner">
                          <i className={`fas ${data.icon} ${data.color}`}></i>
                        </div>
                        <div>
                          <h3 className="text-xl font-black text-slate-900">
                            {cityName}
                          </h3>

                          <p className="text-[10px] font-black text-[#1A5276] uppercase tracking-widest">
                            {data.desc}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-bold text-slate-400">
                          現時
                        </p>
                        <div className="text-5xl font-black text-slate-900 tracking-tighter tabular-nums flex">
                          {data.temp}
                          <span className="text-2xl text-blue-300 mt-1">°</span>
                        </div>
                        <p className="text-[10px] font-bold text-slate-400">
                          體感 {data.feelsLike}°
                        </p>
                      </div>
                    </div>

                    {/* 詳細資訊網格 - 顯示所有新抓取的資料 */}
                    <div className="grid grid-cols-2 gap-3 relative z-10">
                      {/* 高低溫 */}
                      <div className="bg-slate-50/80 rounded-2xl p-4 border border-white">
                        <p className="text-[9px] font-black text-slate-400 uppercase mb-1">
                          溫度範圍
                        </p>
                        <div className="flex justify-between items-center font-black text-[12px]">
                          <span className="text-red-500">
                            最高: {data.maxTemp}°
                          </span>
                          <span className="text-blue-500">
                            最低: {data.minTemp}°
                          </span>
                        </div>
                      </div>

                      {/* 降雨機率 */}
                      <div className="bg-slate-50/80 rounded-2xl p-4 border border-white">
                        <p className="text-[9px] font-black text-slate-400 uppercase mb-1">
                          降雨機率
                        </p>
                        <div className="flex items-center gap-2 font-black text-[12px] text-blue-600">
                          <i className="fas fa-droplet text-[10px]"></i>
                          {data.rainProb}%
                        </div>
                      </div>

                      {/* 風速 */}
                      <div className="bg-slate-50/80 rounded-2xl p-4 border border-white">
                        <p className="text-[9px] font-black text-slate-400 uppercase mb-1">
                          風速
                        </p>
                        <div className="flex items-center gap-2 font-black text-[12px] text-slate-700">
                          <i className="fas fa-wind text-[10px]"></i>
                          {data.wind} km/h
                        </div>
                      </div>

                      {/* 日出日落 */}
                      <div className="bg-slate-50/80 rounded-2xl p-4 border border-white">
                        <p className="text-[9px] font-black text-slate-400 uppercase mb-1">
                          日出 / 日落
                        </p>
                        <div className="flex items-center gap-2 font-black text-[10px] text-orange-600">
                          <i className="fas fa-sun text-[10px]"></i>
                          {data.sunrise} / {data.sunset}
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
