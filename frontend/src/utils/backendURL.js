export const backendURL =
  import.meta.env.MODE === "production"
    ? "https://api.pingbyleo.space"
    : "http://localhost:3000";
