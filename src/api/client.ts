const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, '') ?? 'http://10.0.2.2:3000/api/v1';

type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'DELETE';

type RequestOptions = {
  method?: HttpMethod;
  token?: string | null;
  body?: unknown;
};

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const url = `${API_BASE_URL}${path}`;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (options.token) {
    headers.Authorization = `Bearer ${options.token}`;
  }

  let response: Response;
  try {
    response = await fetch(url, {
      method: options.method ?? 'GET',
      headers,
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    });
  } catch {
    throw new ApiError(`Network error while calling ${url}`, 0);
  }

  let data: { message?: string; data?: T } = {};
  try {
    data = (await response.json()) as { message?: string; data?: T };
  } catch {
    data = {};
  }

  if (!response.ok) {
    throw new ApiError(data.message ?? 'Request failed', response.status);
  }

  if (data.data === undefined) {
    return {} as T;
  }

  return data.data;
}

export { API_BASE_URL };
