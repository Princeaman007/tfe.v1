import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "/",
  build: { sourcemap: true },
  resolve: { dedupe: ["react", "react-dom"] },
  plugins: [react()],
});
