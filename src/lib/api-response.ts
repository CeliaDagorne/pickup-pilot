export async function readJsonResponse<T>(res: Response): Promise<T> {
  const text = await res.text();
  if (!text) {
    throw new Error(`Empty response (${res.status})`);
  }
  try {
    return JSON.parse(text) as T;
  } catch {
    const preview = text.replace(/\s+/g, " ").slice(0, 120);
    throw new Error(
      preview.startsWith("<")
        ? `Server error (${res.status}). Restart the dev server and try again.`
        : preview || `Server error (${res.status})`,
    );
  }
}
