// Add this middleware to debug all requests
export const debugMiddleware = (req, res, next) => {
  next();
};
