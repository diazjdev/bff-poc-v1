import axios, { AxiosInstance, AxiosRequestConfig } from "axios";
import { config } from "../config";

export interface ProxyOptions {
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  path: string;
  data?: unknown;
  headers?: Record<string, string>;
  params?: Record<string, string>;
}

export async function proxyRequest<T>(
  options: ProxyOptions,
  accessToken?: string
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }

  const requestConfig: AxiosRequestConfig = {
    method: options.method,
    url: `${config.downstream.apiUrl}${options.path}`,
    headers,
    params: options.params,
  };

  if (options.data && ["POST", "PUT", "PATCH"].includes(options.method)) {
    requestConfig.data = options.data;
  }

  const response = await axios.request<T>(requestConfig);
  return response.data;
}
