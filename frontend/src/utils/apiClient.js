const API_URL = (() => {
    if (import.meta.env.DEV === true) {
        return import.meta.env.VITE_DEVELOPMENT_API_URL;
    }
    else if (import.meta.env.DEV === false) {
        return import.meta.env.VITE_PRODUCTION_API_URL;
    }
    else {
        throw new Error('API URL not set.');
    }
})();
export async function apiClient(url, method, body, timeoutMs = 5000) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    try {
        const res = await fetch(`${API_URL}${url}`, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: body ? JSON.stringify(body) : undefined,
            signal: controller.signal,
        });
        clearTimeout(timeout);
        if (!res.ok) {
            const error = await res.json();
            throw new Error(error?.message || 'API error');
        }
        return await res.json();
    }
    catch (err) {
        clearTimeout(timeout);
        if (err.name === 'AbortError') {
            throw new Error('Request timed out');
        }
        console.error('API call failed:', err);
        throw err;
    }
}
