// vite.config.ts
import { defineConfig } from "file:///F:/scada-engine/node_modules/vite/dist/node/index.js";
import vue from "file:///F:/scada-engine/node_modules/@vitejs/plugin-vue/dist/index.mjs";
import { resolve } from "path";
import dts from "file:///F:/scada-engine/node_modules/vite-plugin-dts/dist/index.mjs";
import prefixSelector from "file:///F:/scada-engine/node_modules/postcss-prefix-selector/index.js";
import { readFileSync } from "fs";
var __vite_injected_original_dirname = "F:\\scada-engine";
var pkg = JSON.parse(readFileSync("./package.json", "utf-8"));
var banner = `/*!
 * @nywqs/scada-engine v${pkg.version}
 * Copyright (c) 2025 leoncheng
 * Licensed under proprietary license - see LICENSE file
 * Contact: nywqs@outlook.com
 */`;
var vite_config_default = defineConfig({
  plugins: [
    vue(),
    dts({
      include: ["src/**/*.ts", "src/**/*.vue"],
      outDir: "dist",
      insertTypesEntry: true,
      cleanVueFileName: true,
      // 忽略 Vue 组件的类型声明警告
      logLevel: "silent",
      compilerOptions: {
        skipLibCheck: true,
        noEmitOnError: false,
        // @ts-ignore 警告
        suppressWarnings: true,
        // 忽略 TS4094 错误
        suppressExcessPropertyErrors: true
      }
    })
  ],
  resolve: {
    alias: {
      "@": resolve(__vite_injected_original_dirname, "src")
    }
  },
  server: {
    port: 3e3,
    host: "0.0.0.0"
  },
  css: {
    postcss: {
      plugins: [
        prefixSelector({
          prefix: "[data-scada-theme]",
          transform: (prefix, selector, prefixedSelector) => {
            if (selector.match(/^(html|body|#app)([s,]|$)/)) {
              return selector;
            }
            if (selector.includes("[data-scada-theme")) {
              return selector;
            }
            if (selector.includes("[data-v-")) {
              return selector;
            }
            if (selector.includes(".scada-layout")) {
              return selector;
            }
            if (selector.startsWith(".x6-")) {
              return selector;
            }
            return prefixedSelector;
          }
        })
      ]
    }
  },
  build: {
    lib: {
      entry: resolve(__vite_injected_original_dirname, "src/index.ts"),
      name: "ScadaEngine",
      fileName: (format) => `scada-engine.${format}.js`,
      formats: ["es", "umd"]
    },
    rollupOptions: {
      // 外部化依赖，不打包进库
      external: ["vue", "vue-router", "@antv/x6", "@antv/x6-plugin-selection", "@antv/x6-plugin-snapline", "echarts", "pinia", "@vueuse/core"],
      output: {
        exports: "named",
        // 添加版权信息
        banner,
        // 为外部化的依赖提供全局变量
        globals: {
          vue: "Vue",
          "vue-router": "VueRouter",
          "@antv/x6": "X6",
          "@antv/x6-plugin-selection": "X6PluginSelection",
          "@antv/x6-plugin-snapline": "X6PluginSnapline",
          echarts: "echarts",
          pinia: "Pinia",
          "@vueuse/core": "VueUse"
        },
        // 导出 CSS
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === "style.css") {
            return "scada-engine.css";
          }
          return assetInfo.name || "";
        }
      }
    }
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJGOlxcXFxzY2FkYS1lbmdpbmVcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkY6XFxcXHNjYWRhLWVuZ2luZVxcXFx2aXRlLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vRjovc2NhZGEtZW5naW5lL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZSdcclxuaW1wb3J0IHZ1ZSBmcm9tICdAdml0ZWpzL3BsdWdpbi12dWUnXHJcbmltcG9ydCB7IHJlc29sdmUgfSBmcm9tICdwYXRoJ1xyXG5pbXBvcnQgZHRzIGZyb20gJ3ZpdGUtcGx1Z2luLWR0cydcclxuaW1wb3J0IHByZWZpeFNlbGVjdG9yIGZyb20gJ3Bvc3Rjc3MtcHJlZml4LXNlbGVjdG9yJ1xyXG5pbXBvcnQgeyByZWFkRmlsZVN5bmMgfSBmcm9tICdmcydcclxuXHJcbmNvbnN0IHBrZyA9IEpTT04ucGFyc2UocmVhZEZpbGVTeW5jKCcuL3BhY2thZ2UuanNvbicsICd1dGYtOCcpKVxyXG5cclxuY29uc3QgYmFubmVyID0gYC8qIVxyXG4gKiBAbnl3cXMvc2NhZGEtZW5naW5lIHYke3BrZy52ZXJzaW9ufVxyXG4gKiBDb3B5cmlnaHQgKGMpIDIwMjUgbGVvbmNoZW5nXHJcbiAqIExpY2Vuc2VkIHVuZGVyIHByb3ByaWV0YXJ5IGxpY2Vuc2UgLSBzZWUgTElDRU5TRSBmaWxlXHJcbiAqIENvbnRhY3Q6IG55d3FzQG91dGxvb2suY29tXHJcbiAqL2BcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyh7XHJcblx0cGx1Z2luczogW1xyXG5cdFx0dnVlKCksXHJcblx0XHRkdHMoe1xyXG5cdFx0XHRpbmNsdWRlOiBbJ3NyYy8qKi8qLnRzJywgJ3NyYy8qKi8qLnZ1ZSddLFxyXG5cdFx0XHRvdXREaXI6ICdkaXN0JyxcclxuXHRcdFx0aW5zZXJ0VHlwZXNFbnRyeTogdHJ1ZSxcclxuXHRcdFx0Y2xlYW5WdWVGaWxlTmFtZTogdHJ1ZSxcclxuXHRcdFx0Ly8gXHU1RkZEXHU3NTY1IFZ1ZSBcdTdFQzRcdTRFRjZcdTc2ODRcdTdDN0JcdTU3OEJcdTU4RjBcdTY2MEVcdThCNjZcdTU0NEFcclxuXHRcdFx0bG9nTGV2ZWw6ICdzaWxlbnQnLFxyXG5cdFx0XHRjb21waWxlck9wdGlvbnM6IHtcclxuXHRcdFx0XHRza2lwTGliQ2hlY2s6IHRydWUsXHJcblx0XHRcdFx0bm9FbWl0T25FcnJvcjogZmFsc2UsXHJcblx0XHRcdFx0Ly8gQHRzLWlnbm9yZSBcdThCNjZcdTU0NEFcclxuXHRcdFx0XHRzdXBwcmVzc1dhcm5pbmdzOiB0cnVlLFxyXG5cdFx0XHRcdC8vIFx1NUZGRFx1NzU2NSBUUzQwOTQgXHU5NTE5XHU4QkVGXHJcblx0XHRcdFx0c3VwcHJlc3NFeGNlc3NQcm9wZXJ0eUVycm9yczogdHJ1ZVxyXG5cdFx0XHR9XHJcblx0XHR9KVxyXG5cdF0sXHJcblx0cmVzb2x2ZToge1xyXG5cdFx0YWxpYXM6IHtcclxuXHRcdFx0J0AnOiByZXNvbHZlKF9fZGlybmFtZSwgJ3NyYycpXHJcblx0XHR9XHJcblx0fSxcclxuXHRzZXJ2ZXI6IHtcclxuXHRcdHBvcnQ6IDMwMDAsXHJcblx0XHRob3N0OiAnMC4wLjAuMCdcclxuXHR9LFxyXG5cdGNzczoge1xyXG5cdFx0cG9zdGNzczoge1xyXG5cdFx0XHRwbHVnaW5zOiBbXHJcblx0XHRcdFx0cHJlZml4U2VsZWN0b3Ioe1xyXG5cdFx0XHRcdFx0cHJlZml4OiAnW2RhdGEtc2NhZGEtdGhlbWVdJyxcclxuXHRcdFx0XHRcdHRyYW5zZm9ybTogKHByZWZpeCwgc2VsZWN0b3IsIHByZWZpeGVkU2VsZWN0b3IpID0+IHtcclxuXHRcdFx0XHRcdFx0Ly8gXHU2MzkyXHU5NjY0XHU1N0ZBXHU3ODQwXHU1MTY4XHU1QzQwXHU5MDA5XHU2MkU5XHU1NjY4KGh0bWwsIGJvZHksICNhcHApXHJcblx0XHRcdFx0XHRcdGlmIChzZWxlY3Rvci5tYXRjaCgvXihodG1sfGJvZHl8I2FwcCkoW3MsXXwkKS8pKSB7XHJcblx0XHRcdFx0XHRcdFx0cmV0dXJuIHNlbGVjdG9yXHJcblx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFx0Ly8gXHU1OTgyXHU2NzlDXHU5MDA5XHU2MkU5XHU1NjY4XHU1REYyXHU1MzA1XHU1NDJCIGRhdGEtc2NhZGEtdGhlbWUsXHU3NkY0XHU2M0E1XHU4RkQ0XHU1NkRFXHJcblx0XHRcdFx0XHRcdGlmIChzZWxlY3Rvci5pbmNsdWRlcygnW2RhdGEtc2NhZGEtdGhlbWUnKSkge1xyXG5cdFx0XHRcdFx0XHRcdHJldHVybiBzZWxlY3RvclxyXG5cdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcdC8vIFx1NjM5Mlx1OTY2NCBzY29wZWQgXHU2ODM3XHU1RjBGKFx1NTMwNVx1NTQyQiBkYXRhLXYtIFx1NzY4NFx1OTAwOVx1NjJFOVx1NTY2OClcclxuXHRcdFx0XHRcdFx0aWYgKHNlbGVjdG9yLmluY2x1ZGVzKCdbZGF0YS12LScpKSB7XHJcblx0XHRcdFx0XHRcdFx0cmV0dXJuIHNlbGVjdG9yXHJcblx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFx0Ly8gLnNjYWRhLWxheW91dCBcdTY3MkNcdThFQUJcdTUzQ0FcdTUxNzZcdTVCNTBcdTkwMDlcdTYyRTlcdTU2NjhcdTRFMERcdTk3MDBcdTg5ODFcdTZERkJcdTUyQTBcdTUyNERcdTdGMDBcclxuXHRcdFx0XHRcdFx0aWYgKHNlbGVjdG9yLmluY2x1ZGVzKCcuc2NhZGEtbGF5b3V0JykpIHtcclxuXHRcdFx0XHRcdFx0XHRyZXR1cm4gc2VsZWN0b3JcclxuXHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0XHQvLyBYNiBcdTc2RjhcdTUxNzNcdTY4MzdcdTVGMEZcdTVERjJcdTdFQ0ZcdTU3Mjggc3R5bGUuY3NzIFx1NEUyRFx1NjI0Qlx1NTJBOFx1NTkwNFx1NzQwNlx1RkYwQ1x1NEUwRFx1OTcwMFx1ODk4MVx1NTI0RFx1N0YwMFxyXG5cdFx0XHRcdFx0XHRpZiAoc2VsZWN0b3Iuc3RhcnRzV2l0aCgnLng2LScpKSB7XHJcblx0XHRcdFx0XHRcdFx0cmV0dXJuIHNlbGVjdG9yXHJcblx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFx0Ly8gXHU1MTc2XHU0RUQ2XHU1MTY4XHU1QzQwXHU2ODM3XHU1RjBGXHU2REZCXHU1MkEwXHU1MjREXHU3RjAwXHJcblx0XHRcdFx0XHRcdHJldHVybiBwcmVmaXhlZFNlbGVjdG9yXHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0fSlcclxuXHRcdFx0XVxyXG5cdFx0fVxyXG5cdH0sXHJcblx0YnVpbGQ6IHtcclxuXHRcdGxpYjoge1xyXG5cdFx0XHRlbnRyeTogcmVzb2x2ZShfX2Rpcm5hbWUsICdzcmMvaW5kZXgudHMnKSxcclxuXHRcdFx0bmFtZTogJ1NjYWRhRW5naW5lJyxcclxuXHRcdFx0ZmlsZU5hbWU6IChmb3JtYXQpID0+IGBzY2FkYS1lbmdpbmUuJHtmb3JtYXR9LmpzYCxcclxuXHRcdFx0Zm9ybWF0czogWydlcycsICd1bWQnXVxyXG5cdFx0fSxcclxuXHRcdHJvbGx1cE9wdGlvbnM6IHtcclxuXHRcdFx0Ly8gXHU1OTE2XHU5MEU4XHU1MzE2XHU0RjlEXHU4RDU2XHVGRjBDXHU0RTBEXHU2MjUzXHU1MzA1XHU4RkRCXHU1RTkzXHJcblx0XHRcdGV4dGVybmFsOiBbJ3Z1ZScsICd2dWUtcm91dGVyJywgJ0BhbnR2L3g2JywgJ0BhbnR2L3g2LXBsdWdpbi1zZWxlY3Rpb24nLCAnQGFudHYveDYtcGx1Z2luLXNuYXBsaW5lJywgJ2VjaGFydHMnLCAncGluaWEnLCAnQHZ1ZXVzZS9jb3JlJ10sXHJcblx0XHRcdG91dHB1dDoge1xyXG5cdFx0XHRcdGV4cG9ydHM6ICduYW1lZCcsXHJcblx0XHRcdFx0Ly8gXHU2REZCXHU1MkEwXHU3MjQ4XHU2NzQzXHU0RkUxXHU2MDZGXHJcblx0XHRcdFx0YmFubmVyLFxyXG5cdFx0XHRcdC8vIFx1NEUzQVx1NTkxNlx1OTBFOFx1NTMxNlx1NzY4NFx1NEY5RFx1OEQ1Nlx1NjNEMFx1NEY5Qlx1NTE2OFx1NUM0MFx1NTNEOFx1OTFDRlxyXG5cdFx0XHRcdGdsb2JhbHM6IHtcclxuXHRcdFx0XHRcdHZ1ZTogJ1Z1ZScsXHJcblx0XHRcdFx0XHQndnVlLXJvdXRlcic6ICdWdWVSb3V0ZXInLFxyXG5cdFx0XHRcdFx0J0BhbnR2L3g2JzogJ1g2JyxcclxuXHRcdFx0XHRcdCdAYW50di94Ni1wbHVnaW4tc2VsZWN0aW9uJzogJ1g2UGx1Z2luU2VsZWN0aW9uJyxcclxuXHRcdFx0XHRcdCdAYW50di94Ni1wbHVnaW4tc25hcGxpbmUnOiAnWDZQbHVnaW5TbmFwbGluZScsXHJcblx0XHRcdFx0XHRlY2hhcnRzOiAnZWNoYXJ0cycsXHJcblx0XHRcdFx0XHRwaW5pYTogJ1BpbmlhJyxcclxuXHRcdFx0XHRcdCdAdnVldXNlL2NvcmUnOiAnVnVlVXNlJ1xyXG5cdFx0XHRcdH0sXHJcblx0XHRcdFx0Ly8gXHU1QkZDXHU1MUZBIENTU1xyXG5cdFx0XHRcdGFzc2V0RmlsZU5hbWVzOiAoYXNzZXRJbmZvKSA9PiB7XHJcblx0XHRcdFx0XHRpZiAoYXNzZXRJbmZvLm5hbWUgPT09ICdzdHlsZS5jc3MnKSB7XHJcblx0XHRcdFx0XHRcdHJldHVybiAnc2NhZGEtZW5naW5lLmNzcydcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdHJldHVybiBhc3NldEluZm8ubmFtZSB8fCAnJ1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdH1cclxufSlcclxuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUFtTyxTQUFTLG9CQUFvQjtBQUNoUSxPQUFPLFNBQVM7QUFDaEIsU0FBUyxlQUFlO0FBQ3hCLE9BQU8sU0FBUztBQUNoQixPQUFPLG9CQUFvQjtBQUMzQixTQUFTLG9CQUFvQjtBQUw3QixJQUFNLG1D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
