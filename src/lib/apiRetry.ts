export async function fetchWithRetry(url: string, options: RequestInit, retries: number = 1, delayMs: number = 2000): Promise<Response> {
  try {
    const response = await fetch(url, options);
    if (!response.ok && retries > 0) {
      throw new Error(`API responded with status ${response.status}`);
    }
    return response;
  } catch (error) {
    if (retries > 0) {
      console.warn(`Fetch failed, retrying in ${delayMs}ms... (${retries} retries left)`);
      await new Promise(resolve => setTimeout(resolve, delayMs));
      return fetchWithRetry(url, options, retries - 1, delayMs);
    }
    throw error;
  }
}
