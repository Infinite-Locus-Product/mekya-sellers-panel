/** Public env for browser bundle — validated where critical paths run (client). */
export function getPublicApiUrl(): string {
  const url = process.env.NEXT_PUBLIC_API_URL
  if (!url || url.trim() === "") {
    return "http://localhost:3000/api"
  }
  return url.replace(/\/$/, "")
}
