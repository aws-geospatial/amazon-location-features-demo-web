import "@testing-library/jest-dom";

global.importMetaEnv = {
    VITE_API_KEY: "mock-api-key", // Add your mock environment variables here
    VITE_API_URL: "http://localhost",
  };
  
  Object.defineProperty(global, "import", {
    value: {
      meta: {
        env: global.importMetaEnv,
      },
    },
  });