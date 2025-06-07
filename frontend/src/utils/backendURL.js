export const backendURL =
  import.meta.env.MODE === "production"
    ? "https://tracker-8g9y.onrender.com"
    : "http://localhost:3000";
