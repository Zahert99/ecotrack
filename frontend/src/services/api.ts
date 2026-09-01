import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_URL) {
  throw new Error("NEXT_PUBLIC_API_URL is not set");
}

const TOKEN_STORAGE_KEY = "ecotrack_token";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_STORAGE_KEY);
}

export function setToken(token: string): void {
  window.localStorage.setItem(TOKEN_STORAGE_KEY, token);
}

export function clearToken(): void {
  window.localStorage.removeItem(TOKEN_STORAGE_KEY);
}

export class ApiError extends Error {
  status: number;
  code: string;
  issues?: unknown[];

  constructor(status: number, code: string, message: string, issues?: unknown[]) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.issues = issues;
  }
}

type UnauthorizedHandler = () => void;
let unauthorizedHandler: UnauthorizedHandler | null = null;

export function onUnauthorized(handler: UnauthorizedHandler): void {
  unauthorizedHandler = handler;
}

interface ApiErrorBody {
  error: {
    message: string;
    code: string;
    issues?: unknown[];
  };
}

const client = axios.create({ baseURL: API_URL });

client.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.set("Authorization", `Bearer ${token}`);
  }
  return config;
});

interface ApiRequestOptions {
  method?: string;
  data?: unknown;
}

export async function apiRequest<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  try {
    const response = await client.request<{ data: T }>({
      url: path,
      method: options.method ?? "GET",
      data: options.data,
    });

    if (response.status === 204) {
      return undefined as T;
    }

    return response.data.data;
  } catch (err) {
    if (axios.isAxiosError(err) && err.response) {
      const { message, code, issues } = (err.response.data as ApiErrorBody).error;
      if (err.response.status === 401) {
        clearToken();
        unauthorizedHandler?.();
      }
      throw new ApiError(err.response.status, code, message, issues);
    }
    throw err;
  }
}
