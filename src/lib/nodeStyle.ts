export function getNodeLinkColor(styleJson: string | null | undefined, fallback: string): string {
  if (!styleJson) return fallback;
  try {
    const styles = JSON.parse(styleJson) as { linkColor?: unknown };
    if (typeof styles.linkColor === 'string' && styles.linkColor.length > 0) {
      return styles.linkColor;
    }
  } catch {
    // Neplatný JSON ignorujeme a vrátíme výchozí barvu
  }
  return fallback;
}
