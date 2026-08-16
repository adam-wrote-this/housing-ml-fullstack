import type { ApiErrorPayload } from "@/lib/types";

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export async function requestJson<T>(
  input: string,
  init?: RequestInit
): Promise<T> {
  const response = await fetch(input, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {})
    },
    cache: "no-store"
  });

  if (!response.ok) {
    let message = `Request failed with ${response.status}`;
    try {
      const errorPayload = (await response.json()) as ApiErrorPayload;
      message = errorPayload.detail || errorPayload.message || message;
    } catch {
      // 错误响应不是 JSON 时保留默认消息。
    }
    throw new ApiError(response.status, message);
  }

  return (await response.json()) as T;
}
