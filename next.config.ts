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
      "./node_modules/tesseract.js/src/worker-script/**",
      "./node_modules/tesseract.js-core/**",
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
