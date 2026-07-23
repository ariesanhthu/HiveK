const DEFAULT_AGENTIC_API_PATH = '/api/ai';

function trimTrailingSlash(value: string): string {
  return value.endsWith('/') ? value.slice(0, -1) : value;
}

export function getAgenticApiUrl(path: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_AGENTIC_API_BASE_URL;
  const basePath = process.env.NEXT_PUBLIC_AGENTIC_API_BASE_PATH ?? DEFAULT_AGENTIC_API_PATH;
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;

  if (baseUrl) return `${trimTrailingSlash(baseUrl)}${normalizedPath}`;
  return `${trimTrailingSlash(basePath)}${normalizedPath}`;
}
