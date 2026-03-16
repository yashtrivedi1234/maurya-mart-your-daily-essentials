const rawApiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5001";

// Avoid accidental double slashes when composing endpoint paths.
export const API_BASE_URL = rawApiBaseUrl.replace(/\/$/, "");
