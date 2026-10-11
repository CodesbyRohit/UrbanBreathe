// HTTP helper for the API client. Free of imports so it can be unit-tested.

export const DEFAULT_TIMEOUT_MS = 15_000; // server upstream timeout is 8 s

export class ApiError extends Error {
  status: number;
  code?: string;
  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

export interface RequestOptions {
  signal?: AbortSignal;
  timeoutMs?: number;
}

/**
 * fetch + JSON with a timeout that always applies, also when the caller passes
 * its own AbortSignal (previously the caller's signal replaced the timeout).
 * Non-2xx responses throw ApiError with the server's JSON error message if any.
 */
export async function requestJson<T>(url: string, init: RequestInit = {}, options: RequestOptions = {}): Promise<T> {
  const controller = new AbortController();
  let timedOut = false;
  const timeoutId = setTimeout(() => { timedOut = true; controller.abort(); }, options.timeoutMs ?? DEFAULT_TIMEOUT_MS);
  const external = options.signal;
  const forwardAbort = () => controller.abort();
  if (external) {
    if (external.aborted) controller.abort();
    else external.addEventListener('abort', forwardAbort, { once: true });
  }

  try {
    let res: Response;
    try {
      res = await fetch(url, { ...init, signal: controller.signal });
    } catch (err) {
      if (timedOut) throw new ApiError('The request timed out. Please try again.', 0, 'TIMEOUT');
      throw err;
    }
    if (!res.ok) {
      let message = `Request failed (HTTP ${res.status})`;
      let code: string | undefined;
      try {
        const body = await res.json();
        if (body?.error?.message) message = body.error.message;
        code = body?.error?.code;
      } catch {
        // non-JSON error body
      }
      throw new ApiError(message, res.status, code);
    }
    return (await res.json()) as T;
  } finally {
    clearTimeout(timeoutId);
    external?.removeEventListener('abort', forwardAbort);
  }
}
