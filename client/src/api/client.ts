import type { Filters } from './types';

export function buildFilterParams(filters: Filters): URLSearchParams {
  const params = new URLSearchParams();
  if (filters.search) params.set('search', filters.search);
  for (const hobby of filters.hobbies) params.append('hobby', hobby);
  for (const nationality of filters.nationalities) params.append('nationality', nationality);
  return params;
}

export async function fetchJson<T>(url: string, signal?: AbortSignal): Promise<T> {
  const res = await fetch(url, { signal });
  if (!res.ok) {
    let message = `Request failed with status ${res.status}`;
    try {
      const body = (await res.json()) as { error?: string };
      if (body.error) message = body.error;
    } catch {
      // keep the status message
    }
    throw new Error(message);
  }
  return res.json() as Promise<T>;
}
