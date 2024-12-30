export const sendResponse = (
  res,
  statusCode,
  status,
  message,
  data = null,
  error = null
) => {
  const response = { status, message };
  if (data) response.data = data;
  if (error) response.error = error;

  return res.status(statusCode).json(response);
};
