import { Platform } from "react-native";

export function getBaseURL() {
  // Ưu tiên ENV nếu có (dễ chuyển IP LAN khi test device thật)
//  if (process.env.API_BASE_URL) return process.env.API_BASE_URL;

  if (Platform.OS === "ios") return "http://127.0.0.1:8000";     
  return "http://10.0.2.2:8000";                                 
}

export async function postJSON<T>(path: string, body: unknown, ms = 10000): Promise<T> {
  const url = `${getBaseURL()}${path}`;
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), ms);

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(json?.message || `HTTP ${res.status}`);
    }
    return json as T;
  } finally {
    clearTimeout(id);
  }
}
