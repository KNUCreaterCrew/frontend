export function previewHref(scenario: string, link: { path: string; seat?: string }): string {
  const params = new URLSearchParams({ scenario })
  if (link.seat) params.set('seat', link.seat)
  return `${link.path}?${params.toString()}`
}
