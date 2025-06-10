export const backendURL =
  import.meta.env.MODE === "production"
    ? "https://tracker.pingbyleo.space"
    : "http://localhost:3000";
