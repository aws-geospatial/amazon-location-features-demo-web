import "@testing-library/jest-dom";
import type { i18n, TFunction } from 'i18next';

// global.importMetaEnv = {
//     VITE_AWS_API_KEYS: "mock-api-keys",
//     VITE_AWS_API_KEY_REGIONS: "mock-regions",
//     VITE_AWS_COGNITO_IDENTITY_POOL_IDS: "mock-identity-pool-ids",
//     VITE_AWS_WEB_SOCKET_URLS: "mock-web-socket-urls"
//   };
  
//   Object.defineProperty(global, "import", {
//       meta: {
//         env: global.importMetaEnv,
//       },
//   });

jest.mock("./src/core/constants/appConfig", () => ({
    getEnv: jest.fn((key) => {
      const mockEnv = {
        VITE_AWS_API_KEYS: "mock-api-key-1,mock-api-key-2",
        VITE_AWS_API_KEY_REGIONS: "us-east-1,us-west-2",
        VITE_AWS_COGNITO_IDENTITY_POOL_IDS: "us-east-1:mock-pool-id-1,us-west-2:mock-pool-id-2",
        VITE_AWS_WEB_SOCKET_URLS: "wss://mock-websocket-url-1,wss://mock-websocket-url-2",
      };
      return mockEnv[key];
    }),
    default: {
      ENV: {
        MIGRATE_FROM_GOOGLE_MAPS_PAGE: 1,
        MIGRATE_A_WEB_APP_PAGE: 1,
        MIGRATE_AN_ANDROID_APP_PAGE: 1,
        MIGRATE_AN_IOS_APP_PAGE: 1,
        MIGRATE_A_WEB_SERVICE_PAGE: 1,
        PRICING_PAGE: 1,
        SHOW_NEW_NAVIGATION: 1,
        PINPOINT_IDENTITY_POOL_ID: "us-east-1:mock-pinpoint-pool-id",
      },
      ROUTES: {
        DEMO: "/demo",
        SAMPLES: "/samples",
        MIGRATE_FROM_GOOGLE_MAPS: "/migrate-from-google-maps",
        MIGRATE_A_WEB_APP: "/migrate-a-web-app",
      },
      LINKS: {
        LEARN_MORE_URL: "https://aws.amazon.com/learn-more",
        AWS_LOCATION_MAPS_URL: "https://aws.amazon.com/location/maps",
        AWS_LOCATION_PLACES_URL: "https://aws.amazon.com/location/places",
        AWS_LOCATION_ROUTES_URL: "https://aws.amazon.com/location/routes",
      },
      PERSIST_STORAGE_KEYS: {
        LOCAL_STORAGE_PREFIX: "mock-local-storage-prefix-",
        ANALYTICS_ENDPOINT_ID: "mock-analytics-endpoint-id",
        ANALYTICS_CREDS: "mock-analytics-creds",
        MAP_DATA: "mock-map-data",
      },
      API_KEYS: {
        "us-east-1": "mock-api-key-1",
        "us-west-2": "mock-api-key-2",
      },
      IDENTITY_POOL_IDS: {
        "us-east-1": "us-east-1:mock-pool-id-1",
        "us-west-2": "us-west-2:mock-pool-id-2",
      },
      WEB_SOCKET_URLS: {
        "us-east-1": "wss://mock-websocket-url-1",
        "us-west-2": "wss://mock-websocket-url-2",
      },
      MAP_RESOURCES: {
        MAP_POLITICAL_VIEWS: ["Political View 1", "Political View 2"],
        AMAZON_HQ: {
          US: {
            latitude: 47.6062,
            longitude: -122.3321,
          },
        },
        MAX_BOUNDS: {
            VANCOUVER: {
              north: 49.2827,
              south: 49.0,
              east: -123.0,
              west: -123.5,
            },
          },
        },
    },
  }));

  // jest.mock("react-i18next", () => ({
  //   useTranslation: () => ({
  //     t: (key: string) => key, // Mock translation function
  //     i18n: {
  //       dir: jest.fn(() => "ltr"),
  //       language: "en"
  //     }
  //   })
  // }));

  jest.mock('@demo/locales/i18n', () => {
    const tMock = ((key: string, options?: Record<string, any>) => {
      // Simple key echo + optional interpolation e.g. hello_name -> "hello name" when { name }
      let result = key;
      if (options) {
        Object.entries(options).forEach(([k, v]) => {
          result = result.replace(new RegExp(`{{\\s*${k}\\s*}}`, 'g'), String(v));
        });
      }
      return result as any;
    }) as unknown as TFunction;
    
    const i18nMock: Partial<i18n> = {
      t: tMock,
      changeLanguage: async () => tMock as TFunction,
      language: 'en',
      on: () => i18nMock as any,
      off: () => i18nMock as any,
    };
    return i18nMock as i18n;
  });

  jest.mock("@turf/turf", () => ({
    bbox: jest.fn(),
    lineString: jest.fn()
  }));

  global.URL.createObjectURL = jest.fn(() => "mock-url");

  jest.mock("@demo/assets/svgs");