export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: "/api/auth/login",
  },

  USER: {
    PROFILE: "/api/ecom/user/get-profile",
  },

  EVENT: {
    CREATE: "/api/events",
    UPDATE: (id: number) => `/api/events/${id}`,
    DELETE: (id: number) => `/api/events/${id}`,
  },
} as const;
