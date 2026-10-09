// STUB — real Privacy meter: issue #6 (lead). Counts network requests made after start (ADR-0007).
export function startPrivacyMeter(): { bytesSent(): number; requests(): string[]; stop(): void } {
  const urls: string[] = []
  return { bytesSent: () => 0, requests: () => urls, stop: () => {} }
}
