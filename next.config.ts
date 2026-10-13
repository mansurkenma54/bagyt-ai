import type { NextConfig } from "next";
const config: NextConfig = {
  serverExternalPackages: [
    "@electric-sql/pglite",
    "tesseract.js",
    "exceljs",
    "pg",
  ],
  outputFileTracingIncludes: {
    "/api/*": [
      "./node_modules/tesseract.js/src/**",
      "./node_modules/tesseract.js-core/**",
      "./node_modules/regenerator-runtime/**",
      "./node_modules/is-url/**",
      "./node_modules/bmp-js/**",
      "./node_modules/zlibjs/**",
      "./node_modules/wasm-feature-detect/**",
    ],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "same-origin" },
        ],
      },
    ];
  },
};
export default config;
