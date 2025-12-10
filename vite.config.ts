import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { cloudflare } from "@cloudflare/vite-plugin";
import { mochaPlugins } from "@getmocha/vite-plugins";

export default defineConfig(({ mode }) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const isProd = mode === 'production' || process.env.NODE_ENV === 'production';
  const plugins = [...mochaPlugins(process.env as any), react()];
  // Only add cloudflare plugin for production builds to avoid pre-bundling worker during dev
  if (isProd) plugins.push(cloudflare());

  return {
    plugins,
    server: {
      allowedHosts: true,
    },
    build: {
      chunkSizeWarningLimit: 5000,
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});
