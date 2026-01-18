import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // 假設你的倉庫網址是 https://帳號.github.io/japan-trip/
  // 那這裡就要填 '/japan-trip/'。如果是個人主頁則填 './'
  base: "/trip/",
});
