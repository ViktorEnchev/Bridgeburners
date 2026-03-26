const BASE_URL = import.meta.env.VITE_API_URL as string;
const API_SECRET = import.meta.env.VITE_API_SECRET as string;

type RequestOptions = Omit<RequestInit, "headers"> & {
  headers?: Record<string, string>;
};

export async function api(path: string, options: RequestOptions = {}): Promise<Response> {
  const token = localStorage.getItem("token");

  return fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "x-api-secret": API_SECRET,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
}
