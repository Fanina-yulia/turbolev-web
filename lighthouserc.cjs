module.exports = {
  ci: {
    collect: {
      startServerCommand: "npm run start -- --hostname 127.0.0.1 --port 3000",
      startServerReadyPattern: "Ready",
      startServerReadyTimeout: 30000,
      url: [
        "http://127.0.0.1:3000/",
        "http://127.0.0.1:3000/poslugy",
        "http://127.0.0.1:3000/zapchastyny",
      ],
      numberOfRuns: 2,
      settings: {
        chromeFlags: "--no-sandbox --headless=new",
      },
    },
    assert: {
      assertions: {
        "largest-contentful-paint": ["error", { maxNumericValue: 2500 }],
        "cumulative-layout-shift": ["error", { maxNumericValue: 0.1 }],
        "total-blocking-time": ["warn", { maxNumericValue: 300 }],
        "errors-in-console": "error",
      },
    },
    upload: {
      target: "temporary-public-storage",
    },
  },
};
