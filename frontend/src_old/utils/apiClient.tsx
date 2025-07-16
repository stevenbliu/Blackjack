const API_URL = (() => {
    if (import.meta.env.DEV === true) {
        console.log("Development mode detected. Using development API URL.");
        return import.meta.env.VITE_DEVELOPMENT_API_URL;
    } else if (import.meta.env.DEV === false) {
        console.log("Production mode detected. Using production API URL.");
        return import.meta.env.VITE_PRODUCTION_API_URL;
    } else {
        throw new Error(`API URL not set. Please check your environment variables. DEV Enabled: ${import.meta.env.DEV}`);
    }
})();


export async function apiClient<T = any>(
  url: string,
  method: "GET" | "POST" | "PUT" | "DELETE",
  body?: any,
  timeoutMs = 5000 // default 5 seconds
): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(`${API_URL}${url}`, {
      method,
      headers: { "Content-Type": "application/json" },
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error?.message || "API error");
    }

    return await res.json();  // Return the response body
  } catch (err: any) {
    clearTimeout(timeout);

    if (err.name === "AbortError") {
      throw new Error("Request timed out");
    }

    // If response fails, you can log the error or send a custom fallback response
    console.error("API call failed:", err);
    throw err;
  }
}
