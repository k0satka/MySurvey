const JSON_HEADERS = {
  "Content-Type": "application/json",
};

// All frontend API helpers use this error type so pages can show consistent messages.
export class ApiError extends Error {
  constructor(message, status, payload) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.payload = payload;
  }
}

export async function request(path, options = {}) {
  // Use relative /api paths; Vite proxies them in dev and Nginx proxies them in production.
  const { method = "GET", body, token } = options;
  const headers = {
    ...(body ? JSON_HEADERS : {}),
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(path, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const raw = await response.text();
  let payload = null;

  if (raw) {
    try {
      payload = JSON.parse(raw);
    } catch {
      payload = null;
    }
  }

  if (!response.ok) {
    throw new ApiError(
      payload?.message || "Request failed",
      response.status,
      payload,
    );
  }

  return payload;
}
