export const backendURL =
  import.meta.env.MODE === "production"
    ? "https://pingbyleo.space"
    : "http://localhost:3000";
