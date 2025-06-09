/**
 * Registers the keep-alive service worker
 * @param {string} serverUrl - The URL of the server to ping
 * @returns {Promise<boolean>} - Whether the service worker was registered successfully
 */
export const registerKeepAliveWorker = async (serverUrl) => {
  if (!("serviceWorker" in navigator)) {
    console.error("Service workers are not supported in this browser");
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.register(
      "/keep-alive-worker.js"
    );
    console.log("Keep-alive service worker registered:", registration);

    // Wait for the service worker to be ready
    await navigator.serviceWorker.ready;

    // Initialize the service worker with the server URL
    if (registration.active) {
      registration.active.postMessage({
        type: "INIT_KEEP_ALIVE",
        serverUrl,
      });
    }

    return true;
  } catch (error) {
    console.error("Error registering keep-alive service worker:", error);
    return false;
  }
};
