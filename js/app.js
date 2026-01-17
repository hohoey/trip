/**
 * 2月京阪四國之旅 - 主程式邏輯
 */
function travelApp() {
  return {
    activeDay: 1,
    currentTab: "itinerary", // 可選: itinerary, weather, manage
    showModal: false,

    // 天氣資料狀態
    weather: {
      temp: 0,
      feelsLike: 0,
      desc: "載入中...",
      icon: "fas fa-circle-notch fa-spin",
      rainProb: 0,
      wind: 0,
      maxTemp: 0,
      minTemp: 0,
      sunrise: "--:--",
      sunset: "--:--",
    },

    // 新增行程的表單暫存
    form: { day: 1, time: "10:00", location: "", category: "景點", note: "" },

    // 從 localStorage 讀取資料，若無則為空陣列
    schedule: JSON.parse(localStorage.getItem("japan_2026_data")) || [],

    /**
     * 初始化
     */
    init() {
      // 監聽 schedule 變化並存檔
      this.$watch("schedule", (val) => {
        localStorage.setItem("japan_2026_data", JSON.stringify(val));
      });
      // 首次加載天氣
      this.updateWeather();
    },

    /**
     * 依據 Day 取得日期字串 (2/10 開始)
     */
    getDayDate(n) {
      const startDate = new Date(2026, 1, 10); // 月份從0開始，1代表2月
      startDate.setDate(startDate.getDate() + (n - 1));
      return `${startDate.getMonth() + 1}/${startDate.getDate()}`;
    },

    /**
     * 計算當前城市 (Day 2-6 為四國)
     */
    get currentCity() {
      const itineraryMap = {
        1: "京都 · Kyoto",
        2: "四國 · Shikoku",
        3: "四國 · Shikoku",
        4: "四國 · Shikoku",
        5: "四國 · Shikoku",
        6: "四國 · Shikoku",
        7: "京都 · Kyoto",
        8: "京都 · Kyoto",
        9: "京都 · Kyoto",
        10: "京都 · Kyoto",
      };
      return itineraryMap[this.activeDay] || "京都 · Kyoto";
    },

    /**
     * 篩選當前選擇天數的行程
     */
    get currentEvents() {
      return this.schedule
        .filter((e) => e.day === this.activeDay)
        .sort((a, b) => a.time.localeCompare(b.time));
    },

    /**
     * 調用天氣模組更新資料
     */
    async updateWeather() {
      this.weather = await WeatherService.getForecast(this.currentCity);
    },

    /**
     * 新增行程
     */
    saveEvent() {
      if (!this.form.location) return alert("請輸入地點");
      this.form.day = this.activeDay; // 自動帶入當前選擇的天數
      this.schedule.push({ ...this.form });

      // 重置表單並關閉 Modal
      this.form.location = "";
      this.form.note = "";
      this.showModal = false;
    },

    /**
     * 刪除行程
     */
    deleteEvent(index) {
      const target = this.currentEvents[index];
      this.schedule = this.schedule.filter((e) => e !== target);
    },

    /**
     * 匯出 CSV (支援 Excel UTF-8)
     */
    exportCSV() {
      if (this.schedule.length === 0) return alert("目前沒有行程可以導出");

      const headers = ["Day", "Time", "Location", "Category", "Note"];
      const csvRows = [headers.join(",")];

      this.schedule.forEach((item) => {
        const row = [
          item.day,
          `"${item.time}"`,
          `"${item.location}"`,
          `"${item.category}"`,
          `"${item.note || ""}"`,
        ];
        csvRows.push(row.join(","));
      });

      const csvString = "\uFEFF" + csvRows.join("\n"); // 加入 BOM 確保 Excel 開啟不亂碼
      const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `Japan_Trip_2026_Backup.csv`;
      link.click();
    },

    /**
     * 匯入 CSV
     */
    importCSV(event) {
      const file = event.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const text = e.target.result;
          const lines = text.split(/\r?\n/);
          const newEvents = [];

          for (let i = 1; i < lines.length; i++) {
            if (!lines[i].trim()) continue;
            // 簡單的 CSV 解析處理 (針對引號)
            const cleanCols = lines[i]
              .split(",")
              .map((c) => c.replace(/^"|"$/g, "").trim());

            if (cleanCols.length >= 3) {
              newEvents.push({
                day: parseInt(cleanCols[0]),
                time: cleanCols[1],
                location: cleanCols[2],
                category: cleanCols[3] || "景點",
                note: cleanCols[4] || "",
              });
            }
          }

          if (newEvents.length > 0) {
            if (
              confirm(`讀取到 ${newEvents.length} 筆行程，是否覆蓋現有資料？`)
            ) {
              this.schedule = newEvents;
              alert("匯入成功！");
              this.currentTab = "itinerary";
            }
          }
        } catch (err) {
          alert("檔案讀取失敗，請確認格式是否正確");
        }
      };
      reader.readAsText(file);
    },
  };
}
